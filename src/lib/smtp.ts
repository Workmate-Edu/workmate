// This file is no longer used as we've switched to using the Zeptomail API directly.
// Keeping this file as a reference in case we need SMTP configuration in the future.

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',  // Using 'gmail' service instead of manual host/port
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false  // Helps with self-signed certificates
  },
  debug: true,  // Enable debug logs
  logger: true  // Enable logger
});

// Verify SMTP connection configuration
const verifyConnection = async () => {
  try {
    await transporter.verify();
    console.log('SMTP server is ready to send emails');
    console.log('✅ SMTP server connection established successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection error:', error);
    console.log('📧 Email credentials being used:', {
      user: process.env.SMTP_USER,
      // Not logging password for security
    });
    return false;
  }
};

// Initial verification
verifyConnection();

export default transporter;
