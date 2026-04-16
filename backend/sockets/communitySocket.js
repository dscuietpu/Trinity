const Community = require("../models/Community");
const CommunityMember = require("../models/CommunityMember");
const Issue = require("../models/Issue");
const Message = require("../models/Message");
const { syncCommunityStatusWithIssue } = require("../utils/communityStatus");
const { ALLOWED_REACTIONS, formatMessageForClient } = require("../utils/chatMessage");
const { createNotification } = require("../utils/notificationService");
const { moderateContent } = require("../utils/aiModeration");

const registerCommunitySocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("community:join-room", async ({ communityId }) => {
      if (!communityId) {
        return;
      }
      socket.join(`community:${communityId}`);
    });

    socket.on("community:leave-room", ({ communityId }) => {
      if (!communityId) {
        return;
      }
      socket.leave(`community:${communityId}`);
    });

    socket.on("community:send-message", async (payload) => {
      try {
        const {
          communityId,
          senderId,
          content,
          type = "text",
          mediaUrl = "",
          isAnonymous = false,
          replyTo = null,
        } = payload || {};

        if (!communityId || !senderId) {
          return;
        }

        if (!content && !mediaUrl) {
          return;
        }

        // AI Moderation Step
        const moderation = await moderateContent(content);
        if (!moderation.allowed) {
          socket.emit("community:message-blocked", {
            communityId,
            reason: `AI Review: ${moderation.reason}`,
            category: moderation.category
          });
          return;
        }

        const community = await Community.findById(communityId);
        if (!community) {
          return;
        }

        await syncCommunityStatusWithIssue(community);
        if (!community.isActive) {
          return;
        }

        const sourceIssue = await Issue.findById(community.sourceIssue).select("status");
        if (!sourceIssue) {
          return;
        }

        // Read-only chat when issue is resolved; fully blocked on false claim.
        if (["Resolved", "False Claim"].includes(sourceIssue.status)) {
          socket.emit("community:message-blocked", {
            communityId,
            reason:
              sourceIssue.status === "Resolved"
                ? "Issue is resolved. Community is view-only now."
                : "Issue marked as false claim. Messaging is disabled.",
          });
          return;
        }

        const membership = await CommunityMember.findOne({
          community: communityId,
          user: senderId,
          hasLeft: false,
          isBanned: false,
        });

        if (!membership) {
          return;
        }

        const message = await Message.create({
          community: communityId,
          sender: senderId,
          content: content || "",
          type,
          mediaUrl,
          isAnonymous: Boolean(isAnonymous),
          replyTo,
        });

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "name role avatar")
          .populate("replyTo", "content sender isAnonymous type mediaUrl createdAt");

        io
          .to(`community:${communityId}`)
          .emit("community:new-message", formatMessageForClient(populatedMessage));
      } catch (error) {
        // Keep socket channel resilient; failures are isolated per message.
      }
    });

    socket.on("community:react-message", async (payload) => {
      try {
        const { messageId, userId, emoji } = payload || {};
        if (!messageId || !userId || !ALLOWED_REACTIONS.includes(emoji)) {
          return;
        }

        const message = await Message.findById(messageId);
        if (!message || message.isDeleted) {
          return;
        }

        const membership = await CommunityMember.findOne({
          community: message.community,
          user: userId,
          hasLeft: false,
          isBanned: false,
        });
        if (!membership) {
          return;
        }

        const existingIndex = message.reactions.findIndex(
          (reaction) => reaction.by.toString() === userId && reaction.emoji === emoji,
        );
        if (existingIndex > -1) {
          message.reactions.splice(existingIndex, 1);
        } else {
          message.reactions.push({ emoji, by: userId });
        }

        await message.save();

        if (message.sender.toString() !== userId) {
          await createNotification({
            recipient: message.sender,
            type: "message_reaction",
            title: "New reaction on your message",
            body: `Someone reacted ${emoji} to your message.`,
            relatedCommunity: message.community,
          });
        }

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "name role avatar")
          .populate("replyTo", "content sender isAnonymous type mediaUrl createdAt");

        io.to(`community:${message.community.toString()}`).emit("community:message-updated", {
          message: formatMessageForClient(populatedMessage),
        });
      } catch (error) {
        // Keep socket channel resilient; failures are isolated per reaction.
      }
    });
  });
};

module.exports = registerCommunitySocket;
