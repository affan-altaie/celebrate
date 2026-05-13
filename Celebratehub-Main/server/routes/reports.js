const express = require("express");
const router = express.Router();
const Report = require("../modals/Report");
const { isAuthenticated } = require("../middleware/auth");
const sendEmail = require("../utils/email");

// @route   POST /api/reports
// @desc    Submit a report
// @access  Private (Customer)
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { serviceId, reason, description } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!serviceId || !reason || !description) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const newReport = new Report({
      user: userId,
      service: serviceId,
      reason,
      description,
    });

    await newReport.save();

    // Send confirmation email to the reporter
    try {
      await sendEmail({
        email: userEmail,
        subject: "We've received your report",
        message: "Thanks for sharing your concern. We’re reviewing your report and will respond shortly.",
      });
    } catch (emailError) {
      console.error("Error sending report confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({ message: "Report submitted successfully", report: newReport });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({ message: "Failed to submit report", error: error.message });
  }
});

// @route   GET /api/reports
// @desc    Get all reports
// @access  Private (Admin)
router.get("/", isAuthenticated, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const reports = await Report.find()
      .populate("user", "username email")
      .populate("service", "name")
      .sort({ createdAt: -1 });
      
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Failed to fetch reports", error: error.message });
  }
});

// @route   PATCH /api/reports/:id/status
// @desc    Update report status
// @access  Private (Admin)
router.patch("/:id/status", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { status } = req.body;
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "username email").populate("service", "name");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Send email to the reporter if status is 'reviewed' or 'resolved'
    if (status === 'reviewed' || status === 'resolved') {
      try {
        const customerName = report.user?.username || "Customer";
        const serviceName = report.service?.name || "the service";
        let subject, message;

        if (status === 'reviewed') {
          subject = "Update regarding your report";
          message = `Hello ${customerName},<br><br>
          Thank you for submitting your report regarding ${serviceName}.<br>
          We want you to know that your feedback has been received and is currently under review by our team.<br><br>
          Our goal is to ensure every customer has a respectful and positive experience. If further details are needed, we’ll reach out to you directly. Otherwise, you’ll be notified once the report status changes from Pending to Reviewed or Resolved.<br><br>
          We appreciate you taking the time to share your concerns.<br><br>
          Best regards,<br>
          CelebrateHub Support Team`;
        } else {
          subject = "Your report has been resolved";
          message = `Hello ${customerName},<br><br>
          We’re reaching out to let you know that your report regarding ${serviceName} has been reviewed and marked as Resolved.<br><br>
          Our team has taken the necessary steps to address your concern, and we appreciate you bringing this to our attention. Your feedback helps us improve and ensures that we continue to provide a respectful, professional experience.<br><br>
          If you have any further questions or feel the issue has not been fully addressed, please don’t hesitate to reply to this email.<br><br>
          Thank you again for helping us improve.<br><br>
          Best regards,<br>
          CelebrateHub Support Team`;
        }
        
        await sendEmail({
          email: report.user.email,
          subject,
          message,
          skipFooter: true
        });
      } catch (emailError) {
        console.error(`Error sending ${status} notification email:`, emailError);
      }
    }

    res.json({ message: "Report status updated successfully", report });
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ message: "Failed to update report status", error: error.message });
  }
});

module.exports = router;
