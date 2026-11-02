// utils/sendEmail.ts
import { renderEmail } from './render-email';
import transporter from './smtp';  // Import your SMTP configuration


interface EmailPayload {
  to: string;
  subject: string;
  template: string;  // The template name (e.g. "signup")
  replacements: Record<string, string>;  // Data to replace dynamic fields in the template
  attachments?: Array<{
    filename: string;
    content: string;
  }>;
}

const sendEmail = async ({ to, subject, template, replacements }: EmailPayload) => {
  try {
    if (!to || !to.includes('@')) {
      throw new Error('Invalid recipient email address');
    }

    // Load the email template
    const htmlContent = renderEmail(template, replacements);

    // Define email options
    const mailOptions = {
      from: '"Workmate Team" <noreply@workmateteam.com>',  // Sender info
      to,
      subject,
      html: htmlContent,  // The processed HTML with dynamic data replaced
    };

    // Send the email using nodemailer
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export default sendEmail;
