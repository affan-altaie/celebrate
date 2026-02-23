const express = require("express");
const router = express.Router();
const User = require("../modals/User");
const nodemailer = require("nodemailer");

// Get pending providers
router.get("/pending", async (req, res) => {
  try {
    const pendingProviders = await User.find({ role: "provider", status: "pending" });
    res.json(pendingProviders);
  } catch (error) {
    console.error("Error fetching pending providers:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve provider
router.put("/:id/approve", async (req, res) => {
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
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
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
router.put("/:id/reject", async (req, res) => {
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
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
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

// Get provider by ID
router.get("/:id", async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);
    if (!provider || provider.role !== "provider") {
      return res.status(404).json({ message: "Provider not found" });
    }
    res.json(provider);
  } catch (error) {
    console.error("Error fetching provider:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
