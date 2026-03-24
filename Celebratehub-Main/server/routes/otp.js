const express = require("express");
const router = express.Router();
const User = require("../modals/User");
const nodemailer = require("nodemailer");

router.post("/resend-otp", async (req, res) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email credentials are not set.");
      return res.status(500).json({ message: "Email service is not configured." });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.role !== "customer") {
      return res.status(403).json({ message: "OTP resend is only available for customer accounts." });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify your email",
      text: `Your new OTP for email verification is: ${otp}`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findOne({
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP or OTP has expired" });
    }

    if (user.role === "customer") {
      user.status = "approved";
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      res.json({ message: "Email verified successfully" });
    } else {
      // For providers, OTP verification does not change their status from pending (admin approval)
      res.status(403).json({ message: "OTP verification is not applicable for this account type." });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;