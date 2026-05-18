const request = require("supertest");
const app = require("../app");
const User = require("../modals/User");
const bcrypt = require("bcryptjs");

// Mock User model
jest.mock("../modals/User");

// Mock nodemailer
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ response: "250 OK" })
  })
}));

describe("Auth Endpoints", () => {
  describe("POST /api/register", () => {
    it("should register a new customer", async () => {
      User.findOne.mockResolvedValue(null);
      User.prototype.save.mockResolvedValue({
        _id: "user123",
        username: "testcustomer",
        email: "testcustomer@example.com",
        role: "customer"
      });

      const res = await request(app)
        .post("/api/register")
        .field("username", "testcustomer")
        .field("email", "testcustomer@example.com")
        .field("password", "password123")
        .field("phoneNumber", "1234567890")
        .field("role", "customer");

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toContain("User registered successfully");
    });

    it("should not allow registration with existing email", async () => {
      User.findOne.mockResolvedValue({ email: "existing@example.com" });

      const res = await request(app)
        .post("/api/register")
        .field("username", "newuser")
        .field("email", "existing@example.com")
        .field("password", "password123")
        .field("phoneNumber", "1111111111")
        .field("role", "customer");

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe("User already registered");
    });
  });

  describe("POST /api/login", () => {
    it("should login with correct credentials", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      User.findOne.mockResolvedValue({
        _id: "user123",
        username: "loginuser",
        email: "loginuser@example.com",
        password: hashedPassword,
        role: "customer",
        status: "active",
        walletBalance: 1000
      });

      const res = await request(app)
        .post("/api/login")
        .send({
          email: "loginuser@example.com",
          password: "password123"
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe("loginuser@example.com");
    });

    it("should not login with incorrect password", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      User.findOne.mockResolvedValue({
        email: "loginuser@example.com",
        password: hashedPassword
      });

      const res = await request(app)
        .post("/api/login")
        .send({
          email: "loginuser@example.com",
          password: "wrongpassword"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });
});
