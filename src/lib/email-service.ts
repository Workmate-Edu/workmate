import sendEmail from "@/lib/sendSmtpMail"

interface NotificationData {
  teacher: {
    name: string
    email: string
  }
  student?: {
    name: string
    email: string
  }
  child?: {
    name: string
    grade: string
  }
  parent?: {
    name: string
    email: string
  }
  subject?: {
    name: string
    area?: string
  }
  admin?: {
    name: string
    email: string
  }
  assignments?: Array<{
    subject: {
      name: string;
      area: string;
    };
    teacher: {
      id: string;
      name: string;
    };
    relationshipId: string;
  }>;
}

export async function sendAssignmentNotifications(data: NotificationData) {
  const notifications = []
  const errors = []

  // Helper function for logging
  const logEmailAttempt = (type: string, recipient: string) => {
    console.log(`[EMAIL_SERVICE] Sending ${type} notification to ${recipient}`)
  }

  try {
    // Format subjects helper
    const formatSubjects = (assignments?: NotificationData['assignments']) => {
      if (!assignments?.length) return 'Multiple subjects';
      return assignments
        .map(a => `${a.subject.name} (${a.subject.area})`)
        .join(' and ');
    };

    const subjectsString = formatSubjects(data.assignments);

    // Teacher notification - format data for template
    logEmailAttempt('teacher', data.teacher.email)
    
    // Format grade and contact info based on student type
    const gradeInfo = data.child?.grade || "Not Applicable"
    const contactInfo = data.parent 
      ? `${data.parent.name} (${data.parent.email})`
      : data.student?.email || "Not Available"

    const teacherTemplateData = {
      teacherName: data.teacher.name,
      studentName: data.student?.name || data.child?.name || '',
      subjects: subjectsString,
      grade: gradeInfo,
      parentInfo: contactInfo,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard/teacher/students/${data.student?._id || data.child?._id}`,
      nextSteps: [
        'Review student assessment results',
        'Set up your teaching schedule',
        'Prepare initial learning materials',
        'Schedule first session'
      ]
    }

    notifications.push(
      sendEmail({
        to: data.teacher.email,
        template: 'teacher-assignment',
        subject: `New Student Assignment - ${teacherTemplateData.studentName}`,
        replacements: teacherTemplateData
      }).catch(error => {
        errors.push(`Teacher email failed: ${error.message}`)
      })
    )

    // Handle student notification if independent student
    if (data.student) {
      logEmailAttempt('student', data.student.email)
      const studentTemplateData = {
        studentName: data.student.name,
        teacherName: data.teacher.name,
        subjects: subjectsString,
        dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard/student/teachers`
      }
      notifications.push(
        sendEmail({
          to: data.student.email,
          template: 'student-teacher-assigned',
          subject: 'Your Teacher Has Been Assigned!',
          replacements: studentTemplateData
        }).catch(error => {
          errors.push(`Student email failed: ${error.message}`)
        })
      )
    }

    // Handle parent notification if child student
    if (data.child && data.parent) {
      logEmailAttempt('parent', data.parent.email)
      const parentTemplateData = {
        parentName: data.parent.name,
        childName: data.child.name,
        teacherName: data.teacher.name,
        subjects: subjectsString,
        grade: data.child.grade,
        dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard/parent/teachers`
      }
      notifications.push(
        sendEmail({
          to: data.parent.email,
          template: 'parent-teacher-assigned',
          subject: `Teacher Assigned for ${data.child.name}`,
          replacements: parentTemplateData
        }).catch(error => {
          errors.push(`Parent email failed: ${error.message}`)
        })
      )
    }

    // Handle admin notification
    logEmailAttempt('admin', data.admin.email)
    const adminTemplateData = {
      studentName: data.student?.name || data.child?.name || '',
      teacherName: data.teacher.name,
      subjects: subjectsString,
      studentType: data.student ? 'Independent Student' : 'Child',
    };
    notifications.push(
      sendEmail({
        to: data.admin.email,
        template: 'admin-assignment-notification',
        subject: `Teacher Assigned to ${adminTemplateData.studentName}`,
        replacements: adminTemplateData
      }).catch(error => {
        errors.push(`Admin email failed: ${error.message}`)
      })
    )

    // Wait for all notifications to complete
    await Promise.all(notifications)

    // Log any errors that occurred
    if (errors.length > 0) {
      console.error('[EMAIL_SERVICE] Some notifications failed:', errors)
      throw new Error('Some email notifications failed to send')
    }

    console.log('[EMAIL_SERVICE] All notifications sent successfully')
  } catch (error) {
    console.error('[EMAIL_SERVICE] Failed to send notifications:', error)
    throw error
  }
}
