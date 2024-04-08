const nodemailer = require('nodemailer');

// Create a transporter for nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_USE_TLS === 'false', // true for 465, false for other ports. Adjust based on your SMTP server's requirements.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to send an email
const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.DEFAULT_EMAIL_FROM, // Sender address from environment variable
    to: options.to, // List of recipients
    subject: options.subject, // Subject line
    text: options.text, // Plain text body
    html: options.html, // HTML body content
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId); // Log the messageId of the sent email
  } catch (error) {
    console.error('Failed to send email:', error.message, error.stack); // Log the entire error message and stack trace
    throw error; // Rethrow the error for further handling
  }
};

module.exports = { sendEmail };