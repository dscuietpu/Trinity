const Issue = require("../models/Issue");
const { sendSuccess, sendError } = require("../utils/response");

const DASHBOARD_CACHE_TTL_MS = 60 * 1000;
let dashboardCache = {
  data: null,
  expiresAt: 0,
};

const getPublicDashboard = async (req, res) => {
  try {
    if (dashboardCache.data && Date.now() < dashboardCache.expiresAt) {
      return sendSuccess(res, 200, "Public dashboard analytics fetched", dashboardCache.data);
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diffToMonday = (day + 6) % 7;
    weekStart.setDate(weekStart.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const [weeklyRaised, weeklyResolved, monthlyRaised, monthlyResolved] =
      await Promise.all([
        Issue.countDocuments({ createdAt: { $gte: weekStart } }),
        Issue.countDocuments({
          status: "Resolved",
          resolvedAt: { $gte: weekStart },
        }),
        Issue.countDocuments({ createdAt: { $gte: monthStart } }),
        Issue.countDocuments({
          status: "Resolved",
          resolvedAt: { $gte: monthStart },
        }),
      ]);

    const categoryBreakdown = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", value: "$count" } },
      { $sort: { value: -1 } },
    ]);

    const statusBreakdown = await Issue.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", value: "$count" } },
      { $sort: { value: -1 } },
    ]);

    const monthlyTrend = await Issue.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          raised: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          label: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" },
            ],
          },
          raised: 1,
          resolved: 1,
        },
      },
    ]);

    const mapPoints = await Issue.find({
      "location.coords.lat": { $ne: null },
      "location.coords.lng": { $ne: null },
    })
      .select(
        "title category status voteCount location.coords location.zone location.building createdAt",
      )
      .lean();

    const hotspotMap = new Map();
    for (const issue of mapPoints) {
      const lat = Number(issue.location?.coords?.lat);
      const lng = Number(issue.location?.coords?.lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) continue;

      const gridLat = Number(lat.toFixed(2));
      const gridLng = Number(lng.toFixed(2));
      const key = `${gridLat},${gridLng}`;
      const current = hotspotMap.get(key) || {
        lat: gridLat,
        lng: gridLng,
        count: 0,
        totalVotes: 0,
      };

      current.count += 1;
      current.totalVotes += issue.voteCount || 0;
      hotspotMap.set(key, current);
    }

    const hotspots = Array.from(hotspotMap.values())
      .filter((h) => h.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 25);

    const payload = {
      summary: {
        weekly: { raised: weeklyRaised, resolved: weeklyResolved },
        monthly: { raised: monthlyRaised, resolved: monthlyResolved },
      },
      charts: {
        monthlyTrend,
        categoryBreakdown,
        statusBreakdown,
      },
      map: {
        points: mapPoints,
        hotspots,
      },
    };

    dashboardCache = {
      data: payload,
      expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS,
    };

    return sendSuccess(res, 200, "Public dashboard analytics fetched", payload);
  } catch (error) {
    return sendError(res, 500, "Failed to fetch public dashboard analytics");
  }
};

module.exports = {
  getPublicDashboard,
};
