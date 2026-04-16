const cron = require("node-cron");
const User = require("../models/User");
const { awardRewardToUser } = require("../services/rewardService");

const runWeeklyResetJob = async () => {
  const topper = await User.findOne({ weeklyPoints: { $gt: 0 } }).sort({
    weeklyPoints: -1,
    updatedAt: 1,
  });

  await User.updateMany({}, { $set: { weeklyPoints: 0, isWeeklyTopper: false } });

  if (topper) {
    await User.findByIdAndUpdate(topper._id, { $set: { isWeeklyTopper: true } });
    await awardRewardToUser({
      userId: topper._id,
      type: "weekly_topper",
      reason: "Top contributor for the week",
      pointsAwarded: 50,
    });
  }
};

const initWeeklyRewardCron = () => {
  cron.schedule("0 0 * * 1", async () => {
    try {
      await runWeeklyResetJob();
      console.log("Weekly reward reset job completed");
    } catch (error) {
      console.error("Weekly reward reset job failed:", error.message);
    }
  });
};

module.exports = {
  initWeeklyRewardCron,
  runWeeklyResetJob,
};
