const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "issue_status_changed",
        "issue_marked_false_claim",
        "issue_reviewed_by_authority",
        "comment_reply",
        "issue_upvoted",
        "community_created",
        "reward_earned",
        "issue_escalated",
        "admin_note_added",
        "community_banned",
        "message_reaction",
        "comment_reaction",
        "user_flagged_false_report",
        "flag_reviewed",
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    relatedIssue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      default: null,
    },
    relatedCommunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default: null,
    },
    relatedComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    relatedReward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward",
      default: null,
    },
    seen: { type: Boolean, default: false },
    seenAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, seen: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
