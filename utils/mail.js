const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) create transport
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) define the mail option, send the mail
  await transport.sendMail({
    from: 'Zeke Gan <zekegan@gmail.com>',
    to: options.to,
    subject: options.subject,
    text: options.message,
  });
};

module.exports = sendEmail;
