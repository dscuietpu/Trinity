const express = require("express");
const {
  getCommunities,
  getCommunityById,
  joinCommunity,
} = require("../controllers/communityController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getCommunities);
router.get("/:id", getCommunityById);
router.post("/:id/join", authMiddleware, joinCommunity);

module.exports = router;
