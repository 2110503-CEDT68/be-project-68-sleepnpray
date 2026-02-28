const express = require('express');
const {
  getCampgrounds,
  getCampground,
  createCampground,
  updateCampground,
  deleteCampground
} = require('../controllers/campgrounds');
const { protect, authorize } = require('../middleware/auth');

const bookingRouter = require('./bookings');

const router = express.Router();

// mount bookings router for nested route
router.use('/:campgroundId/bookings', bookingRouter);

// basic CRUD
router.route('').get(getCampgrounds).post(protect, authorize('admin'), createCampground);
router
  .route('/:id')
  .get(getCampground)
  .put(protect, authorize('admin'), updateCampground)
  .delete(protect, authorize('admin'), deleteCampground);

module.exports = router;
