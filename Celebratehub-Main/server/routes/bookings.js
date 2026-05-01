
const express = require('express');
const router = express.Router();
const Booking = require('../modals/Booking');
const User = require('../modals/User');
const Payment = require('../modals/Payment');
const { validate, paymentCardValidation } = require('../middleware/validation');
const nodemailer = require('nodemailer');
const path = require('path');

// NODEMAILER TRANSPORTER SETUP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// EMAIL SENDING FUNCTIONS
const sendBookingConfirmationEmail = async (user, booking, service) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Booking Confirmation - CelebrateHub',
    html: getEnglishEmail(user, booking, service),
    attachments: [{
      filename: 'logo2-cut.png',
      path: path.join(__dirname, '../assets/logo2-cut.png'),
      cid: 'logo'
    }]
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent.');
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
};

const sendBalanceUpdateEmail = async (user, lastFour, amount, newBalance) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your Card Balance Update',
      html: getEnglishBalanceEmail(user, lastFour, amount, newBalance),
      attachments: [{
          filename: 'logo2-cut.png',
          path: path.join(__dirname, '../assets/logo2-cut.png'),
          cid: 'logo'
      }]
    };
    try {
      await transporter.sendMail(mailOptions);
      console.log('Balance update email sent.');
    } catch (error) {
      console.error('Error sending balance update email:', error);
    }
  };

// EMAIL TEMPLATES
const getEnglishEmail = (user, booking, service) => {
    return `
    <div style="background-color: #f4f7fc; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background-color: #ffffff; color: #333; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:logo" alt="CelebrateHub" style="max-width: 200px;"/>
        </div>
        <h2 style="text-align: center; color: #6a5af9;">Booking Confirmed!</h2>
        <p>Dear ${user.name || 'Valued Customer'},</p>
        <p>Your booking for <strong>${service.name}</strong> has been successfully processed.</p>
        <div style="border-top: 1px solid #eee; margin: 20px 0; padding-top: 20px;">
          <h3 style="margin-bottom: 20px; color: #333;">Your Receipt</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Service:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${service.name}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Price:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">OMR ${service.price.toFixed(2)}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${booking.date}</td></tr>
              <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Time:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${booking.time}</td></tr>
              <tr><td style="padding: 10px;"><strong>Location:</strong></td><td style="padding: 10px; text-align: right;">${booking.location}</td></tr>
            </tbody>
          </table>
        </div>
        <p style="font-style: italic; color: #777; margin-top: 20px;">Please keep this receipt for your records.</p>
        <br>
        <p style="text-align: center; margin-top: 20px; color: #555;">Thank you for choosing CelebrateHub!</p>
      </div>
    </div>
  `;
  }
  
  const getEnglishBalanceEmail = (user, lastFour, amount, newBalance) => {
    const today = new Date();
    const date = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return `
    <div style="background-color: #f4f7fc; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background-color: #ffffff; color: #333; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:logo" alt="CelebrateHub" style="max-width: 200px;"/>
        </div>
        <h2 style="text-align: center; color: #6a5af9;">Transaction Notification</h2>
        <p>Dear ${user.username || 'Valued Customer'},</p>
        <p>Your card ....${lastFour} was used successfully for OMR ${amount.toFixed(2)} at CelebrateHub on ${date}.</p>
        <p>Your current balance is OMR ${newBalance.toFixed(2)}.</p>
        <p style="text-align: center; margin-top: 20px; color: #555;">Thank you for using CelebrateHub!</p>
      </div>
    </div>
  `;
  }

// MAIN BOOKING ROUTE
router.post('/', async (req, res) => {
  try {
    const {
        userId, serviceId, serviceName, date, time, hours, totalPrice, location, 
        payment, // { cardNumber, expiryDate, cvc, cardHolderName }
        useSavedCard, // boolean
        saveCard // boolean
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.walletBalance < totalPrice) {
        return res.status(400).json({ message: `Insufficient funds. Your balance is OMR ${user.walletBalance.toFixed(2)}` });
    }

    let cardDetails;
    if (useSavedCard && user.savedCard) {
        cardDetails = user.savedCard;
    } else {
        cardDetails = payment;
        if (saveCard) {
            user.savedCard = { 
                cardNumber: payment.cardNumber, 
                expiryDate: payment.expiryDate, 
                cardHolderName: payment.cardHolderName 
            };
        }
    }

    // Deduct from wallet and save user
    user.walletBalance -= totalPrice;
    await user.save();

    // Create Booking
    const newBooking = new Booking({ userId, serviceId, serviceName, date, time, hours, totalPrice, location, status: 'confirmed' });
    await newBooking.save();

    // Create Payment Record
    const lastFour = cardDetails.cardNumber.slice(-4);
    const transactionId = 'CH-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newPayment = new Payment({
        bookingId: newBooking._id,
        userId,
        amount: totalPrice,
        cardHolderName: cardDetails.cardHolderName,
        lastFourDigits: lastFour,
        transactionId,
        status: 'completed',
    });
    await newPayment.save();

    // Send Emails
    const serviceDetails = { name: serviceName, price: totalPrice };
    await sendBookingConfirmationEmail(user, newBooking, serviceDetails);
    await sendBalanceUpdateEmail(user, lastFour, totalPrice, user.walletBalance);

    res.status(201).json({ message: 'Booking created successfully', booking: newBooking });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

module.exports = router;
