const express = require("express");
const router = express.Router();
const User = require("../modals/User");
const nodemailer = require("nodemailer");
const supabase = require("../supabase");

// Get pending providers
router.get("/pending", async (req, res) => {
  try {
    const pendingProviders = await User.find({ role: "provider", status: "pending" });

    const providersWithDocUrls = pendingProviders.map((provider) => {
      if (provider.document) {
        const { data } = supabase.storage
          .from("celebrate-doc")
          .getPublicUrl(provider.document);
        return { ...provider.toObject(), document: data.publicUrl };
      }
      return provider.toObject();
    });

    res.json(providersWithDocUrls);
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
    const { reason } = req.body || {};
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", rejectionReason: reason },
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
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CelebrateHub" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Update on Your Service Provider Account",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
          <h2 style="color: #dc3545; text-align: center;">Account Registration Update</h2>
          <p>Dear <strong>${user.username}</strong>,</p>
          <p>Thank you for your interest in joining CelebrateHub as a service provider.</p>
          <p>After reviewing your application, we regret to inform you that your account has not been approved at this time.</p>
          <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reason for rejection:</strong></p>
            <p style="margin: 10px 0 0 0; color: #721c24;">${reason}</p>
          </div>
          <p>If you believe this decision was made in error or if you have addressed the reason(s) mentioned above, you are welcome to submit a new registration with the updated information.</p>
          <p>Should you have any questions, please feel free to reach out to our support team.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 0.9em; color: #777; text-align: center;">
            Best regards,<br>
            <strong>The CelebrateHub Team</strong>
          </p>
        </div>
      `,
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
