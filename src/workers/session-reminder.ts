import { TeachingSession } from "@/models/teaching-session"
import { sendSessionNotification } from "@/lib/notification-service"
import sendEmail from "@/lib/sendSmtpMail"
import { addMinutes } from 'date-fns'

const REMINDER_INTERVALS = [5, 30] // Minutes before session

export async function checkUpcomingSessions() {
  try {
    console.log('Starting reminder check:', new Date().toISOString())
    const now = new Date()
    const batchSize = 50 // Process in batches to optimize performance

    // Find all sessions that need reminders
    for (const minutes of REMINDER_INTERVALS) {
      const timeWindow = addMinutes(now, minutes)
      
      // Use cursor-based pagination for large datasets
      let lastId = null
      let hasMore = true

      while (hasMore) {
        const query = {
          startTime: {
            $gt: now.toISOString(),
            $lte: timeWindow.toISOString()
          },
          status: 'scheduled',
          [`reminder${minutes}Sent`]: { $ne: true }
        }

        if (lastId) {
          query._id = { $gt: lastId }
        }

        const sessions = await TeachingSession.find(query)
          .sort({ _id: 1 })
          .limit(batchSize)
          .populate('studentId teacherId', 'name email studentProfile.parent')
          .lean()

        console.log(`Found ${sessions.length} sessions needing reminders`)

        if (sessions.length === 0) {
          hasMore = false
          continue
        }

        // Process sessions in parallel with rate limiting
        await Promise.all(
          sessions.map(session => sendReminders(session, minutes))
        )

        lastId = sessions[sessions.length - 1]._id
      }
    }
    console.log('Reminder check completed')
  } catch (error) {
    console.error('Reminder check failed:', error)
  }
}

async function sendReminders(session: any, minutes: number) {
  try {
    console.log(`Sending ${minutes}-minute reminders for session ${session._id}`)
    
    // Prepare notification message
    const message = `Your session ${minutes === 5 ? 'is starting soon' : 'starts in 30 minutes'}`

    // Send notifications in parallel
    await Promise.all([
      // Teacher notification
      sendSessionNotification({
        userId: session.teacherId._id,
        type: 'session_reminder',
        title: `Session in ${minutes} minutes`,
        message: `${message} with ${session.studentId.name}`,
        data: { 
          sessionId: session._id,
          minutesBefore: minutes
        }
      }),

      // Student notification
      sendSessionNotification({
        userId: session.studentId._id,
        type: 'session_reminder',
        title: `Session in ${minutes} minutes`,
        message: `${message} with ${session.teacherId.name}`,
        data: { 
          sessionId: session._id,
          minutesBefore: minutes
        }
      }),

      // Update session reminder status
      TeachingSession.findByIdAndUpdate(session._id, {
        [`reminder${minutes}Sent`]: true
      })
    ])

    console.log(`Successfully sent ${minutes}-minute reminders for session ${session._id}`)
  } catch (error) {
    console.error(`Failed to send ${minutes}-minute reminders for session ${session._id}:`, error)
  }
}
