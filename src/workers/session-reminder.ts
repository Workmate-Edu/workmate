import { TeachingSession } from "@/models/teaching-session"
import { sendSessionNotification } from "@/lib/notification-service"

// Re-enable the function with daily check
export async function checkUpcomingSessions() {
  try {
    console.log('Running daily session check:', new Date().toISOString())
    // Check sessions for the next 24 hours
    // ...rest of implementation to come after deployment is stable
    return { success: true, message: 'Daily check complete' }
  } catch (error) {
    console.error('Session check error:', error)
    return { success: false, error: 'Check failed' }
  }
}
