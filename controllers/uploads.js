const { put, del } = require('@vercel/blob');

/**
 * @desc    Upload image to Vercel Blob
 * @route   POST /api/v1/uploads
 * @access  Private/Admin
 */
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Upload to Vercel Blob
    const blob = await put(req.file.originalname, req.file.buffer, {
      access: 'public', // Makes it viewable publicly
      addRandomSuffix: true
    });

    res.status(200).json({
      success: true,
      data: blob
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
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
