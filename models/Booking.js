const mongoose = require('mongoose');

// Booking model: start date, nights (max 3), user and campground refs
const BookingSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true
  },
  nights: {
    type: Number,
    required: true,
    min: [1, 'Must book at least one night'],
    max: [3, 'Cannot book more than three nights']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  campground: {
    type: mongoose.Schema.ObjectId,
    ref: 'Campground',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
