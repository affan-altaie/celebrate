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
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
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
