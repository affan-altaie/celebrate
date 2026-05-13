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

    res.json({ message: "Report status updated successfully", report });
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ message: "Failed to update report status", error: error.message });
  }
});

module.exports = router;
