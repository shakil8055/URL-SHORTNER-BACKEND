const express = require("express");
const {
  createShortUrl,
  getShortUrl,
  getAllUrls,
  getDashboardData,
} = require("../controllers/urlController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/shorten", protect, createShortUrl);
router.get("/:shortId", getShortUrl);
router.get("/", protect, getAllUrls);
router.get("/dash/count", protect, getDashboardData);

module.exports = router;
