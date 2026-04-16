const mongoose = require("mongoose");

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    coverVideo: { type: String, default: "" },
    sourceIssue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },
    category: { type: String, default: "" },
    location: { type: String, default: "" },
    memberCount: { type: Number, default: 0 },
    moderator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: { type: Boolean, default: true },
    resolvedAt: { type: Date, default: null },
    closedReason: {
      type: String,
      enum: ["resolved", "false_claim", "manual", null],
      default: null,
    },
    triggerVoteCount: { type: Number, default: 50 },
    createdBy: { type: String, default: "system" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Community", communitySchema);
