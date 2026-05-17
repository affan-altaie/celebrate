const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../modals/User");
const Service = require("../modals/Service");
const { upload } = require("../middleware/multer");
const supabase = require("../supabase");
const sendEmail = require("../utils/email");

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, '-password').lean(); // Use .lean() to allow adding properties

    // Calculate ratings for providers
    const usersWithRatings = await Promise.all(users.map(async (user) => {
      if (user.role === 'provider') {
        const services = await Service.find({ providerId: user._id });
        const ratedServices = services.filter(s => s.rating && s.rating > 0);
        
        if (ratedServices.length > 0) {
          const totalRating = ratedServices.reduce((acc, s) => acc + s.rating, 0);
          user.rating = totalRating / ratedServices.length;
        } else {
          user.rating = 0;
        }
      }
      return user;
    }));

    res.json(usersWithRatings);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password').lean(); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === 'provider') {
      const services = await Service.find({ providerId: user._id });
      const ratedServices = services.filter(s => s.rating && s.rating > 0);
      
      if (ratedServices.length > 0) {
        const totalRating = ratedServices.reduce((acc, s) => acc + s.rating, 0);
        user.rating = totalRating / ratedServices.length;
      } else {
        user.rating = 0;
      }
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

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old profile picture from Supabase if it exists
    if (user.profilePicture && user.profilePicture.includes("user-profile-logo")) {
      try {
        const oldFilePath = user.profilePicture.split("user-profile-logo/")[1];
        if (oldFilePath) {
          await supabase.storage.from("user-profile-logo").remove([oldFilePath]);
        }
      } catch (err) {
        console.error("Error deleting old profile picture from Supabase:", err);
      }
    }

    // Upload new profile picture to Supabase
    const fileName = `${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;
    const { data, error } = await supabase.storage
      .from("user-profile-logo")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({ message: "Failed to upload image to Supabase", error: error.message });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("user-profile-logo")
      .getPublicUrl(fileName);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      return res.status(500).json({ message: "Failed to get public URL for profile picture" });
    }

    user.profilePicture = publicUrlData.publicUrl;
    await user.save();

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
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete profile picture from Supabase if it exists
    if (user.profilePicture && user.profilePicture.includes("user-profile-logo")) {
      try {
        const filePath = user.profilePicture.split("user-profile-logo/")[1];
        if (filePath) {
          await supabase.storage.from("user-profile-logo").remove([filePath]);
        }
      } catch (err) {
        console.error("Error deleting profile picture from Supabase during account deletion:", err);
      }
    }

    await User.findByIdAndDelete(req.params.id);
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
    const { reason } = req.body || {};
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
