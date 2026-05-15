
const express = require("express");
const router = express.Router();
const Booking = require("../modals/Booking");
const User = require("../modals/User");
const Payment = require("../modals/Payment");
const Service = require("../modals/Service");
const Review = require("../modals/Review");
const { validate, paymentCardValidation } = require("../middleware/validation");
const { encrypt, decrypt } = require("../utils/cryptoUtils");
const nodemailer = require("nodemailer");
const path = require("path");

// NODEMAILER TRANSPORTER SETUP
const transporter = nodemailer.createTransport({
  service: "gmail",
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
    subject: "Booking Confirmation - CelebrateHub",
    html: getEnglishEmail(user, booking, service),
    attachments: [{
      filename: "logo2-cut.png",
      path: path.join(__dirname, "../assets/logo2-cut.png"),
      cid: "logo"
    }]
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Booking confirmation email sent.");
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
  }
};

const sendBalanceUpdateEmail = async (user, lastFour, amount, newBalance) => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your Card Balance Update",
      html: getEnglishBalanceEmail(user, lastFour, amount, newBalance),
      attachments: [{
          filename: "logo2-cut.png",
          path: path.join(__dirname, "../assets/logo2-cut.png"),
          cid: "logo"
      }]
    };
    try {
      await transporter.sendMail(mailOptions);
      console.log("Balance update email sent.");
    } catch (error) {
      console.error("Error sending balance update email:", error);
    }
  };

const sendBookingRejectionEmail = async (user, booking, reason) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Booking Rejected - CelebrateHub",
    html: getEnglishRejectionEmail(user, booking, reason),
    attachments: [{
      filename: "logo2-cut.png",
      path: path.join(__dirname, "../assets/logo2-cut.png"),
      cid: "logo"
    }]
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Booking rejection email sent.");
  } catch (error) {
    console.error("Error sending booking rejection email:", error);
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
        <p>Dear ${user.name || "Valued Customer"},</p>
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
    const date = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    return `
    <div style="background-color: #f4f7fc; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background-color: #ffffff; color: #333; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:logo" alt="CelebrateHub" style="max-width: 200px;"/>
        </div>
        <h2 style="text-align: center; color: #6a5af9;">Transaction Notification</h2>
        <p>Dear ${user.username || user.name || "Valued Customer"},</p>
        <p>A transaction of OMR ${amount.toFixed(2)} was processed successfully at CelebrateHub on ${date}.</p>
        <p>Your current balance is OMR ${newBalance.toFixed(2)}.</p>
        <p style="text-align: center; margin-top: 20px; color: #555;">Thank you for using CelebrateHub!</p>
      </div>
    </div>
  `;
  }

  const getEnglishRejectionEmail = (user, booking, reason) => {
    return `
    <div style="background-color: #f4f7fc; padding: 20px; font-family: Arial, sans-serif;">
      <div style="background-color: #ffffff; color: #333; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:logo" alt="CelebrateHub" style="max-width: 200px;"/>
        </div>
        <h2 style="text-align: center; color: #f44336;">Booking Rejected</h2>
        <p>Dear ${user.username || user.name || "Valued Customer"},</p>
        <p>We regret to inform you that your booking for <strong>${booking.serviceName}</strong> has been rejected by the provider.</p>
        <div style="background-color: #fff4f4; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reason for Rejection:</strong> ${reason}</p>
        </div>
        <p>The total amount of <strong>OMR ${booking.totalPrice.toFixed(2)}</strong> has been refunded to your wallet balance.</p>
        <p style="text-align: center; margin-top: 20px; color: #555;">Thank you for choosing CelebrateHub!</p>
      </div>
    </div>
  `;
  }

// MAIN BOOKING ROUTE
router.post("/", async (req, res) => {
  try {
    const {
        userId, serviceId, serviceName, date, time, hours, totalPrice, location, 
        customerPhone, customerEmail,
        payment, // { cardNumber, expiryDate, cvc, cardHolderName }
        useSavedCard, // boolean
        saveCard // boolean
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingBooking = await Booking.findOne({ serviceId, date, time });
    if (existingBooking) {
      return res.status(409).json({ message: "This time slot has already been booked." });
    }

    if (user.walletBalance < totalPrice) {
        return res.status(400).json({ message: `Insufficient funds. Your balance is OMR ${user.walletBalance.toFixed(2)}` });
    }

    let cardDetails;
    if (useSavedCard && user.savedCard) {
        cardDetails = {
            ...user.savedCard.toObject(),
            cardNumber: decrypt(user.savedCard.cardNumber),
            cvv: decrypt(user.savedCard.cvv)
        };
        // Verify CVV for saved card
        if (req.body.cvv !== cardDetails.cvv) {
            return res.status(400).json({ message: "Invalid CVV for the saved card." });
        }
    } else {
        cardDetails = payment;
        if (saveCard) {
            user.savedCard = { 
                cardNumber: encrypt(payment.cardNumber), 
                expiryDate: payment.expiryDate, 
                cardHolderName: payment.cardHolderName,
                cvv: encrypt(payment.cvc || payment.cvv)
            };
        }
    }

    // Deduct from wallet and save user
    user.walletBalance -= totalPrice;
    await user.save();

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Create Booking
    const newBooking = new Booking({ 
      userId, 
      serviceId, 
      providerId: service.providerId, 
      serviceName, 
      date, 
      time, 
      hours, 
      totalPrice, 
      location, 
      customerPhone,
      customerEmail,
      status: "pending" 
    });
    await newBooking.save();

    // Update service availability to remove booked slot
    if (service && service.availability && service.availability[date]) {
        service.availability[date] = service.availability[date].filter(t => t !== time);
        service.markModified("availability");
        await service.save();
    }

    // Create Payment Record
    const lastFour = cardDetails.cardNumber.slice(-4);
    const transactionId = "CH-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const newPayment = new Payment({
        bookingId: newBooking._id,
        userId,
        amount: totalPrice,
        cardHolderName: cardDetails.cardHolderName,
        lastFourDigits: lastFour,
        transactionId,
        status: "completed",
    });
    await newPayment.save();

    // Send Emails
    const serviceDetails = { name: serviceName, price: totalPrice };
    await sendBookingConfirmationEmail(user, newBooking, serviceDetails);
    await sendBalanceUpdateEmail(user, lastFour, totalPrice, user.walletBalance);

    res.status(201).json({ message: "Booking created successfully", booking: newBooking });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Failed to create booking" });
  }
});

// GET PROVIDER BOOKINGS
router.get("/provider/:providerId", async (req, res) => {
  try {
    const bookings = await Booking.find({ providerId: req.params.providerId })
      .populate("userId", "username email phoneNumber")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch provider bookings" });
  }
});

// UPDATE BOOKING STATUS
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    if (status === "rejected" && reason) {
        booking.rejectionReason = reason;
    }
    await booking.save();

    // If rejected or cancelled, refund the user and restore availability
    if (status === "rejected" || status === "cancelled") {
      const user = await User.findById(booking.userId);
      if (user) {
        user.walletBalance += booking.totalPrice;
        await user.save();

        if (status === "rejected") {
            // Send rejection email
            await sendBookingRejectionEmail(user, booking, reason || "No reason provided");
            
            // Send balance update email
            const payment = await Payment.findOne({ bookingId: booking._id });
            const lastFour = payment ? payment.lastFourDigits : "XXXX";
            await sendBalanceUpdateEmail(user, lastFour, booking.totalPrice, user.walletBalance);
        }
      }

      const service = await Service.findById(booking.serviceId);
      if (service && service.availability && booking.date in service.availability) {
        service.availability[booking.date].push(booking.time);
        service.markModified("availability");
        await service.save();
      }
    }

    res.json({ message: "Booking status updated successfully", booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Failed to update booking status" });
  }
});

// GET USER BOOKINGS
router.get("/user/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .populate("providerId", "username email phoneNumber")
      .populate("serviceId", "images mainImageIndex")
      .sort({ createdAt: -1 });
    
    const bookingsWithReviewStatus = bookings.map(booking => ({
      ...booking.toObject(),
      hasReview: booking.isReviewed
    }));

    res.json(bookingsWithReviewStatus);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// CANCEL (DELETE) BOOKING
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Refund user
    const user = await User.findById(booking.userId);
    if (user) {
      user.walletBalance += booking.totalPrice;
      await user.save();
    }

    // Restore service availability
    const service = await Service.findById(booking.serviceId);
    if (service && service.availability && booking.date in service.availability) {
        service.availability[booking.date].push(booking.time);
        service.markModified("availability");
        await service.save();
    }

    // Delete the booking
    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Failed to cancel booking" });
  }
});

// GET SINGLE BOOKING
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booking" });
  }
});

module.exports = router;
