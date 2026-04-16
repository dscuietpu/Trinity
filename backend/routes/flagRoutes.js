const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  createFlag,
  getFlags,
  reviewFlag,
} = require("../controllers/flagController");

const router = express.Router();

router.post("/", authMiddleware, createFlag);
router.get(
  "/",
  authMiddleware,
  roleMiddleware("authority", "admin"),
  getFlags,
);
router.patch(
  "/:id/review",
  authMiddleware,
  roleMiddleware("authority", "admin"),
  reviewFlag,
);

module.exports = router;
