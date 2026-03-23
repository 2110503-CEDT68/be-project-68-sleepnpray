const { put } = require('@vercel/blob');
const crypto = require('crypto');
const path = require('path');

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file' });
    }

    // 1. Generate SHA-256 Hash of the buffer
    const hash = crypto
      .createHash('sha256')
      .update(req.file.buffer)
      .digest('hex');

    // 2. Keep the original extension
    const ext = path.extname(req.file.originalname);
    const hashedFilename = `${hash}${ext}`;

    // 3. Upload to Vercel
    // We set addRandomSuffix: false because the hash IS the unique ID
    const blob = await put(hashedFilename, req.file.buffer, {
      access: 'public',
      addRandomSuffix: false, 
      allowOverwrite: true, // Safe here because same hash = same content
    });

    res.status(200).json({
      success: true,
      data: blob
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

/**
 * @desc    Delete image from Vercel Blob
 * @route   DELETE /api/v1/uploads
 * @access  Private/Admin
 */
exports.deleteImage = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the image URL to delete'
      });
    }

    await del(url);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
};
