const request = require("supertest");
const app = require("../app");
const Service = require("../modals/Service");
const User = require("../modals/User");
const Review = require("../modals/Review");
const Booking = require("../modals/Booking");

// Mock Models
jest.mock("../modals/Service");
jest.mock("../modals/User");
jest.mock("../modals/Review");
jest.mock("../modals/Booking");

// Mock middleware
jest.mock("../middleware/auth", () => ({
  isAuthenticated: (req, res, next) => {
    req.user = { id: "user123", role: "admin" };
    next();
  },
  isProvider: (req, res, next) => next()
}));

// Mock supabase
jest.mock("../supabase", () => ({
  storage: {
    from: jest.fn().mockReturnThis(),
    remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
    upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "http://example.com/pic.jpg" } })
  }
}));

describe("Service Endpoints", () => {
  describe("GET /api/services", () => {
    it("should return active services with ratings", async () => {
      const mockServices = [
        { 
          _id: "s1", 
          name: "Service 1", 
          status: "Active", 
          toObject: function() { return this; }
        }
      ];
      
      // First call for expired promotions
      Service.find.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue([])
      });
      
      // Second call for actual services
      Service.find.mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockServices)
      });
      Review.find.mockResolvedValue([{ rating: 5 }, { rating: 4 }]);
      Booking.find.mockResolvedValue([{ _id: "b1" }]);

      const res = await request(app).get("/api/services");

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].rating).toBe(4.5);
      expect(res.body[0].reviewsCount).toBe(2);
    });
  });

  describe("POST /api/services", () => {
    it("should add a new service for approved provider", async () => {
      User.findOne.mockResolvedValue({ _id: "p1", status: "approved", subscriptionTier: "Pro Plus" });
      Service.countDocuments.mockResolvedValue(0);
      Service.prototype.save.mockResolvedValue({ _id: "s2", name: "New Service" });

      const res = await request(app)
        .post("/api/services")
        .field("name", "New Service")
        .field("category", "Catering")
        .field("email", "provider@example.com");

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toBe("Service added successfully");
    });

    it("should fail if provider is not approved", async () => {
      User.findOne.mockResolvedValue({ _id: "p1", status: "pending" });

      const res = await request(app)
        .post("/api/services")
        .field("name", "New Service")
        .field("email", "provider@example.com");

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toBe("Provider not approved to add services.");
    });
  });

  describe("DELETE /api/services/:id", () => {
    it("should delete service", async () => {
      const mockService = { 
        _id: "s1", 
        name: "Service 1", 
        images: ["http://example.com/img1.jpg"],
        providerId: { _id: "user123", email: "p@p.com" }
      };
      Service.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockService)
      });
      Service.findByIdAndDelete.mockResolvedValue({});

      const res = await request(app).delete("/api/services/s1");

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain("Service deleted successfully");
    });
  });
});
