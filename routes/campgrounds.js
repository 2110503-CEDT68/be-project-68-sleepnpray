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

/**
 * @swagger
 * components:
 *   schemas:
 *     Campground:
 *       type: object
 *       required:
 *         - name
 *         - address
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated campground ID
 *         name:
 *           type: string
 *           description: Campground name (max 50 chars, unique)
 *         address:
 *           type: string
 *           description: Campground address
 *         tel:
 *           type: string
 *           description: Campground telephone number
 *       example:
 *         _id: 609c1d4e8f1b4c003aa5c1f0
 *         name: Lakeside Campground
 *         address: 123 Lake Road, Mountain Valley
 *         tel: 555-1234
 * tags:
 *   - name: Campgrounds
 *     description: Campground management (public list, admin CRUD)
 * /campgrounds:
 *   get:
 *     summary: Get all campgrounds
 *     tags: [Campgrounds]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Records per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort by field (e.g., -createdAt)
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Select specific fields (comma-separated)
 *     responses:
 *       200:
 *         description: List of campgrounds with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Campground'
 *   post:
 *     summary: Create a new campground (admin only)
 *     tags: [Campgrounds]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               tel:
 *                 type: string
 *     responses:
 *       201:
 *         description: Campground created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Campground'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 * /campgrounds/{id}:
 *   get:
 *     summary: Get a single campground by ID
 *     tags: [Campgrounds]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campground ID
 *     responses:
 *       200:
 *         description: Campground found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Campground'
 *       404:
 *         description: Campground not found
 *   put:
 *     summary: Update a campground (admin only)
 *     tags: [Campgrounds]
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
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               tel:
 *                 type: string
 *     responses:
 *       200:
 *         description: Campground updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Campground'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 *       404:
 *         description: Campground not found
 *   delete:
 *     summary: Delete a campground (admin only)
 *     tags: [Campgrounds]
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
 *         description: Campground deleted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 *       404:
 *         description: Campground not found
 */

// basic CRUD
router.route('').get(getCampgrounds).post(protect, authorize('admin'), createCampground);
router
  .route('/:id')
  .get(getCampground)
  .put(protect, authorize('admin'), updateCampground)
  .delete(protect, authorize('admin'), deleteCampground);

module.exports = router;
