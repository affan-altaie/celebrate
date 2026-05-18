const request = require("supertest");
const app = require("../app");
const User = require("../modals/User");
const Service = require("../modals/Service");

// Mock Models
jest.mock("../modals/User");
jest.mock("../modals/Service");

// Mock supabase
jest.mock("../supabase", () => ({
  storage: {
    from: jest.fn().mockReturnThis(),
    remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
    upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: "http://example.com/pic.jpg" } })
  }
}));

// Mock utils/email
jest.mock("../utils/email", () => jest.fn().mockResolvedValue());

describe("User Endpoints", () => {
  describe("GET /api/users", () => {
    it("should return all users", async () => {
      const mockUsers = [
        { _id: "1", username: "user1", role: "customer" },
        { _id: "2", username: "provider1", role: "provider" }
      ];
      
      User.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUsers)
      });
      Service.find.mockResolvedValue([]);

      const res = await request(app).get("/api/users");

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].username).toBe("user1");
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return a user by id", async () => {
      const mockUser = { _id: "1", username: "user1", role: "customer" };
      User.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockUser)
      });

      const res = await request(app).get("/api/users/1");

      expect(res.statusCode).toEqual(200);
      expect(res.body.username).toBe("user1");
    });

    it("should return 404 if user not found", async () => {
      User.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const res = await request(app).get("/api/users/999");

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toBe("User not found");
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update user profile", async () => {
      const updatedUser = {
        _id: "1",
        username: "updateduser",
        email: "updated@example.com",
        role: "customer"
      };
      
      User.findById.mockResolvedValue({ _id: "1", status: "active" });
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const res = await request(app)
        .put("/api/users/1")
        .send({
          username: "updateduser",
          email: "updated@example.com"
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("Profile updated successfully");
      expect(res.body.user.username).toBe("updateduser");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete a user", async () => {
      User.findById.mockResolvedValue({ _id: "1", profilePicture: null });
      User.findByIdAndDelete.mockResolvedValue({});

      const res = await request(app).delete("/api/users/1");

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe("Account deleted successfully");
    });
  });
});
