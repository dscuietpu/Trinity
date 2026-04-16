const mongoose = require("mongoose");

const flagSchema = new mongoose.Schema(
  {
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["issue", "comment", "message", "user"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "spam",
        "duplicate",
        "offensive",
        "fake",
        "irrelevant",
        "false_report",
        "other",
      ],
      required: true,
    },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "reviewed_valid", "reviewed_invalid"],
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

flagSchema.index({ flaggedBy: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model("Flag", flagSchema);
