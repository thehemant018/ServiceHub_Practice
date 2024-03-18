const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' }, // Assuming there's a Service model
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assuming there's a User model
  profId: { type: mongoose.Schema.Types.ObjectId, ref: 'Professional' }, 
  rating: { type: Number, required: true },
  feedback: { type: String }
}, { timestamps: true });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
