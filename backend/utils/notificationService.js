const Notification = require("../models/Notification");

const createNotification = async ({
  recipient,
  type,
  title,
  body,
  relatedIssue = null,
  relatedCommunity = null,
  relatedComment = null,
  relatedReward = null,
}) => {
  if (!recipient) {
    return null;
  }

  return Notification.create({
    recipient,
    type,
    title,
    body,
    relatedIssue,
    relatedCommunity,
    relatedComment,
    relatedReward,
  });
};

module.exports = {
  createNotification,
};
