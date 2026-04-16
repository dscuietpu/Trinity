const { sendError } = require("../utils/response");

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, "Forbidden: insufficient role");
    }

    next();
  };
};

module.exports = roleMiddleware;
