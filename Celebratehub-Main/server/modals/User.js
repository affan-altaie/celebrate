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
    enum: ["pending", "approved", "rejected", "suspended"],
    default: "approved"
  },
  rejectionReason: {
    type: String,
    default: null
  },
  suspensionReason: {
    type: String,
    default: null
  },
  suspensionDate: {
    type: Date,
    default: null
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
  document: {
    type: String,
    default: null
  },
  otp: {
    type: String,
    default: undefined
  },
  otpExpires: {
    type: Date,
    default: undefined
  },
  walletBalance: {
    type: Number,
    default: 1000
  },
  savedCard: {
    cardNumber: { type: String, default: "" },
    expiryDate: { type: String, default: "" },
    cardHolderName: { type: String, default: "" },
    cvv: { type: String, default: "" }
  },
  language: {
    type: String,
    enum: ["en", "ar"],
    default: "en"
  },
  subscriptionTier: {
    type: String,
    enum: ["Standard", "Pro", "Pro Plus"],
    default: "Standard"
  },
  subscriptionExpiry: {
    type: Date,
    default: null
  },
  subscriptionBillingCycle: {
    type: String,
    enum: ["monthly", "annually", null],
    default: null
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
