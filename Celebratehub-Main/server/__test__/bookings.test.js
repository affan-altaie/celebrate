const request = require("supertest");
const app = require("../app");
const Booking = require("../modals/Booking");
const User = require("../modals/User");
const Service = require("../modals/Service");
const Payment = require("../modals/Payment");

// Mock Models
jest.mock("../modals/Booking");
jest.mock("../modals/User");
jest.mock("../modals/Service");
jest.mock("../modals/Payment");

// Mock cryptoUtils
jest.mock("../utils/cryptoUtils", () => ({
  encrypt: jest.fn(val => val),
  decrypt: jest.fn(val => val)
}));

// Mock nodemailer
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ response: "250 OK" })
  })
}));

describe("Booking Endpoints", () => {
  describe("POST /api/bookings", () => {
    it("should create a new booking", async () => {
      const mockUser = { 
        _id: "u1", 
        walletBalance: 2000, 
        save: jest.fn().mockResolvedValue(true) 
      };
      const mockService = { 
        _id: "s1", 
        providerId: "p1", 
        price: 500, 
        availability: { "2026-05-20": ["10:00"] },
        save: jest.fn().mockResolvedValue(true),
        markModified: jest.fn()
      };
      
      User.findById.mockImplementation((id) => {
        if (id === "u1") return Promise.resolve(mockUser);
        if (id === "p1") return Promise.resolve({ _id: "p1", walletBalance: 0, save: jest.fn() });
        return Promise.resolve(null);
      });
      Booking.findOne.mockResolvedValue(null);
      Service.findById.mockResolvedValue(mockService);
      Booking.prototype.save.mockResolvedValue({ _id: "b1" });
      Payment.prototype.save.mockResolvedValue({ _id: "pay1" });

      const res = await request(app)
        .post("/api/bookings")
        .send({
          userId: "u1",
          serviceId: "s1",
          serviceName: "Test Service",
          date: "2026-05-20",
          time: "10:00",
          totalPrice: 500,
          payment: { cardNumber: "1234567812345678", cardHolderName: "Test" }
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toBe("Booking created successfully");
      expect(mockUser.walletBalance).toBe(1500);
    });

    it("should fail if insufficient funds", async () => {
      User.findById.mockResolvedValue({ _id: "u1", walletBalance: 100 });

      const res = await request(app)
        .post("/api/bookings")
        .send({
          userId: "u1",
          serviceId: "s1",
          totalPrice: 500
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain("Insufficient funds");
    });
  });

  describe("GET /api/bookings/user/:userId", () => {
    it("should return user bookings", async () => {
      const mockBookings = [
        { _id: "b1", serviceName: "Service 1", toObject: function() { return this; } }
      ];
      Booking.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockBookings)
      });

      const res = await request(app).get("/api/bookings/user/u1");

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].serviceName).toBe("Service 1");
    });
  });
});
