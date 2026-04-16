const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
dotenv.config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");
const communityRoutes = require("./routes/communityRoutes");
const messageRoutes = require("./routes/messageRoutes");
const commentRoutes = require("./routes/commentRoutes");
const flagRoutes = require("./routes/flagRoutes");
const moderationRoutes = require("./routes/moderationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const registerCommunitySocket = require("./sockets/communitySocket");
const { initWeeklyRewardCron } = require("./cron/weeklyRewards");
const { sendSuccess } = require("./utils/response");
const { notFound, globalErrorHandler } = require("./middleware/errorMiddleware");
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api", messageRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/flags", flagRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/dashboard", dashboardRoutes);
registerCommunitySocket(io);

app.get("/api/health", (req, res) => {
  return sendSuccess(res, 200, "RaiseIt API is running", null);
});

app.use(notFound);
app.use(globalErrorHandler);
initWeeklyRewardCron();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
