const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../modals/User");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const sendEmail = require("../utils/email");

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

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude passwords from the result
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update Profile Picture
router.put("/:id/profile-picture", upload.single("profilePicture"), async (req, res) => {
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
router.put("/:id/password", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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
router.put("/:id", async (req, res) => {
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

// Suspend a user
router.put("/:id/suspend", async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: "Suspension reason is required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = "suspended";
    user.suspensionReason = reason;
    user.suspensionDate = new Date();
    
    await user.save();

    // Send an email to the user
    try {
      await sendEmail({
        email: user.email,
        subject: "Your account has been suspended",
        message: `Your account has been suspended for the following reason: ${reason}`,
      });
    } catch (emailError) {
      console.error("Error sending suspension email:", emailError);
      // Decide if you want to return an error to the client if email fails
    }

    res.json({ message: "User suspended successfully", user });
  } catch (error) {
    console.error("Error suspending user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Unsuspend a user
router.put("/:id/unsuspend", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = "approved";
    user.suspensionReason = null;
    user.suspensionDate = null;

    await user.save();

    res.json({ message: "User unsuspended successfully", user });
  } catch (error) {
    console.error("Error unsuspending user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
