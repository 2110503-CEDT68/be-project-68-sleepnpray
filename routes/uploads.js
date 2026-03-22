const express = require('express');
const multer = require('multer');
const { uploadImage, deleteImage } = require('../controllers/uploads');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Multer configuration: store file in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             downloadUrl:
 *               type: string
 *             pathname:
 *               type: string
 *             contentType:
 *               type: string
 *             contentDisposition:
 *               type: string
 */

/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Upload image to Vercel Blob (Admin only)
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized as admin
 *   delete:
 *     summary: Delete image from Vercel Blob (Admin only)
 *     tags: [Uploads]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: The URL of the image to delete
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       400:
 *         description: URL not provided
 *       401:
 *         description: Not authorized
 */

router
  .route('/')
  .post(protect, authorize('admin'), upload.single('file'), uploadImage)
  .delete(protect, authorize('admin'), deleteImage);

module.exports = router;
