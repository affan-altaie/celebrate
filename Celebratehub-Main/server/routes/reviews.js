// server/routes/reviews.js
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { isAuthenticated } = require("../middleware/auth");
const Service = require("../modals/Service");
const Review = require("../modals/Review");
const Booking = require("../modals/Booking");
const multer = require("multer");
const supabase = require("../supabase");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/:serviceId", [
    isAuthenticated,
    upload.array("images", 4),
    check("rating", "Rating is required").not().isEmpty(),
    check("comment", "Comment is required").not().isEmpty(),
    check("bookingId", "Booking ID is required").not().isEmpty(), // Added bookingId validation
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment, bookingId } = req.body; // Extracted bookingId
    const { serviceId } = req.params;
    const userId = req.user.id;

    try {
        let service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ msg: "Service not found" });
        }

        // Check if a review already exists for this booking
        const existingReview = await Review.findOne({ booking: bookingId });
        if (existingReview) {
            return res.status(400).json({ msg: "A review for this booking already exists" });
        }

        let booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ msg: "Booking not found" });
        }
        if (booking.userId.toString() !== userId) {
            return res.status(401).json({ msg: "User not authorized to review this booking" });
        }

        const imageUrls = [];
        if (req.files) {
            for (const file of req.files) {
                const { data, error } = await supabase.storage
                    .from("customers-reviews-imgs")
                    .upload(`${userId}_${Date.now()}`, file.buffer, {
                        contentType: file.mimetype
                    });

                if (error) {
                    console.error("Error uploading image to Supabase:", error.message);
                    return res.status(500).send("Server error");
                }

                const { data: publicUrlData } = supabase.storage
                    .from("customers-reviews-imgs")
                    .getPublicUrl(data.path);

                imageUrls.push(publicUrlData.publicUrl);
            }
        }

        const newReview = new Review({
            user: userId,
            service: serviceId,
            booking: bookingId, // Added bookingId to review
            rating,
            comment,
            images: imageUrls.filter(url => url), // Filter out any null/undefined URLs
        });

        await newReview.save();

        // Mark booking as reviewed
        booking.isReviewed = true;
        await booking.save();

        // Update the service's rating
        const reviews = await Review.find({ service: serviceId });
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        service.rating = totalRating / reviews.length;
        await service.save();

        res.json(newReview);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// GET all reviews for a specific service
router.get("/service/:serviceId", async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId }).populate("user", "username");
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
