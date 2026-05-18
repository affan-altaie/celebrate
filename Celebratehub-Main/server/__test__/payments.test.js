const request = require("supertest");
const app = require("../app");
const Payment = require("../modals/Payment");
const User = require("../modals/User");

// Mock Models
jest.mock("../modals/Payment");
jest.mock("../modals/User");

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

describe("Payment Endpoints", () => {
  describe("GET /api/payments/balance/:userId", () => {
    it("should return user balance and saved card", async () => {
      User.findById.mockResolvedValue({
        _id: "u1",
        walletBalance: 1200,
        savedCard: {
          cardNumber: "1234567812345678",
          cardHolderName: "Test User",
          toObject: function() { return this; }
        }
      });

      const res = await request(app).get("/api/payments/balance/u1");

      expect(res.statusCode).toEqual(200);
      expect(res.body.balance).toBe(1200);
      expect(res.body.savedCard.cardHolderName).toBe("Test User");
    });
  });

  describe("POST /api/payments/subscribe", () => {
    it("should process subscription with wallet", async () => {
      const mockUser = {
        _id: "u1",
        walletBalance: 1000,
        subscriptionTier: "Standard",
        save: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockResolvedValue(mockUser);
      Payment.prototype.save.mockResolvedValue({ _id: "p1" });

      const res = await request(app)
        .post("/api/payments/subscribe")
        .send({
          userId: "u1",
          tier: "Pro",
          billingCycle: "monthly"
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(mockUser.walletBalance).toBe(990); // Pro monthly is 10
      expect(mockUser.subscriptionTier).toBe("Pro");
    });
  });
});
