const mongoose = require("mongoose");

const REACTION_ENUM = ["👍", "❤️", "😂", "😮", "😢"];

const commentSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAnonymous: { type: Boolean, default: false },
    content: { type: String, required: true, trim: true },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    reactions: [
      {
        emoji: {
          type: String,
          enum: REACTION_ENUM,
        },
        by: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true },
);

commentSchema.index({ issue: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
