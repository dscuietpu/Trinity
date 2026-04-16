const mongoose = require("mongoose");

const CATEGORY_ENUM = [
  "WiFi",
  "Canteen",
  "Parking",
  "Library",
  "Hostel",
  "Sanitation",
  "Safety",
  "Other",
];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "authority", "admin"],
      default: "student",
    },
    college: { type: String, required: true, trim: true },
    avatar: { type: String, default: "" },
    credibilityScore: { type: Number, default: 100 },
    falseReportCount: { type: Number, default: 0 },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: { type: String, default: "" },
    authorityInfo: {
      department: { type: String, default: "" },
      designation: { type: String, default: "" },
      categoriesHandled: [
        {
          type: String,
          enum: CATEGORY_ENUM,
        },
      ],
      zonesHandled: [{ type: String }],
      isVerifiedAuthority: { type: Boolean, default: false },
    },
    reportedIssues: [{ type: mongoose.Schema.Types.ObjectId, ref: "Issue" }],
    joinedCommunities: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
    ],
    badges: [
      {
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
        },
        awardedAt: { type: Date, default: Date.now },
      },
    ],
    points: { type: Number, default: 0 },
    weeklyPoints: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    isWeeklyTopper: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
