const express = require('express');
const {
  getBookings,
  getBooking,
  addBooking,
  updateBooking,
  deleteBooking
} = require('../controllers/bookings');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - startDate
 *         - nights
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated booking ID
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Booking start date
 *         nights:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *           description: Number of nights (1-3)
 *         user:
 *           type: string
 *           description: User ID who made the booking
 *         campground:
 *           type: string
 *           description: Campground ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Booking creation timestamp
 *       example:
 *         _id: 609c1d4e8f1b4c003aa5c1f1
 *         startDate: '2026-03-15T00:00:00Z'
 *         nights: 2
 *         user: 609c1d4e8f1b4c003aa5c1f2
 *         campground: 609c1d4e8f1b4c003aa5c1f0
 *         createdAt: '2026-03-01T10:30:00Z'
 * tags:
 *   - name: Bookings
 *     description: Campground booking management (create, view, edit, delete)
 * /campgrounds/{campgroundId}/bookings:
 *   get:
 *     summary: Get all bookings for a campground (users see own, admins see all)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campgroundId
 *         required: true
 *         schema:
 *           type: string
 *         description: Campground ID
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Not authenticated
 *   post:
 *     summary: Create a booking for this campground
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campgroundId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - nights
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               nights:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid input (nights must be 1-3)
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Campground not found
 * /campgrounds/{campgroundId}/bookings/{id}:
 *   get:
 *     summary: Get a specific booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campgroundId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Booking not found
 *   put:
 *     summary: Update a booking (owner or admin only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campgroundId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               nights:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *     responses:
 *       200:
 *         description: Booking updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 *   delete:
 *     summary: Delete a booking (owner or admin only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: campgroundId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 * /bookings:
 *   get:
 *     summary: Get all bookings (users see own, admins see all)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Not authenticated
 * /bookings/{id}:
 *   get:
 *     summary: Get a specific booking by ID
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Booking not found
 *   put:
 *     summary: Update a booking by ID (owner or admin only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               nights:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *     responses:
 *       200:
 *         description: Booking updated
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 *   delete:
 *     summary: Delete a booking by ID (owner or admin only)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking deleted
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 */

router
  .route('/')
  .get(protect, getBookings)
  .post(protect, authorize('admin', 'user'), addBooking);

router
  .route('/:id')
  .get(protect, getBooking)
  .put(protect, authorize('admin', 'user'), updateBooking)
  .delete(protect, authorize('admin', 'user'), deleteBooking);

module.exports = router;
