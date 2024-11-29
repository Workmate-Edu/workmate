import fs from 'fs';
import path from 'path';
import transporter from './smtp';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const loadTemplate = (templateName: string): string => {
  try {
    const filePath = path.join(process.cwd(), 'email-templates', `${templateName}.html`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template ${templateName} not found at ${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error loading template ${templateName}:`, error);
    throw error;
  }
};

interface EmailPayload {
  to: string;
  subject: string;
  template: string;
  replacements: Record<string, string>;
}

const sendEmailWithRetry = async (mailOptions: any, retryCount = 0): Promise<any> => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error(`❌ Error sending email (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error);
    
    if (retryCount < MAX_RETRIES - 1) {
      console.log(`📨 Retrying in ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY);
      return sendEmailWithRetry(mailOptions, retryCount + 1);
    }
    
    throw error;
  }
};

const sendEmail = async ({ to, subject, template, replacements }: EmailPayload) => {
  try {
    console.log('📧 Preparing to send email to:', to);
    
    // Load and process the email template
    let htmlContent = loadTemplate(template);
    Object.keys(replacements).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, replacements[key]);
    });

    // Prepare email options
    const mailOptions = {
      from: {
        name: 'Workmate Learning',
        address: process.env.SMTP_USER as string
      },
      to,
      subject,
      html: htmlContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    console.log('📝 Email content prepared, attempting to send...');
    return await sendEmailWithRetry(mailOptions);

  } catch (error) {
    console.error('❌ Error in sendEmail:', error);
    throw error;
  }
};

export default sendEmail;
