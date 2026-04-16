const Community = require("../models/Community");
const CommunityMember = require("../models/CommunityMember");
const Issue = require("../models/Issue");
const Vote = require("../models/Vote");
const { uploadToCloudinary } = require("../config/cloudinary");
const { sendSuccess, sendError } = require("../utils/response");
const { createNotification } = require("../utils/notificationService");
const { moderateContent } = require("../utils/aiModeration");

const buildUniqueSlug = async (title) => {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const fallback = `issue-${Date.now()}`;
  const seed = base || fallback;
  let slug = seed;
  let attempt = 1;

  while (await Issue.exists({ shareableSlug: slug })) {
    slug = `${seed}-${attempt}`;
    attempt += 1;
  }

  return slug;
};

const canUploadMedia = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

const createIssue = async (req, res) => {
  try {
    const { title, description, category, isAnonymous, building, zone, lat, lng } =
      req.body;

    if (!title || !description || !category) {
      return sendError(res, 400, "Title, description and category are required");
    }

    // AI Moderation Step
    const moderation = await moderateContent(`${title}\n${description}`);
    if (!moderation.allowed) {
      return sendError(res, 403, `Content rejected: ${moderation.reason}`, { 
        moderationCategory: moderation.category 
      });
    }

    const photoFile = req.files?.photo?.[0];
    const videoFile = req.files?.video?.[0];

    if ((photoFile || videoFile) && !canUploadMedia()) {
      return sendError(res, 500, "Cloudinary is not configured for media uploads");
    }

    let photo = "";
    let video = "";

    if (photoFile) {
      photo = await uploadToCloudinary(photoFile.buffer, "raiseit/issues/photos", "image");
    }

    if (videoFile) {
      video = await uploadToCloudinary(videoFile.buffer, "raiseit/issues/videos", "video");
    }

    let mediaType = "none";
    if (photo && video) mediaType = "both";
    else if (photo) mediaType = "photo";
    else if (video) mediaType = "video";

    const shareableSlug = await buildUniqueSlug(title);

    const issue = await Issue.create({
      title,
      description,
      category,
      photo,
      video,
      mediaType,
      location: {
        building: building || "",
        zone: zone || "",
        coords: {
          lat: lat !== undefined && lat !== "" ? Number(lat) : null,
          lng: lng !== undefined && lng !== "" ? Number(lng) : null,
        },
      },
      reportedBy: req.user._id,
      isAnonymous: Boolean(isAnonymous),
      shareableSlug,
      flagCount: 0,
    });

    return sendSuccess(res, 201, "Issue created", { issue });
  } catch (error) {
    return sendError(res, 500, "Failed to create issue");
  }
};

const getIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .sort({ voteCount: -1, createdAt: -1 })
      .populate("reportedBy", "name role college avatar")
      .populate("community", "name isActive memberCount");

    return sendSuccess(res, 200, "Issues fetched", { issues });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch issues");
  }
};

const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("reportedBy", "name role college avatar")
      .populate("community", "name isActive memberCount")
      .populate("assignedAuthority", "name role authorityInfo");

    if (!issue) {
      return sendError(res, 404, "Issue not found");
    }

    return sendSuccess(res, 200, "Issue fetched", { issue });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch issue");
  }
};

const upvoteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return sendError(res, 404, "Issue not found");
    }

    const existingVote = await Vote.findOne({
      issue: issue._id,
      user: req.user._id,
    });

    if (existingVote) {
      return sendError(res, 409, "You have already upvoted this issue");
    }

    await Vote.create({
      issue: issue._id,
      user: req.user._id,
    });

    issue.voteCount += 1;

    if (issue.voteCount >= 50 && !issue.communityTriggered && !issue.community) {
      const locationString = [issue.location?.building, issue.location?.zone]
        .filter(Boolean)
        .join(", ");

      const community = await Community.create({
        name: `${issue.title} Community`,
        description: `Auto-created from issue: ${issue.title}`,
        coverImage: issue.photo || "",
        coverVideo: issue.video || "",
        sourceIssue: issue._id,
        category: issue.category,
        location: locationString,
        moderator: issue.reportedBy,
        memberCount: 1,
        triggerVoteCount: 50,
        createdBy: "system",
      });

      await CommunityMember.create({
        community: community._id,
        user: issue.reportedBy,
        role: "moderator",
        isAnonymous: issue.isAnonymous,
      });

      issue.community = community._id;
      issue.communityTriggered = true;
      issue.status = "In Progress";

      await createNotification({
        recipient: issue.reportedBy,
        type: "community_created",
        title: "Community created for your issue",
        body: `A community was created for "${issue.title}" after reaching 50 upvotes.`,
        relatedIssue: issue._id,
        relatedCommunity: community._id,
      });
    }

    await issue.save();

    return sendSuccess(res, 200, "Issue upvoted", {
      voteCount: issue.voteCount,
      issue,
    });
  } catch (error) {
    return sendError(res, 500, "Failed to upvote issue");
  }
};

const resolveIssueByUser = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return sendError(res, 404, "Issue not found");
    }

    if (issue.reportedBy.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Only the original reporter can mark this issue as resolved");
    }

    if (issue.status === "Resolved") {
      return sendError(res, 400, "Issue is already resolved");
    }

    issue.status = "Resolved";
    issue.resolvedAt = new Date();
    issue.resolvedBy = req.user._id;
    await issue.save();

    // Notify assigned authority if any
    if (issue.assignedAuthority) {
      await createNotification({
        recipient: issue.assignedAuthority,
        type: "issue_resolved_by_user",
        title: "Issue resolved by reporter",
        body: `The reporter has confirmed that "${issue.title}" is resolved.`,
        relatedIssue: issue._id,
      });
    }

    return sendSuccess(res, 200, "Issue resolved by you successfully", { issue });
  } catch (error) {
    return sendError(res, 500, "Failed to resolve issue");
  }
};

const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id);
    if (!issue) {
      return sendError(res, 404, "Issue not found");
    }

    if (issue.reportedBy.toString() !== req.user._id.toString()) {
      return sendError(res, 403, "Only the original reporter can delete this issue");
    }

    await Issue.deleteOne({ _id: id });

    return sendSuccess(res, 200, "Issue deleted successfully", null);
  } catch (error) {
    return sendError(res, 500, "Failed to delete issue");
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  upvoteIssue,
  deleteIssue,
  resolveIssueByUser,
};
