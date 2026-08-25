const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️  Cloudinary configured successfully.');
} else {
  console.log('ℹ️  Cloudinary credentials not provided in .env — using local storage fallback for uploads.');
}

/**
 * Upload a local file to Cloudinary (or return local path if Cloudinary is not configured)
 * @param {string} localFilePath - Path to temp file on server disk
 * @param {string} folder - Target Cloudinary folder
 * @param {string} resourceType - 'auto' | 'raw' | 'image'
 */
const uploadToCloudinary = async (localFilePath, folder = 'job_tracker/resumes', resourceType = 'auto') => {
  try {
    if (!isCloudinaryConfigured) {
      // Local fallback: Return accessible relative URL
      const normalizedPath = localFilePath.replace(/\\/g, '/');
      const relativePath = normalizedPath.includes('uploads/')
        ? '/uploads/' + normalizedPath.split('uploads/')[1]
        : '/' + normalizedPath;
      return {
        url: relativePath,
        publicId: 'local_' + Date.now(),
        isLocal: true,
      };
    }

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
    });

    // Clean up temporary local file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      isLocal: false,
    };
  } catch (error) {
    // Ensure temp file cleanup even on error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Delete a file from Cloudinary by public ID
 */
const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
  try {
    if (!isCloudinaryConfigured || publicId.startsWith('local_')) {
      return { result: 'ok' };
    }
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
};
