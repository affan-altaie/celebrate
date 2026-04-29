const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  pricePerHour: { type: String, required: false, default: null },
  pricePerPerson: { type: String, required: false, default: null },
  description: { type: String, required: true },
  features: { type: [String], required: true },
  images: { type: [String], required: true },
  mainImageIndex: { type: Number, default: 0 },
  availability: { type: Object, required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviews: [reviewSchema], 
  rating: { type: Number, default: 0 },
  status: { type: String, default: "Active" } 
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
