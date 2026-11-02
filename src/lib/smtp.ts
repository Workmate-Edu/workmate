// utils/smtp.ts

import nodemailer from 'nodemailer';

const passKey = process.env.ZEPTOMAIL_API_KEY || process.env.NEXT_PUBLIC_ZEPTOMAIL_API_KEY

const transporter = nodemailer.createTransport({
  host: 'smtp.zeptomail.com',
  port: 465,
  secure: true, // true for SSL
  auth: {
    user: 'emailapikey',
    pass: passKey,
  },
  debug: false,
});

export default transporter;
