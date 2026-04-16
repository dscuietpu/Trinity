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

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: CATEGORY_ENUM,
      required: true,
    },
    photo: { type: String, default: "" },
    video: { type: String, default: "" },
    mediaType: {
      type: String,
      enum: ["none", "photo", "video", "both"],
      default: "none",
    },
    location: {
      building: { type: String, default: "" },
      zone: { type: String, default: "" },
      coords: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAnonymous: { type: Boolean, default: false },
    voteCount: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0 },
    flagCount: { type: Number, default: 0 },
    isFalseClaim: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Reported", "In Progress", "Fixed", "Resolved", "False Claim"],
      default: "Reported",
    },
    adminNote: { type: String, default: "" },
    reviewNote: { type: String, default: "" },
    escalated: { type: Boolean, default: false },
    resolvedAt: { type: Date, default: null },
    falseClaimMarkedAt: { type: Date, default: null },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedAuthority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    clusterGroup: { type: String, default: null },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default: null,
    },
    communityTriggered: { type: Boolean, default: false },
    shareableSlug: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true },
);

issueSchema.index({ category: 1, status: 1 });
issueSchema.index({ voteCount: -1, createdAt: -1 });
issueSchema.index({ "location.zone": 1, "location.building": 1 });

module.exports = mongoose.model("Issue", issueSchema);
