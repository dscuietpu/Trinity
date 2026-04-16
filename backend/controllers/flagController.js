const Comment = require("../models/Comment");
const Flag = require("../models/Flag");
const Issue = require("../models/Issue");
const Message = require("../models/Message");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");
const { createNotification } = require("../utils/notificationService");

const targetModelByType = {
  issue: Issue,
  comment: Comment,
  message: Message,
  user: User,
};

const createFlag = async (req, res) => {
  try {
    const { targetType, targetId, reason, description = "" } = req.body;

    if (!targetType || !targetId || !reason) {
      return sendError(res, 400, "targetType, targetId and reason are required");
    }

    const TargetModel = targetModelByType[targetType];
    if (!TargetModel) {
      return sendError(res, 400, "Invalid targetType");
    }

    const targetExists = await TargetModel.exists({ _id: targetId });
    if (!targetExists) {
      return sendError(res, 404, "Flag target not found");
    }

    let flag;
    try {
      flag = await Flag.create({
        flaggedBy: req.user._id,
        targetType,
        targetId,
        reason,
        description,
      });
    } catch (error) {
      if (error?.code === 11000) {
        return sendError(res, 409, "You have already flagged this target");
      }
      throw error;
    }

    if (targetType === "issue") {
      await Issue.findByIdAndUpdate(targetId, { $inc: { flagCount: 1 } });
    }

    return sendSuccess(res, 201, "Flag submitted", { flag });
  } catch (error) {
    return sendError(res, 500, "Failed to submit flag");
  }
};

const getFlags = async (req, res) => {
  try {
    const { status, targetType } = req.query;
    const query = {};
    if (status) query.status = status;
    if (targetType) query.targetType = targetType;

    const flags = await Flag.find(query)
      .sort({ createdAt: -1 })
      .populate("flaggedBy", "name email role")
      .populate("reviewedBy", "name email role");

    return sendSuccess(res, 200, "Flags fetched", { flags });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch flags");
  }
};

const reviewFlag = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["reviewed_valid", "reviewed_invalid"].includes(status)) {
      return sendError(
        res,
        400,
        "status must be reviewed_valid or reviewed_invalid",
      );
    }

    const flag = await Flag.findById(id);
    if (!flag) {
      return sendError(res, 404, "Flag not found");
    }

    flag.status = status;
    flag.reviewedBy = req.user._id;
    flag.reviewedAt = new Date();
    await flag.save();

    if (
      status === "reviewed_valid" &&
      flag.targetType === "user" &&
      flag.reason === "false_report"
    ) {
      await User.findByIdAndUpdate(flag.targetId, { $inc: { falseReportCount: 1 } });
    }

    const reviewedFlag = await Flag.findById(flag._id)
      .populate("flaggedBy", "name email role")
      .populate("reviewedBy", "name email role");

    await createNotification({
      recipient: flag.flaggedBy,
      type: "flag_reviewed",
      title: "Your flag was reviewed",
      body: `Your ${flag.targetType} flag has been marked as ${status}.`,
    });

    return sendSuccess(res, 200, "Flag reviewed", { flag: reviewedFlag });
  } catch (error) {
    return sendError(res, 500, "Failed to review flag");
  }
};

module.exports = {
  createFlag,
  getFlags,
  reviewFlag,
};
