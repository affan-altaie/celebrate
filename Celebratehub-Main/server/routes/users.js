const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../modals/User");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

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

module.exports = router;
