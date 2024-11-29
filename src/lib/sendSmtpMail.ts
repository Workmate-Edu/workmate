// utils/sendEmail.ts
import fs from 'fs';
import path from 'path';
import axios from 'axios';

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

const sendEmail = async ({ to, subject, template, replacements }: EmailPayload) => {
  try {
    // Load and process the email template
    let htmlContent = loadTemplate(template);
    Object.keys(replacements).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, replacements[key]);
    });

    // Get and validate environment variables
    const token = "Zoho-enczapikey wSsVR6118kGkC6l9nz2lIuhpzQ9UU1v/RER1iwOk7n7/H6iRpcc8lxCcBgXySPcWEDJsFTNDoep7yUpT2jcGht0omQpUCSiF9mqRe1U4J3x17qnvhDzOXWtYlhSBKIsJxwhjmGVkFMBu";
    const bounceAddress = process.env.ZEPTOMAIL_BOUNCE_ADDRESS?.trim() || "bounce@diboruwa.com";
    const fromAddress = process.env.ZEPTOMAIL_FROM_ADDRESS?.trim() || "noreply@diboruwa.com";

    // Prepare the Zeptomail API request
    const emailPayload = {
      bounce_address: bounceAddress,
      from: {
        address: fromAddress,
        name: "Workmate Learning"
      },
      to: [
        {
          email_address: {
            address: to,
            name: replacements.name || to.split('@')[0]
          }
        }
      ],
      subject: subject,
      htmlbody: htmlContent
    };

    console.log('Sending email with payload:', JSON.stringify(emailPayload, null, 2));

    // Send email using Zeptomail API
    const response = await axios({
      method: 'post',
      url: 'https://api.zeptomail.com/v1.1/email',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': token
      },
      data: emailPayload
    });

    if (response.status === 200) {
      console.log('Email sent successfully:', {
        requestId: response.data.request_id,
        message: response.data.message,
        to: emailPayload.to[0].email_address.address,
        subject: emailPayload.subject
      });
      return response.data;
    } else {
      throw new Error(`Zeptomail API returned status ${response.status}`);
    }

  } catch (error) {
    console.error('Error sending email:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Zeptomail API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      // Throw the actual error message from Zeptomail if available
      if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw error;
  }
};

export default sendEmail;
