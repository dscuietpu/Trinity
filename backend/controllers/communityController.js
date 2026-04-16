const Community = require("../models/Community");
const CommunityMember = require("../models/CommunityMember");
const { syncAllActiveCommunities, syncCommunityStatusWithIssue } = require("../utils/communityStatus");
const { sendSuccess, sendError } = require("../utils/response");

const getIsChatLocked = (issueStatus) => {
  return ["Resolved", "False Claim"].includes(issueStatus);
};

const getCommunities = async (req, res) => {
  try {
    await syncAllActiveCommunities();

    const communities = await Community.find()
      .sort({ createdAt: -1 })
      .populate("sourceIssue", "title status category voteCount")
      .populate("moderator", "name role college");

    const communitiesWithChatState = communities.map((community) => {
      const item = community.toObject();
      item.isChatLocked = getIsChatLocked(item.sourceIssue?.status);
      return item;
    });

    return sendSuccess(res, 200, "Communities fetched", {
      communities: communitiesWithChatState,
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch communities");
  }
};

const getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("sourceIssue", "title description status category voteCount")
      .populate("moderator", "name role college");

    if (!community) {
      return sendError(res, 404, "Community not found");
    }

    await syncCommunityStatusWithIssue(community);

    const members = await CommunityMember.find({
      community: community._id,
      hasLeft: false,
      isBanned: false,
    })
      .populate("user", "name role college avatar")
      .sort({ createdAt: 1 });

    const communityPayload = community.toObject();
    communityPayload.isChatLocked = getIsChatLocked(communityPayload.sourceIssue?.status);

    return sendSuccess(res, 200, "Community fetched", {
      community: communityPayload,
      members,
    });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch community");
  }
};

const joinCommunity = async (req, res) => {
  try {
    const { isAnonymous } = req.body;
    const community = await Community.findById(req.params.id).populate("sourceIssue", "status");

    if (!community) {
      return sendError(res, 404, "Community not found");
    }

    await syncCommunityStatusWithIssue(community);

    if (!community.isActive || community.sourceIssue?.status === "False Claim") {
      return sendError(res, 400, "Community is closed", {
        closedReason: community.closedReason,
      });
    }

    const existingMember = await CommunityMember.findOne({
      community: community._id,
      user: req.user._id,
    });

    if (existingMember && !existingMember.hasLeft && !existingMember.isBanned) {
      return sendSuccess(res, 200, "Already a community member", {
        communityId: community._id,
      });
    }

    if (existingMember && existingMember.isBanned) {
      return sendError(res, 403, "You are banned from this community");
    }

    if (existingMember && existingMember.hasLeft) {
      existingMember.hasLeft = false;
      existingMember.leftAt = null;
      existingMember.isAnonymous = Boolean(isAnonymous);
      await existingMember.save();
    } else if (!existingMember) {
      await CommunityMember.create({
        community: community._id,
        user: req.user._id,
        isAnonymous: Boolean(isAnonymous),
        role: community.moderator?.toString() === req.user._id.toString() ? "moderator" : "member",
      });
    }

    community.memberCount += 1;
    await community.save();

    return sendSuccess(res, 200, "Joined community successfully", {
      memberCount: community.memberCount,
      communityId: community._id,
    });
  } catch (error) {
    return sendError(res, 500, "Failed to join community");
  }
};

module.exports = {
  getCommunities,
  getCommunityById,
  joinCommunity,
};
