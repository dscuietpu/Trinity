const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "weekly_topper",
        "problem_solver",
        "community_builder",
        "active_voice",
        "early_spotter",
        "campus_hero",
      ],
      required: true,
    },
    reason: { type: String, default: "" },
    relatedIssue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      default: null,
    },
    pointsAwarded: { type: Number, default: 0 },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Reward", rewardSchema);
