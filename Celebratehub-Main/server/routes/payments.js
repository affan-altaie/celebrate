const express = require("express");
const router = express.Router();
const Payment = require("../modals/Payment");
const User = require("../modals/User");
const Booking = require("../modals/Booking");
const { validate, paymentCardValidation } = require("../middleware/validation");

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
