const Community = require("../models/Community");
const Issue = require("../models/Issue");

const syncCommunityStatusWithIssue = async (community) => {
  const sourceIssue = await Issue.findById(community.sourceIssue).select("status");

  if (!sourceIssue) {
    return community;
  }

  if (sourceIssue.status === "False Claim" && community.isActive) {
    community.isActive = false;
    community.resolvedAt = new Date();
    community.closedReason = "false_claim";
    await community.save();
  }

  if (sourceIssue.status !== "False Claim" && !community.isActive && community.closedReason === "resolved") {
    community.isActive = true;
    community.resolvedAt = null;
    community.closedReason = null;
    await community.save();
  }

  return community;
};

const syncAllActiveCommunities = async () => {
  const communities = await Community.find({
    $or: [{ isActive: true }, { closedReason: "resolved" }],
  }).select(
    "_id sourceIssue isActive resolvedAt closedReason",
  );

  for (const community of communities) {
    await syncCommunityStatusWithIssue(community);
  }
};

module.exports = {
  syncCommunityStatusWithIssue,
  syncAllActiveCommunities,
};
