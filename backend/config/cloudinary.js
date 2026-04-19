// config/cloudinary.js
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// tells multer to send files straight to cloudinary instead of saving to disk
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "devcollab_tasks", // folder name in your cloudinary account
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "zip"],
    resource_type: "auto", // auto detects image vs pdf vs zip etc
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
