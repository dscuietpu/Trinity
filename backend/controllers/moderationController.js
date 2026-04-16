const Issue = require("../models/Issue");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");
const { createNotification } = require("../utils/notificationService");

const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote = "", adminNote = "" } = req.body;

    if (!["Fixed", "False Claim"].includes(status)) {
      return sendError(res, 400, "status must be Fixed or False Claim");
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return sendError(res, 404, "Issue not found");
    }

    issue.status = status;
    issue.reviewedBy = req.user._id;
    issue.reviewNote = reviewNote || issue.reviewNote;
    issue.adminNote = adminNote || issue.adminNote;

    if (status === "Resolved") {
      issue.isFalseClaim = false;
      issue.resolvedAt = new Date();
      issue.resolvedBy = req.user._id;
    }

    if (status === "False Claim") {
      issue.isFalseClaim = true;
      issue.falseClaimMarkedAt = new Date();
      issue.resolvedAt = null;
      issue.resolvedBy = null;
    }

    await issue.save();

    await createNotification({
      recipient: issue.reportedBy,
      type:
        status === "False Claim"
          ? "issue_marked_false_claim"
          : "issue_status_changed",
      title:
        status === "False Claim"
          ? "Issue marked as False Claim"
          : "Issue status updated",
      body: `Your issue "${issue.title}" is now "${status}".`,
      relatedIssue: issue._id,
    });

    return sendSuccess(res, 200, "Issue status updated", { issue });
  } catch (error) {
    return sendError(res, 500, "Failed to update issue status");
  }
};

const increaseFalseReportCount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { $inc: { falseReportCount: 1 } },
      { new: true },
    ).select("-password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    await createNotification({
      recipient: user._id,
      type: "user_flagged_false_report",
      title: "False report count increased",
      body: "A moderator has increased your false report count.",
    });

    return sendSuccess(res, 200, "falseReportCount incremented", { user });
  } catch (error) {
    return sendError(res, 500, "Failed to increase falseReportCount");
  }
};

module.exports = {
  updateIssueStatus,
  increaseFalseReportCount,
};
