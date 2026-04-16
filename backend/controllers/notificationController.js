const Notification = require("../models/Notification");
const { sendSuccess, sendError } = require("../utils/response");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    return sendSuccess(res, 200, "Notifications fetched", { notifications });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch notifications");
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      seen: false,
    });

    return sendSuccess(res, 200, "Unread count fetched", { unreadCount });
  } catch (error) {
    return sendError(res, 500, "Failed to fetch unread count");
  }
};

const markNotificationSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id,
    });

    if (!notification) {
      return sendError(res, 404, "Notification not found");
    }

    notification.seen = true;
    notification.seenAt = new Date();
    await notification.save();

    return sendSuccess(res, 200, "Notification marked as seen", { notification });
  } catch (error) {
    return sendError(res, 500, "Failed to mark notification as seen");
  }
};

const markAllSeen = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, seen: false },
      { $set: { seen: true, seenAt: new Date() } },
    );

    return sendSuccess(res, 200, "All notifications marked as seen", null);
  } catch (error) {
    return sendError(res, 500, "Failed to mark all notifications as seen");
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markNotificationSeen,
  markAllSeen,
};
