const nodemailer = require('nodemailer');
const path = require('path');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Celebratehub <hello@celebratehub.com>',
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: sans-serif; text-align: center;">
        <img src="cid:logo" alt="CelebrateHub" style="width: 200px;"/>
        <div style="text-align: left; padding: 20px;">
          <p>${options.message}</p>
          ${!options.skipFooter ? `
          <p>If you have any questions, please contact our support team.</p>
          <p>Thank you,</p>
          <p>The CelebrateHub Team</p>
          ` : ''}
        </div>
      </div>
    `,
    attachments: [{
      filename: 'logo2-cut.png',
      path: path.join(__dirname, '../assets/logo2-cut.png'),
      cid: 'logo' 
    }]
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
