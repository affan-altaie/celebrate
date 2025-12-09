const mongoose = require("mongoose");

// Define User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["customer", "provider", "admin"],
    default: "customer"
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved"
  },
  profilePicture: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  phoneNumber: {
    type: String,
    default: ""
  },
  otp: {
    type: String,
    default: undefined
  },
  otpExpires: {
    type: Date,
    default: undefined
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
