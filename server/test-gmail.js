require('dotenv').config();
const nodemailer = require('nodemailer');

async function testGmail() {
  console.log("Testing Gmail SMTP with user:", process.env.EMAIL_USER);
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"AgentHire" <${process.env.EMAIL_USER}>`,
      to: 'manchatlagnyani@gmail.com', // testing external candidate recipient!
      subject: 'Test Interview Invite via AgentHire',
      text: 'Congratulations! This is a test email sent to an external candidate address via Gmail SMTP.'
    });

    console.log("Message sent successfully! MessageId:", info.messageId);
  } catch (err) {
    console.error("Gmail SMTP error:", err);
  }
}

testGmail();
