import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

export const sendBulkEmail = async (recipients, subject, html, attachments = []) => {
  const transporter = createTransporter();
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: recipient,
        subject,
        html,
        attachments,
      });
      results.push({ email: recipient, success: true, messageId: info.messageId });
    } catch (error) {
      results.push({ email: recipient, success: false, error: error.message });
    }
  }
  
  return results;
};