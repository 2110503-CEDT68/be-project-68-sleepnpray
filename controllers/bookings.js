const Booking = require('../models/Booking');
const Campground = require('../models/Campground');

// Get bookings: users see their own, admin can see all (optionally by campground)
exports.getBookings = async (req, res, next) => {
  try {
    let query;
    if (req.user.role !== 'admin') {
      query = Booking.find({ user: req.user.id }).populate({ path: 'campground', select: 'name address tel' });
    } else {
      if (req.query.campgroundId) {
        query = Booking.find({ campground: req.query.campgroundId }).populate({ path: 'campground', select: 'name address tel' });
      } else {
        query = Booking.find().populate({ path: 'campground', select: 'name address tel' });
      }
    }

    const bookings = await query;
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Cannot get bookings' });
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({ path: 'campground', select: 'name address tel' });
    if (!booking) {
      return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Cannot get booking' });
  }
};

exports.addBooking = async (req, res, next) => {
  try {
    req.body.campground = req.params.campgroundId;

    const campground = await Campground.findById(req.params.campgroundId);
    if (!campground) {
      return res.status(404).json({ success: false, message: `No campground with the id of ${req.params.campgroundId}` });
    }

    req.body.user = req.user.id;
    if (!req.body.nights || req.body.nights < 1 || req.body.nights > 3) {
      return res.status(400).json({ success: false, message: 'Nights must be between 1 and 3' });
    }

    const booking = await Booking.create(req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Cannot create booking' });
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to update this booking` });
    }

    if (req.body.nights && (req.body.nights < 1 || req.body.nights > 3)) {
      return res.status(400).json({ success: false, message: 'Nights must be between 1 and 3' });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Cannot update booking' });
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: `No booking with the id of ${req.params.id}` });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: `User ${req.user.id} is not authorized to delete this booking` });
    }

    await booking.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: 'Cannot delete booking' });
  }
};
