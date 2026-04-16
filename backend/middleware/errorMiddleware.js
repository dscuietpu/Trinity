const multer = require("multer");
const { sendError } = require("../utils/response");

const notFound = (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    return sendError(res, 404, "Route not found");
  }
  return next();
};

const globalErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    return sendError(res, 400, `Upload error: ${err.message}`);
  }

  if (err?.message === "Unsupported file type") {
    return sendError(res, 400, "Unsupported file type");
  }

  return sendError(res, 500, err?.message || "Internal server error");
};

module.exports = {
  notFound,
  globalErrorHandler,
};
