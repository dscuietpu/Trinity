const mongoose = require("mongoose");

const REACTION_ENUM = ["👍", "❤️", "😂", "😮", "😢"];

const messageSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, default: "" },
    type: {
      type: String,
      enum: ["text", "image", "video", "system"],
      default: "text",
    },
    mediaUrl: { type: String, default: "" },
    isAnonymous: { type: Boolean, default: false },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
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

messageSchema.index({ community: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
