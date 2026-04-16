const mongoose = require("mongoose");

const communityMemberSchema = new mongoose.Schema(
  {
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAnonymous: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["member", "moderator"],
      default: "member",
    },
    isBanned: { type: Boolean, default: false },
    bannedAt: { type: Date, default: null },
    hasLeft: { type: Boolean, default: false },
    leftAt: { type: Date, default: null },
  },
  { timestamps: true },
);

communityMemberSchema.index({ community: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("CommunityMember", communityMemberSchema);
