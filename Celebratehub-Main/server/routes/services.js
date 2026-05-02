const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/multer");
const Service = require("../modals/Service");
const supabase = require("../supabase");
const User = require("../modals/User");

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
      email
    } = req.body;

    const provider = await User.findOne({ email });
    if (!provider || provider.status !== "approved") {
      return res.status(403).json({ message: "Provider not approved to add services." });
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
      providerId: provider._id
    });

    await newService.save();
    res.status(201).json({ message: "Service added successfully", service: newService });
  } catch (error) {
    res.status(400).json({ message: "Failed to add service", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const services = await Service.find().populate("providerId");
    res.json(services);
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
    const services = await Service.find({ providerId: req.params.providerId }).populate("providerId");
    res.json(services);
  } catch (error){
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("providerId");
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", upload.array("images", 8), async (req, res) => {
  try {
    // Handle status-only update
    if (req.body.status && Object.keys(req.body).length === 1) {
      const { status } = req.body;
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
    };

    const updatedService = await Service.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json({ message: "Service updated successfully", service: updatedService });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(400).json({ message: "Failed to update service", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
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

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted successfully, including associated images." });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Failed to delete service", error: error.message });
  }
});

module.exports = router;
