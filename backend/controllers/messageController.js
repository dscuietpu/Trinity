const Community = require("../models/Community");
const CommunityMember = require("../models/CommunityMember");
const Issue = require("../models/Issue");
const Message = require("../models/Message");
const { uploadToCloudinary } = require("../config/cloudinary");
const { syncCommunityStatusWithIssue } = require("../utils/communityStatus");
const { ALLOWED_REACTIONS, formatMessageForClient } = require("../utils/chatMessage");
const { sendSuccess, sendError } = require("../utils/response");
const { createNotification } = require("../utils/notificationService");

const getCommunityWithIssueStatus = async (communityId) => {
  const community = await Community.findById(communityId);
  if (!community) {
    return null;
  }
  await syncCommunityStatusWithIssue(community);
  const issue = await Issue.findById(community.sourceIssue).select("status");
  return { community, issue };
};

const getCommunityMessages = async (req, res) => {
  try {
    const { communityId } = req.params;
    const context = await getCommunityWithIssueStatus(communityId);
    if (!context) {
      return sendError(res, 404, "Community not found");
    }

    const messages = await Message.find({ community: communityId, isDeleted: false })
      .sort({ createdAt: 1 })
      .populate("sender", "name role avatar")
      .populate("replyTo", "content sender isAnonymous type mediaUrl createdAt");

    return sendSuccess(res, 200, "Messages fetched", {
      isChatLocked: ["Resolved", "False Claim"].includes(context.issue?.status),
      messages: messages.map(formatMessageForClient),
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch messages");
  }
};

const createCommunityMessage = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { content = "", type = "text", isAnonymous = false, replyTo = null } = req.body;
    const context = await getCommunityWithIssueStatus(communityId);

    if (!context) {
      return sendError(res, 404, "Community not found");
    }

    const membership = await CommunityMember.findOne({
      community: communityId,
      user: req.user._id,
      hasLeft: false,
      isBanned: false,
    });
    if (!membership) {
      return sendError(res, 403, "You are not a member of this community");
    }

    if (!context.community.isActive || ["Resolved", "False Claim"].includes(context.issue?.status)) {
      return sendError(res, 400, "Community chat is read-only");
    }

    const mediaFile = req.file;
    let mediaUrl = "";

    if (mediaFile) {
      const resourceType = mediaFile.mimetype.startsWith("video/") ? "video" : "image";
      mediaUrl = await uploadToCloudinary(
        mediaFile.buffer,
        "raiseit/community/messages",
        resourceType,
      );
    }

    if (!content && !mediaUrl) {
      return sendError(res, 400, "Message content or media is required");
    }

    const normalizedType = mediaUrl
      ? mediaFile.mimetype.startsWith("video/")
        ? "video"
        : "image"
      : type;

    const message = await Message.create({
      community: communityId,
      sender: req.user._id,
      content,
      type: normalizedType,
      mediaUrl,
      isAnonymous: Boolean(isAnonymous),
      replyTo,
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "name role avatar")
      .populate("replyTo", "content sender isAnonymous type mediaUrl createdAt");

    return sendSuccess(res, 201, "Message created", {
      message: formatMessageForClient(populated),
    });
  } catch (error) {
    return sendError(res, 500, "Failed to create message");
  }
};

const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!ALLOWED_REACTIONS.includes(emoji)) {
      return sendError(res, 400, "Invalid emoji reaction");
    }

    const message = await Message.findById(messageId);
    if (!message || message.isDeleted) {
      return sendError(res, 404, "Message not found");
    }

    const membership = await CommunityMember.findOne({
      community: message.community,
      user: req.user._id,
      hasLeft: false,
      isBanned: false,
    });
    if (!membership) {
      return sendError(res, 403, "You are not a member of this community");
    }

    const existingIndex = message.reactions.findIndex(
      (r) => r.by.toString() === req.user._id.toString() && r.emoji === emoji,
    );

    if (existingIndex > -1) {
      message.reactions.splice(existingIndex, 1);
    } else {
      message.reactions.push({ emoji, by: req.user._id });
    }

    await message.save();

    if (message.sender.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: message.sender,
        type: "message_reaction",
        title: "New reaction on your message",
        body: `Someone reacted ${emoji} to your message.`,
        relatedCommunity: message.community,
      });
    }

    const populated = await Message.findById(message._id)
      .populate("sender", "name role avatar")
      .populate("replyTo", "content sender isAnonymous type mediaUrl createdAt");

    return sendSuccess(res, 200, "Message reaction updated", {
      message: formatMessageForClient(populated),
    });
  } catch (error) {
    return sendError(res, 500, "Failed to react to message");
  }
};

module.exports = {
  getCommunityMessages,
  createCommunityMessage,
  reactToMessage,
};
