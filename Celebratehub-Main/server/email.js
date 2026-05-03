const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendDeletionEmail = (to, reason, serviceName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Service Deletion Notification',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
        <img src="cid:logo" alt="CelebrateHub" style="width: 150px; margin-bottom: 20px;">
        <h1 style="color: #D9534F;">Service Deleted</h1>
        <p>Dear Provider,</p>
        <p>Your service, <strong>${serviceName}</strong>, has been removed from CelebrateHub.</p>
        <p><strong>Reason for deletion:</strong></p>
        <p style="background-color: #f2f2f2; padding: 10px; border-radius: 5px;">${reason}</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Thank you,</p>
        <p>The CelebrateHub Team</p>
      </div>
    `,
    attachments: [{
      filename: 'logo2-cut.png',
      path: path.join(__dirname, 'assets/logo2-cut.png'),
      cid: 'logo' 
    }]
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = { sendDeletionEmail };
