const express = require("express");
const router = express.Router();
const path = require("path");
const Payment = require("../modals/Payment");
const User = require("../modals/User");
const Booking = require("../modals/Booking");
const { validate, paymentCardValidation } = require("../middleware/validation");
const { encrypt, decrypt } = require("../utils/cryptoUtils");
const nodemailer = require("nodemailer");

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

const sendSubscriptionBalanceEmail = async (user, amount, newBalance, tier, cardLast4) => {
    const today = new Date();
    const date = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Payment Confirmation – CelebrateHub Subscription",
        html: `
        <div style="background-color: #f4f7fc; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background-color: #ffffff; color: #333; padding: 30px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="cid:logo" alt="CelebrateHub" style="max-width: 200px;"/>
            </div>
            <p>Hello ${user.username || user.name || "Valued Customer"},</p>
            ${cardLast4 ?
              `<p>Your card ending in ${cardLast4} was successfully charged OMR ${amount.toFixed(2)} for your CelebrateHub ${tier} subscription on ${date}.</p>` :
              `<p>A transaction of OMR ${amount.toFixed(2)} was processed successfully at CelebrateHub on ${date}.</p>`
            }
            <p>Your current account balance is OMR ${newBalance.toFixed(2)}.</p>
            <p>Thank you for being part of CelebrateHub!<br>If you have any questions, our support team is available 24/7 to assist you.</p>
            <p>Best regards,<br>CelebrateHub Billing Team</p>
          </div>
        </div>
        `,
        attachments: [{
            filename: "logo2-cut.png",
            path: path.join(__dirname, "../assets/logo2-cut.png"),
            cid: "logo"
        }]
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log("Subscription balance update email sent.");
    } catch (error) {
        console.error("Error sending subscription balance update email:", error);
    }
};

// Get user balance and saved card
router.get("/balance/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Return default 1000 if walletBalance is missing (for older accounts)
    const balance = typeof user.walletBalance === "number" ? user.walletBalance : 1000;
    
    let savedCard = null;
    if (user.savedCard && user.savedCard.cardNumber) {
      savedCard = {
        ...user.savedCard.toObject(),
        cardNumber: decrypt(user.savedCard.cardNumber),
        cvv: ""
      };
    }

    res.json({
      balance,
      savedCard,
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
router.put("/update-card/:userId", paymentCardValidation, validate, async (req, res) => {
  try {
    const { cardHolderName, cardNumber, expiryDate } = req.body; // Removed cvv and oldCvv
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Removed oldCvv validation block

    user.savedCard = {
      cardHolderName,
      cardNumber: encrypt(cardNumber),
      expiryDate,
      cvv: user.savedCard ? user.savedCard.cvv : undefined // Preserve existing encrypted CVV
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

// Process subscription purchase
router.post("/subscribe", async (req, res) => {
  try {
    const { userId, tier, billingCycle, cardDetails, agreedToTerms, saveCard } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Define plan hierarchy
    const planRank = { 'Standard': 0, 'Pro': 1, 'Pro Plus': 2 };
    const currentTier = user.subscriptionTier || 'Standard';
    
    // Prevent downgrade
    if (planRank[tier] < planRank[currentTier]) {
      return res.status(400).json({ success: false, message: "Downgrading is not permitted." });
    }

    let amount = 0;
    if (tier === "Pro") {
      amount = billingCycle === "monthly" ? 10 : 100;
    } else if (tier === "Pro Plus") {
      amount = billingCycle === "monthly" ? 15 : 125;
    } else if (tier === "Standard") {
      amount = 0;
    }

    let cardLast4 = null;
    // If card details are provided, simulate a successful transaction
    // Otherwise, check wallet balance
    let paidWithWallet = false;
    if (amount > 0 && !cardDetails) {
      if (user.walletBalance < amount) {
        return res.status(400).json({ success: false, message: "Insufficient balance" });
      }
      user.walletBalance -= amount;
      paidWithWallet = true;
    } else if (amount > 0 && cardDetails) {
      if (!agreedToTerms) {
        return res.status(400).json({ success: false, message: "You must agree to the terms and conditions." });
      }
      // In a real scenario, we would call a payment gateway here
      // For simulation, we'll just update the user's saved card if chosen
      if (saveCard) {
        user.savedCard = {
          cardHolderName: cardDetails.cardHolderName,
          cardNumber: encrypt(cardDetails.cardNumber),
          expiryDate: cardDetails.expiryDate,
          cvv: encrypt(cardDetails.cvv)
        };
      }
      cardLast4 = cardDetails.cardNumber.slice(-4);
    }

    // Update subscription details
    user.subscriptionTier = tier;
    user.subscriptionBillingCycle = billingCycle;
    
    const expiryDate = new Date();
    if (billingCycle === "monthly") {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else if (billingCycle === "annually") {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else {
      user.subscriptionExpiry = null;
    }
    
    if (tier !== "Standard") {
      user.subscriptionExpiry = expiryDate;
    } else {
      user.subscriptionExpiry = null;
    }

    await user.save();

    // Create a payment record
    const payment = new Payment({
      userId: user._id,
      amount,
      cardHolderName: cardDetails?.cardHolderName || user.savedCard?.cardHolderName || "Wallet",
      transactionId: `SUB-${Date.now()}`,
      status: 'completed'
    });
    await payment.save();

    // Send email notification for any paid subscription (if amount > 0)
    if (amount > 0) {
        await sendSubscriptionBalanceEmail(user, amount, user.walletBalance, tier, cardLast4);
    }

    res.status(200).json({ 
      success: true, 
      message: `Successfully subscribed to ${tier} plan`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        subscriptionExpiry: user.subscriptionExpiry,
        subscriptionBillingCycle: user.subscriptionBillingCycle,
        walletBalance: user.walletBalance,
        savedCard: user.savedCard ? {
          cardHolderName: user.savedCard.cardHolderName,
          cardNumber: decrypt(user.savedCard.cardNumber),
          expiryDate: user.savedCard.expiryDate
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
