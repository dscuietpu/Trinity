const express = require("express");
const { getPublicDashboard } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/public", getPublicDashboard);

module.exports = router;
