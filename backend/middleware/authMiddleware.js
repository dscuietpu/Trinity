const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError } = require("../utils/response");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "Unauthorized: token missing");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return sendError(res, 401, "Unauthorized: user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, "Unauthorized: invalid token");
  }
};

module.exports = authMiddleware;
