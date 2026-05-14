const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/multer");
const Review = require("../modals/Review");
const Booking = require("../modals/Booking");
const Service = require("../modals/Service");
const supabase = require("../supabase");

// @route   POST /api/reviews
// @desc    Submit a review
// @access  Private
router.post("/", upload.array("images", 4), async (req, res) => {
  try {
    const { bookingId, rating, comment, userId, serviceId } = req.body;

    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.isReviewed) {
      return res.status(400).json({ message: "This booking has already been reviewed" });
    }

    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = `${Date.now()}-${file.originalname}`;
        const { data, error } = await supabase.storage
          .from("customers-reviews-imgs")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });

        if (error) {
          console.error("Error uploading review image to Supabase:", error);
          continue; // Skip failed uploads
        }

        const { data: publicUrlData } = supabase.storage
          .from("customers-reviews-imgs")
          .getPublicUrl(filePath);

        if (publicUrlData && publicUrlData.publicUrl) {
          images.push(publicUrlData.publicUrl);
        }
      }
    }

    const newReview = new Review({
      user: userId,
      service: serviceId,
      booking: bookingId,
      rating: parseInt(rating),
      comment,
      images
    });

    await newReview.save();

    // Sync review data to the Service model
    const reviews = await Review.find({ service: serviceId });
    const count = reviews.length;
    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / count;

    await Service.findByIdAndUpdate(serviceId, {
      $push: {
        reviews: {
          user: userId,
          rating: parseInt(rating),
          comment,
          images,
          createdAt: newReview.createdAt
        }
      },
      rating: parseFloat(averageRating.toFixed(1))
    });

    // Mark booking as reviewed
    booking.isReviewed = true;
    await booking.save();

    res.status(201).json({ message: "Review submitted successfully", review: newReview });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Failed to submit review", error: error.message });
  }
});

// @route   GET /api/reviews/service/:serviceId
// @desc    Get reviews for a service
// @access  Public
router.get("/service/:serviceId", async (req, res) => {
  try {
    const reviews = await Review.find({ service: req.params.serviceId })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews", error: error.message });
  }
});

module.exports = router;
