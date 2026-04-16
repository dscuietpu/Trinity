const multer = require("multer");

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type"), false);
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = upload;
