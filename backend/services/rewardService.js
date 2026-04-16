const Reward = require("../models/Reward");
const User = require("../models/User");
const { createNotification } = require("../utils/notificationService");

const REWARD_POINTS = {
  weekly_topper: 50,
  problem_solver: 30,
  community_builder: 25,
  active_voice: 15,
  early_spotter: 20,
  campus_hero: 40,
};

const awardRewardToUser = async ({
  userId,
  type,
  reason = "",
  relatedIssue = null,
  pointsAwarded = null,
}) => {
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  const finalPoints =
    pointsAwarded !== null && pointsAwarded !== undefined
      ? Number(pointsAwarded)
      : REWARD_POINTS[type] || 0;

  const reward = await Reward.create({
    user: user._id,
    type,
    reason,
    relatedIssue,
    pointsAwarded: finalPoints,
  });

  user.points += finalPoints;
  user.totalPoints += finalPoints;
  user.weeklyPoints += finalPoints;
  user.badges.push({ type });
  await user.save();

  await createNotification({
    recipient: user._id,
    type: "reward_earned",
    title: "New reward earned",
    body: `You earned ${type} reward.`,
    relatedIssue,
    relatedReward: reward._id,
  });

  return { reward, user };
};

module.exports = {
  REWARD_POINTS,
  awardRewardToUser,
};
