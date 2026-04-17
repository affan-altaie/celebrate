const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "server", ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const fs = require("fs");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // Allow requests from the client
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const serviceRoutes = require("./routes/services");
const providerRoutes = require("./routes/providers");
const paymentRoutes = require("./routes/payments");
const otpRoutes = require("./routes/otp");
const bookingRoutes = require("./routes/bookings");

app.use("/api", authRoutes);
app.use("/api", otpRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});