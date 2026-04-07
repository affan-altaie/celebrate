const express = require("express");
const router = express.Router();
const path = require("path");
const Payment = require("../modals/Payment");
const User = require("../modals/User");
const Booking = require("../modals/Booking");
const { validate, paymentCardValidation } = require("../middleware/validation");
const nodemailer = require("nodemailer");

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noreply.celebrate.hub@gmail.com", // Your email
    pass: "vtshekntlzwmxvky", // Your email password or app password
  },
});

// Function to send booking confirmation email
const sendBookingConfirmationEmail = async (user, booking, service) => {
  const language = user.language || "en";

  const mailOptions = {
    from: "noreply.celebrate.hub@gmail.com",
    to: user.email,
    subject: language === "ar" ? "تأكيد الحجز - CelebrateHub" : "Booking Confirmation - CelebrateHub",
    html: language === "ar" ? getArabicEmail(user, booking, service) : getEnglishEmail(user, booking, service),
    attachments: [{
        filename: 'logo2-cut.png',
        path: path.join(__dirname, '../assets/logo2-cut.png'),
        cid: 'logo' 
    }]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Booking confirmation email sent successfully.");
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
  }
};

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
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Price:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">OMR ${service.price}</td></tr>
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

const getArabicEmail = (user, booking, service) => {
  return `
  <div dir="rtl" style="background-color: #f4f7fc; padding: 20px; font-family: Arial, sans-serif;">
    <div style="background-color: #ffffff; color: #333; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="cid:logo" alt="CelebrateHub" style="max-width: 200px;"/>
      </div>
      <h2 style="text-align: center; color: #6a5af9;">تم تأكيد الحجز!</h2>
      <p>عزيزي ${user.name || 'العميل الكريم'},</p>
      <p>تمت معالجة حجزك لـ <strong>${service.name}</strong> بنجاح.</p>
      <div style="border-top: 1px solid #eee; margin: 20px 0; padding-top: 20px;">
        <h3 style="margin-bottom: 20px; color: #333;">إيصالك</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>الخدمة:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">${service.name}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>السعر:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">${service.price} ر.ع.</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>التاريخ:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">${booking.date}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>الوقت:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">${booking.time}</td></tr>
            <tr><td style="padding: 10px;"><strong>الموقع:</strong></td><td style="padding: 10px; text-align: left;">${booking.location}</td></tr>
          </tbody>
        </table>
      </div>
      <p style="font-style: italic; color: #777; margin-top: 20px;">يرجى الاحتفاظ بهذا الإيصال لسجلاتك.</p>
      <br>
      <p style="text-align: center; margin-top: 20px; color: #555;">شكرًا لاختيارك CelebrateHub!</p>
    </div>
  </div>
`;
}

// Function to send balance update email
const sendBalanceUpdateEmail = async (user, lastFour, amount, newBalance) => {
  const language = user.language || "en";

  const mailOptions = {
    from: "noreply.celebrate.hub@gmail.com",
    to: user.email,
    subject: language === "ar" ? "تحديث رصيد بطاقتك" : "Your Card Balance Update",
    html: language === "ar" ? getArabicBalanceEmail(user, lastFour, amount, newBalance) : getEnglishBalanceEmail(user, lastFour, amount, newBalance),
    attachments: [{
        filename: 'logo2-cut.png',
        path: path.join(__dirname, '../assets/logo2-cut.png'),
        cid: 'logo' 
    }]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Balance update email sent successfully.");
  } catch (error) {
    console.error("Error sending balance update email:", error);
  }
};

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
      <p>Your card ....${lastFour} was used successfully for OMR ${amount} at CelebrateHub on ${date}.</p>
      <p>Your current balance is OMR ${newBalance}.</p>
      <p style="text-align: center; margin-top: 20px; color: #555;">Thank you for using CelebrateHub!</p>
    </div>
  </div>
`;
}

const getArabicBalanceEmail = (user, lastFour, amount, newBalance) => {
  const today = new Date();
  const date = today.toLocaleDateString('ar-OM', { year: 'numeric', month: 'long', day: 'numeric' });
  return `
  <div dir="rtl" style="background-color: #f4f7fc; padding: 20px; font-family: Arial, sans-serif;">
    <div style="background-color: #ffffff; color: #333; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="cid:logo" alt="CelebrateHub" style="max-width: 200px;"/>
      </div>
      <h2 style="text-align: center; color: #6a5af9;">إشعار معاملة</h2>
      <p>عزيزي ${user.username || 'العميل الكريم'},</p>
      <p>تم استخدام بطاقتك ....${lastFour} بنجاح لمبلغ ${amount} ر.ع. في CelebrateHub بتاريخ ${date}.</p>
      <p>رصيدك الحالي هو ${newBalance} ر.ع.</p>
      <p style="text-align: center; margin-top: 20px; color: #555;">شكرًا لاستخدامك CelebrateHub!</p>
    </div>
  </div>
`;
}


// Process dummy payment
router.post("/process", paymentCardValidation, validate, async (req, res) => {
  try {
    const {
      userId,
      serviceId,
      serviceName,
      amount,
      cardHolderName,
      cardNumber,
      expiryDate,
      cvc,
      bookingDetails,
      language,
    } = req.body;

    // 1. Find user and check balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.walletBalance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient dummy funds! Your balance is OMR ${user.walletBalance.toFixed(2)}`,
      });
    }

    // 2. Create Booking record
    const newBooking = new Booking({
      userId,
      serviceId,
      serviceName,
      date: bookingDetails.date,
      time: bookingDetails.time,
      hours: bookingDetails.hours,
      totalPrice: amount,
      location: bookingDetails.location,
      status: "confirmed",
    });
    await newBooking.save();

    // 3. Deduct dummy money
    user.walletBalance -= amount;

    //Update user language
    if (language) {
      user.language = language;
    }

    // Optional: Save card info if requested
    if (req.body.saveCard) {
      user.savedCard = {
        cardNumber: cardNumber,
        expiryDate: expiryDate,
        cardHolderName: cardHolderName,
        // cvc: cvc, // CVC should not be stored
      };
    }

    await user.save();

    // 4. Create Payment record
    const lastFour = cardNumber.slice(-4);
    const transactionId = "CH-" + Math.random().toString(36).substr(2, 9).toUpperCase();

    const newPayment = new Payment({
      bookingId: newBooking._id,
      userId,
      amount,
      cardHolderName,
      lastFourDigits: lastFour,
      transactionId,
      status: "completed",
    });
    await newPayment.save();

    // 5. Send confirmation email
    await sendBookingConfirmationEmail(user, newBooking, { name: serviceName, price: amount });

    // 6. Send balance update email
    await sendBalanceUpdateEmail(user, lastFour, amount, user.walletBalance);


    res.status(200).json({
      success: true,
      transactionId,
      newBalance: user.walletBalance,
      bookingId: newBooking._id,
    });
  } catch (error) {
    console.error("Payment error:", error);
    console.error("Update card error:", error);
    res.status(500).json({ success: false, message: error.message || "An unknown error occurred" });
  }
});

// Get user balance and saved card
router.get("/balance/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Return default 1000 if walletBalance is missing (for older accounts)
    const balance = typeof user.walletBalance === "number" ? user.walletBalance : 1000;
    res.json({
      balance,
      savedCard: user.savedCard || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user bookings
router.get("/user-bookings/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update saved card details
router.put("/update-card/:userId", validate, async (req, res) => {
  try {
    const { cardHolderName, cardNumber, expiryDate } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.savedCard = {
      cardHolderName,
      cardNumber,
      expiryDate,
    };

    await user.save();
    res.status(200).json({ success: true, message: "Card details updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete saved card details
router.delete("/delete-card/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.savedCard = null; // Or set to an empty object, depending on schema
    await user.save();
    res.status(200).json({ success: true, message: "Card details deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
