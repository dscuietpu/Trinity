const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { awardReward, getMyRewards } = require("../controllers/rewardController");

const router = express.Router();

router.post(
  "/award",
  authMiddleware,
  roleMiddleware("authority", "admin"),
  awardReward,
);
router.get("/my", authMiddleware, getMyRewards);

module.exports = router;
