// models/ServiceRequest.js
const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  professionalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerName: {
    type: String,
    default: 'Unknown',
  },
  professionalName: {
    type: String,
    default: 'Unknown',
  },
  serviceName: {
    type: String,
    default: 'Unknown',
  },
  status: {
    type: String,
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  //13 march
  userlocation: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // Array of [longitude, latitude]
      required: true
    }
  },
  proflocation: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // Array of [longitude, latitude]
      required: true
    }
  },
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);

module.exports = ServiceRequest;
