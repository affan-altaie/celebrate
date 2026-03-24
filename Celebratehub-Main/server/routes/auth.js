const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../modals/User");
const nodemailer = require("nodemailer");
const multer = require("multer");
const upload = multer();

// Register Endpoint
router.post("/register", upload.none(), async (req, res) => {
  console.log("Register request received:", req.body);
  try {
    console.log("Request body:", req.body);
    const { username, email, phoneNumber, password, role, location, document } = req.body;

    if (email === "admin@admin.com") {
      return res.status(400).json({ message: "This email is not allowed for registration" });
    }

    // Check if user already exists
    console.log("Checking for existing user...");
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.status === 'rejected') {
        // If user is rejected, allow them to register again by deleting the old record
        await User.deleteOne({ email });
      } else if (existingUser.role === 'provider' && role === 'customer') {
        return res.status(400).json({ message: "This email is already registered as a service provider. Please use a different email to register as a customer." });
      } else if (existingUser.role === 'customer' && role === 'provider') {
        return res.status(400).json({ message: "This email is already registered as a customer. Please use a different email to register as a service provider." });
      } else {
        return res.status(400).json({ message: "User already registered" });
      }
    }

    console.log("Hashing password...");
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    console.log("Creating new user object...");
    const newUser = new User({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      role: role || "customer",
      location: role === "provider" ? location : "",
      status: "pending", // For customers: pending for OTP, for providers: pending for admin approval
      document: document || null,
      walletBalance: 1000
    });

    console.log("Saving user to database...");
    await newUser.save();
    console.log("User saved successfully");

    let responseMessage = "User registered successfully.";

    if (newUser.role === "customer") {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      newUser.otp = otp;
      newUser.otpExpires = Date.now() + 600000; // 10 minutes
      await newUser.save();

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
        to: newUser.email,
        subject: "Verify your email",
        text: `Your OTP for email verification is: ${otp}`
      };

      try {
          await transporter.sendMail(mailOptions);
      } catch (error) {
          console.error("Error sending OTP email:", error);
          return res.status(500).json({ message: "Error sending OTP email" });
      }
      responseMessage += " Please check your email for OTP.";
    } else if (newUser.role === "provider") {
      // For providers, status is pending admin approval, no OTP needed here.
      responseMessage += " Your account is pending admin approval.";
    }

    req.session.user = { email: newUser.email };
    res.status(201).json({ message: responseMessage });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Forgot Password Endpoint
router.post("/forgot-password", async (req, res) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email credentials are not set.");
      return res.status(500).json({ message: "Email service is not configured." });
    }
    const { email } = req.body;
    console.log("Received email for forgot password:", email);
    const user = await User.findOne({ email });
    console.log("User found in database:", user);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
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
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions);
        req.session.user = { email: user.email };
        res.json({ message: "OTP sent to your email" });
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return res.status(500).json({ message: "Error sending OTP email" });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset Password Endpoint
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP or OTP has expired" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password, keepMeSignedIn } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.status === "pending") {
      if (user.role === "customer") {
        return res.status(401).json({ message: "Your account is pending email verification. Please check your email for an OTP." });
      } else if (user.role === "provider") {
        return res.status(401).json({ message: "Your account is pending admin approval." });
      }
    }

    if (user.role === "provider" && user.status === "rejected") {
      return res.status(401).json({ message: "Your provider account has been rejected. Please register again or contact support." });
    }

    // Create session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      phoneNumber: user.phoneNumber
    };

    // Set session expiration
    if (keepMeSignedIn) {
      // Extend session for a long period, e.g., 30 days
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; 
    } else {
      // Session expires when the browser is closed
      req.session.cookie.expires = false;
    }

    res.json({ 
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        phoneNumber: user.phoneNumber,
        location: user.location
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;