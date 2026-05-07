const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'licoreria369',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 900, crop: 'limit', quality: 'auto' }],
  },
});

module.exports = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB por archivo
    files: 2,                   // máx 2 archivos por request (banners hero+footer)
  },
  fileFilter: (req, file, cb) => {
    if (!/^image\/(jpe?g|png|webp)$/.test(file.mimetype)) {
      return cb(new Error('Tipo de archivo no permitido'));
    }
    cb(null, true);
  },
});
