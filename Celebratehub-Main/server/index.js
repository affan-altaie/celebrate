const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const multer = require("multer");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // Allow requests from the client
  credentials: true
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Session configuration
app.use(session({
  secret: "your_secret_key", // Replace with a strong secret key
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads";
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// MongoDB Connection
const MONGODB_URI = "mongodb+srv://admin:admin1234@cluster.0jpgmx8.mongodb.net/celebratehub?appName=Cluster";

mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const User = require("./modals/User");
const Service = require("./modals/Service");

// Routes

// Register Endpoint
app.post("/api/register", async (req, res) => {
  console.log("Register request received:", req.body);
  try {
    console.log("Request body:", req.body);
    const { username, email, phoneNumber, password, role, location } = req.body;

    if (email === "admin@admin.com") {
      return res.status(400).json({ message: "This email is not allowed for registration" });
    }

    // Check if user already exists
    console.log("Checking for existing user...");
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.role === 'provider' && role === 'customer') {
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
      status: role === "provider" ? "pending" : "approved"
    });

    console.log("Saving user to database...");
    await newUser.save();
    console.log("User saved successfully");
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Forgot Password Endpoint
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
    const user = await User.findOne({ email, phoneNumber });
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
        user: "noreply.celebrate.hub@gmail.com",
        pass: "vtshekntlzwmxvky"
      }
    });

    const mailOptions = {
      from: "noreply.celebrate.hub@gmail.com",
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset Password Endpoint
app.post("/api/reset-password", async (req, res) => {
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
app.post("/api/login", async (req, res) => {
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

    if (user.role === "provider" && user.status === "pending") {
      return res.status(401).json({ message: "Your account is pending approval from the administrator." });
    }

    if (user.role === "provider" && user.status === "rejected") {
      return res.status(401).json({ message: "Your account has been rejected. Please register again." });
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
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Update Profile Picture
app.put("/api/user/:id/profile-picture", upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profilePicturePath = `/uploads/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePicture: profilePicturePath },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "Profile picture updated", 
      profilePicture: user.profilePicture 
    });
  } catch (error) {
    console.error("Profile picture update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Password
app.put("/api/user/:id/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Account
app.delete("/api/user/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Profile Information
app.put("/api/user/:id", async (req, res) => {
  try {
    const { username, email, location, contact, phoneNumber } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, location, contact, phoneNumber },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        location: user.location,
        contact: user.contact,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Service Routes
app.post("/api/services", async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/services/provider/:providerId", async (req, res) => {
  try {
    const services = await Service.find({ providerId: req.params.providerId });
    res.json(services);
  } catch (error){
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/services/:id", async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/api/services/:id", async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Provider Management Routes

// Get pending providers
app.get("/api/providers/pending", async (req, res) => {
  try {
    const pendingProviders = await User.find({ role: "provider", status: "pending" });
    res.json(pendingProviders);
  } catch (error) {
    console.error("Error fetching pending providers:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve provider
app.put("/api/providers/:id/approve", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send approval email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "noreply.celebrate.hub@gmail.com",
        pass: "vtshekntlzwmxvky"
      }
    });

    const mailOptions = {
      from: "noreply.celebrate.hub@gmail.com",
      to: user.email,
      subject: "Your Service Provider Account has been Approved",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Congratulations, ${user.username}!</h2>
          <p>Your service provider account on CelebrateHub has been approved.</p>
          <p>You can now log in to your account and start offering your services to a wide range of customers.</p>
          <a href="http://localhost:3000/login" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Log in to your account</a>
          <p>Thank you for joining our platform. We're excited to have you on board!</p>
          <p>Best regards,<br>The CelebrateHub Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${user.email}`);

    res.json({ message: "Provider approved successfully", user });
  } catch (error) {
    console.error("Error approving provider:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject provider
app.put("/api/providers/:id/reject", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send rejection email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "noreply.celebrate.hub@gmail.com",
        pass: "vtshekntlzwmxvky"
      }
    });

    const mailOptions = {
      from: "noreply.celebrate.hub@gmail.com",
      to: user.email,
      subject: "Your Service Provider Account has been Rejected",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Account Rejection Notice</h2>
          <p>Dear ${user.username},</p>
          <p>We regret to inform you that your service provider account on CelebrateHub has been rejected. This may be due to incomplete information or a failure to meet our platform's standards.</p>
          <p>If you believe this is a mistake or would like more information, please contact our support team for further assistance.</p>
          <p>Best regards,<br>The CelebrateHub Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to ${user.email}`);

    res.json({ message: "Provider rejected successfully", user });
  } catch (error) {
    console.error("Error rejecting provider:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
