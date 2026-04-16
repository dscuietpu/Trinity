const ALLOWED_REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

const formatMessageForClient = (messageDoc) => {
  const message = messageDoc.toObject ? messageDoc.toObject() : messageDoc;
  const sender = message.sender || null;

  return {
    ...message,
    sender: message.isAnonymous
      ? {
          _id: sender?._id || null,
          name: "Anonymous",
          role: sender?.role || "student",
          avatar: "",
        }
      : sender,
  };
};

module.exports = {
  ALLOWED_REACTIONS,
  formatMessageForClient,
};
