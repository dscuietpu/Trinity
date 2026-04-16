const Comment = require("../models/Comment");
const Issue = require("../models/Issue");
const { sendSuccess, sendError } = require("../utils/response");
const { createNotification } = require("../utils/notificationService");
const { moderateContent } = require("../utils/aiModeration");

const ALLOWED_REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

const formatCommentForClient = (commentDoc) => {
  const comment = commentDoc.toObject ? commentDoc.toObject() : commentDoc;
  const author = comment.author || null;

  return {
    ...comment,
    author: comment.isAnonymous
      ? {
          _id: author?._id || null,
          name: "Anonymous",
          role: author?.role || "student",
          avatar: "",
        }
      : author,
  };
};

const createComment = async (req, res) => {
  try {
    const { issueId, content, isAnonymous = false, replyTo = null } = req.body;
    if (!issueId || !content) {
      return sendError(res, 400, "issueId and content are required");
    }

    // AI Moderation Step
    const moderation = await moderateContent(content);
    if (!moderation.allowed) {
      return sendError(res, 403, `Comment rejected: ${moderation.reason}`, { 
        moderationCategory: moderation.category 
      });
    }

    const issue = await Issue.findById(issueId).select("_id");
    if (!issue) {
      return sendError(res, 404, "Issue not found");
    }

    if (replyTo) {
      const parentComment = await Comment.findById(replyTo).select("issue");
      if (!parentComment) {
        return sendError(res, 404, "Parent comment not found");
      }
      if (parentComment.issue.toString() !== issueId) {
        return sendError(res, 400, "Reply comment must belong to the same issue");
      }
    }

    const comment = await Comment.create({
      issue: issueId,
      author: req.user._id,
      isAnonymous: Boolean(isAnonymous),
      content,
      replyTo,
    });

    if (replyTo) {
      const parentComment = await Comment.findById(replyTo).select("author");
      if (
        parentComment &&
        parentComment.author.toString() !== req.user._id.toString()
      ) {
        await createNotification({
          recipient: parentComment.author,
          type: "comment_reply",
          title: "New reply on your comment",
          body: "Someone replied to your comment.",
          relatedIssue: issueId,
          relatedComment: comment._id,
        });
      }
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "name role avatar")
      .populate("replyTo", "content author isAnonymous createdAt");

    return sendSuccess(res, 201, "Comment created", {
      comment: formatCommentForClient(populatedComment),
    });
  } catch (error) {
    return sendError(res, 500, "Failed to process comment request");
  }
};

const reactToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { emoji } = req.body;

    if (!ALLOWED_REACTIONS.includes(emoji)) {
      return sendError(res, 400, "Invalid emoji reaction");
    }

    const targetComment = await Comment.findById(commentId);
    if (!targetComment || targetComment.isDeleted) {
      return sendError(res, 404, "Comment not found");
    }

    const existingIndex = targetComment.reactions.findIndex(
      (reaction) =>
        reaction.by.toString() === req.user._id.toString() &&
        reaction.emoji === emoji,
    );

    if (existingIndex > -1) {
      targetComment.reactions.splice(existingIndex, 1);
    } else {
      targetComment.reactions.push({ emoji, by: req.user._id });
    }

    await targetComment.save();

    if (targetComment.author.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: targetComment.author,
        type: "comment_reaction",
        title: "New reaction on your comment",
        body: `Someone reacted ${emoji} to your comment.`,
        relatedIssue: targetComment.issue,
        relatedComment: targetComment._id,
      });
    }

    const populatedComment = await Comment.findById(targetComment._id)
      .populate("author", "name role avatar")
      .populate("replyTo", "content author isAnonymous createdAt");

    return sendSuccess(res, 200, "Comment reaction updated", {
      comment: formatCommentForClient(populatedComment),
    });
  } catch (error) {
    return sendError(res, 500, "Failed to react to comment");
  }
};

const getCommentsByIssue = async (req, res) => {
  try {
    const { issueId } = req.params;

    const issueExists = await Issue.exists({ _id: issueId });
    if (!issueExists) {
      return sendError(res, 404, "Issue not found");
    }

    const comments = await Comment.find({ issue: issueId, isDeleted: false })
      .sort({ createdAt: 1 })
      .populate("author", "name role avatar")
      .populate("replyTo", "content author isAnonymous createdAt");

    return sendSuccess(res, 200, "Comments fetched", {
      comments: comments.map(formatCommentForClient),
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch comments");
  }
};

module.exports = {
  createComment,
  reactToComment,
  getCommentsByIssue,
};
