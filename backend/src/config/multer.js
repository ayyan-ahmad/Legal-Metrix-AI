const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary-v2');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'legalmetrix', // Cloudinary pe is naam ka folder ban jayega
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

module.exports = upload;