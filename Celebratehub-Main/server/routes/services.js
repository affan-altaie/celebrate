const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/multer");
const Service = require("../modals/Service");
const Review = require("../modals/Review");
const Booking = require("../modals/Booking");
const supabase = require("../supabase");
const User = require("../modals/User");
const { sendDeletionEmail } = require("../email");
const { isAuthenticated } = require("../middleware/auth");

const AD_LIMITS = {
  'Standard': 1,
  'Pro': 3,
  'Pro Plus': Infinity
};

// Service Routes
router.post("/", upload.array("images", 8), async (req, res) => {
  try {
    const {
      name,
      category,
      location,
      pricePerHour,
      pricePerPerson,
      description,
      features,
      availability,
      mainImageIndex,
      cancellationPolicy,
      email
    } = req.body;

    const provider = await User.findOne({ email });
    if (!provider || provider.status !== "approved") {
      return res.status(403).json({ message: "Provider not approved to add services." });
    }

    // Check ad limit based on subscription tier
    const currentServiceCount = await Service.countDocuments({ providerId: provider._id });
    const tier = provider.subscriptionTier || 'Standard';
    const limit = AD_LIMITS[tier];

    if (currentServiceCount >= limit) {
      return res.status(403).json({ 
        message: `You have reached the limit of ${limit} ad(s) for the ${tier} tier. Please upgrade your subscription to add more.`,
        limitReached: true
      });
    }

    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = `${Date.now()}-${file.originalname}`;
        const { data, error } = await supabase.storage
          .from("celebrate-services-files")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });

        if (error) {
          console.error("Error uploading image to Supabase:", error);
          return res.status(500).json({ message: "Failed to upload image to storage", error: error.message });
        }

        const { data: publicUrlData } = supabase.storage
          .from("celebrate-services-files")
          .getPublicUrl(filePath);

        if (!publicUrlData || !publicUrlData.publicUrl) {
          console.error("Error getting public URL from Supabase");
          return res.status(500).json({ message: "Failed to get public URL for image" });
        }

        images.push(publicUrlData.publicUrl);
      }
    }

    let parsedFeatures = [];
    if (features) {
      parsedFeatures = typeof features === "string" 
        ? features.split(",").map(f => f.trim()).filter(f => f) 
        : features;
    }

    let parsedAvailability = {};
    if (availability) {
      parsedAvailability = typeof availability === "string" 
        ? JSON.parse(availability) 
        : availability;
    }

    const newService = new Service({
      name,
      category,
      location,
      pricePerHour,
      pricePerPerson,
      description,
      features: parsedFeatures,
      images,
      mainImageIndex: parseInt(mainImageIndex) || 0,
      availability: parsedAvailability,
      cancellationPolicy,
      providerId: provider._id,
      isFeatured: false
    });

    await newService.save();
    res.status(201).json({ message: "Service added successfully", service: newService });
  } catch (error) {
    res.status(400).json({ message: "Failed to add service", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    // Lazy cleanup of expired promotions
    const now = new Date();
    const expiredPromotions = await Service.find({
      isFeatured: true,
      isPromotionPaused: { $ne: true },
      featuredUntil: { $lt: now }
    }).populate('providerId');

    for (const service of expiredPromotions) {
      const tier = service.providerId?.subscriptionTier;
      // Only set isFeatured to false if they don't have a Pro/Pro Plus subscription
      if (tier !== 'Pro' && tier !== 'Pro Plus') {
        service.isFeatured = false;
      }
      service.featuredUntil = null;
      await service.save();
    }

    const services = await Service.find({ status: "Active" })
      .sort({ isFeatured: -1, isPromotionPaused: 1, createdAt: -1 })
      .populate("providerId");
    const servicesWithRatings = await Promise.all(services.map(async (service) => {
      const reviews = await Review.find({ service: service._id });
      const reviewsCount = reviews.length;
      const averageRating = reviewsCount > 0 
        ? parseFloat((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewsCount).toFixed(1))
        : 0;
      
      const bookings = await Booking.find({ serviceId: service._id }, '_id');
      
      const serviceObj = service.toObject();
      return { 
        ...serviceObj, 
        rating: averageRating,
        reviewsCount: reviewsCount,
        bookings: bookings
      };
    }));
    res.json(servicesWithRatings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TEMPORARY: Get all services for debugging
router.get("/all", async (req, res) => {
  try {
    const services = await Service.find().populate("providerId");
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/provider/:providerId", async (req, res) => {
  try {
    // Lazy cleanup of expired promotions for this provider
    const now = new Date();
    const expiredPromotions = await Service.find({
      providerId: req.params.providerId,
      isFeatured: true,
      isPromotionPaused: { $ne: true },
      featuredUntil: { $lt: now }
    }).populate('providerId');

    for (const service of expiredPromotions) {
      const tier = service.providerId?.subscriptionTier;
      if (tier !== 'Pro' && tier !== 'Pro Plus') {
        service.isFeatured = false;
      }
      service.featuredUntil = null;
      await service.save();
    }

    const filter = { providerId: req.params.providerId };
    if (req.query.all !== "true") {
      filter.status = "Active";
    }
    const services = await Service.find(filter)
      .sort({ isFeatured: -1, isPromotionPaused: 1, createdAt: -1 })
      .populate("providerId");
    const servicesWithRatings = await Promise.all(services.map(async (service) => {
      const reviews = await Review.find({ service: service._id });
      const reviewsCount = reviews.length;
      const averageRating = reviewsCount > 0 
        ? parseFloat((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewsCount).toFixed(1))
        : 0;
      
      const bookings = await Booking.find({ serviceId: service._id }, '_id');
      
      const serviceObj = service.toObject();
      return { 
        ...serviceObj, 
        rating: averageRating,
        reviewsCount: reviewsCount,
        bookings: bookings
      };
    }));
    res.json(servicesWithRatings);
  } catch (error){
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("providerId");
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (service.status !== "Active" && req.query.all !== "true") {
      return res.status(404).json({ message: "Service is currently inactive" });
    }

    const reviews = await Review.find({ service: service._id });
    const reviewsCount = reviews.length;
    const averageRating = reviewsCount > 0 
      ? parseFloat((reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewsCount).toFixed(1))
      : 0;

    const bookings = await Booking.find({ serviceId: service._id }, '_id');

    const serviceObj = service.toObject();
    res.json({
      ...serviceObj,
      rating: averageRating,
      reviewsCount: reviewsCount,
      bookings: bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", upload.array("images", 8), async (req, res) => {
  try {
    // Handle status-only update
    if (req.body && req.body.status && Object.keys(req.body).length === 1) {
      const { status } = req.body || {};
      const updatedService = await Service.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      return res.json({
        message: "Service status updated successfully",
        service: updatedService,
      });
    }

    const {
      name,
      category,
      location,
      pricePerHour,
      pricePerPerson,
      description,
      features,
      availability,
      mainImageIndex,
      cancellationPolicy,
      existingImages
    } = req.body;

    const currentService = await Service.findById(req.params.id);
    if (!currentService) {
      return res.status(404).json({ message: "Service not found" });
    }

    let images = [];
    if (existingImages) {
      images = typeof existingImages === "string" ? JSON.parse(existingImages) : existingImages;
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = `${Date.now()}-${file.originalname}`;
        const { data, error } = await supabase.storage
          .from("celebrate-services-files")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });

        if (error) {
          console.error("Error uploading image to Supabase:", error);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("celebrate-services-files")
          .getPublicUrl(filePath);

        if (publicUrlData && publicUrlData.publicUrl) {
          images.push(publicUrlData.publicUrl);
        }
      }
    }

    let parsedFeatures = [];
    if (features) {
      parsedFeatures = typeof features === "string" 
        ? features.split(",").map(f => f.trim()).filter(f => f) 
        : features;
    }

    let parsedAvailability = {};
    if (availability) {
      parsedAvailability = typeof availability === "string" 
        ? JSON.parse(availability) 
        : availability;
    }

    const updatedData = {
      name,
      category,
      location,
      pricePerHour,
      pricePerPerson,
      description,
      features: parsedFeatures,
      images,
      mainImageIndex: parseInt(mainImageIndex) || 0,
      availability: parsedAvailability,
      cancellationPolicy,
    };

    const updatedService = await Service.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json({ message: "Service updated successfully", service: updatedService });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(400).json({ message: "Failed to update service", error: error.message });
  }
});

router.put("/:id/pause-promotion", isAuthenticated, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (service.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!service.isFeatured || !service.featuredUntil) {
      return res.status(400).json({ message: "Service is not promoted" });
    }

    if (service.isPromotionPaused) {
      return res.status(400).json({ message: "Promotion is already paused" });
    }

    const now = new Date();
    const remainingTime = service.featuredUntil.getTime() - now.getTime();

    if (remainingTime <= 0) {
      return res.status(400).json({ message: "Promotion has already expired" });
    }

    service.isPromotionPaused = true;
    service.promotionRemainingTime = remainingTime;
    
    await service.save();
    res.json({ message: "Promotion paused successfully", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/resume-promotion", isAuthenticated, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (service.providerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!service.isPromotionPaused) {
      return res.status(400).json({ message: "Promotion is not paused" });
    }

    const now = new Date();
    service.featuredUntil = new Date(now.getTime() + service.promotionRemainingTime);
    service.isPromotionPaused = false;
    service.promotionRemainingTime = null;

    await service.save();
    res.json({ message: "Promotion resumed successfully", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("providerId");
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Delete images from Supabase storage
    for (const imageUrl of service.images) {
      try {
        const filePath = imageUrl.split("celebrate-services-files/")[1];
        const { error } = await supabase.storage.from("celebrate-services-files").remove([filePath]);

        if (error) {
          console.error(`Error deleting image ${filePath} from Supabase:`, error);
          // Continue to delete other images and service even if one image fails
        }
      } catch (e) {
        console.error(`Exception while deleting image ${imageUrl}:`, e);
        // Continue processing to attempt to delete other images and the service
      }
    }
    
    const { reason } = req.body || {};
    console.log(`Deleting service: ${service.name}, Reason: ${reason}, DeletedBy: ${req.user.id}`);

    // Only send email if the service is deleted by someone other than the owner (e.g., Admin)
    const isOwner = service.providerId && service.providerId._id.toString() === req.user.id;

    if (!isOwner) {
      if (service.providerId && service.providerId.email) {
        console.log(`Sending deletion email to: ${service.providerId.email}`);
        sendDeletionEmail(service.providerId.email, reason || "No reason provided", service.name);
      } else {
        console.warn(`Could not send deletion email for service ${service.name}: Provider email not found.`);
      }
    } else {
      console.log(`Self-deletion by provider ${req.user.id}, suppressing email.`);
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted successfully, including associated images." });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Failed to delete service", error: error.message });
  }
});

module.exports = router;
