const Reward = require("../models/Reward");
const { sendSuccess, sendError } = require("../utils/response");
const { awardRewardToUser } = require("../services/rewardService");

const awardReward = async (req, res) => {
  try {
    const { userId, type, reason = "", relatedIssue = null, pointsAwarded = 0 } = req.body;

    if (!userId || !type) {
      return sendError(res, 400, "userId and type are required");
    }

    const awarded = await awardRewardToUser({
      userId,
      type,
      reason,
      relatedIssue,
      pointsAwarded,
    });

    if (!awarded) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 201, "Reward awarded", {
      reward: awarded.reward,
      user: awarded.user,
    });
  } catch (error) {
    return sendError(res, 500, "Failed to award reward");
  }
};

const getMyRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({ user: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, 200, "Rewards fetched", { rewards });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch rewards");
  }
};

module.exports = {
  awardReward,
  getMyRewards,
};
