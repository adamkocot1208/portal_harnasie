const nodemailer = require('nodemailer');
require('dotenv').config();

// Skonfiguruj transporter - dla testów możemy użyć Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || 'twój_user_mailtrap',
    pass: process.env.EMAIL_PASS || 'twoje_hasło_mailtrap'
  }
});

// Funkcja wysyłająca email
const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'portal@harnasie.pl',
    to: options.to,
    subject: options.subject,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email wysłany: ', info.messageId);
    return info;
  } catch (error) {
    console.error('Błąd wysyłania emaila:', error);
    throw error;
  }
};

module.exports = { sendEmail };