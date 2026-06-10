const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.get("/summary", protect, dashboardController.getSummary);

module.exports = router;
