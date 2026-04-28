const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  pricePerHour: {
    type: Number,
    required: false,
  },
  pricePerPerson: {
    type: Number,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  features: {
    type: [String],
    default: [],
  },
  images: {
    type: [String],
    required: true,
  },
  mainImageIndex: {
    type: Number,
    default: 0,
  },
  availability: {
    type: Object,
    default: {},
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviews: {
    type: Number,
    default: 0,
    required: false,
  },
  rating: {
    type: Number,
    default: 0,
    required: false,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
    required: false,
  },
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
