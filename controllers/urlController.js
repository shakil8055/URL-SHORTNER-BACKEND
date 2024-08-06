const Url = require("../models/Url");
const shortid = require("shortid");

const createShortUrl = async (req, res) => {
  const { longUrl } = req.body;
  const baseUrl = process.env.BASE_URL;

  if (!longUrl.startsWith("http")) {
    return res.status(400).json({ message: "Invalid URL" });
  }

  const urlCode = shortid.generate();
  const shortUrl = `${baseUrl}/${urlCode}`;

  try {
    let url = await Url.findOne({ longUrl });
    if (url) {
      return res.json(url);
    }

    url = new Url({ longUrl, shortUrl, urlCode, userId: req.user.id });
    await url.save();
    res.json(url);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getShortUrl = async (req, res) => {
  const { shortId } = req.params;
  try {
    const url = await Url.findOne({ urlCode: shortId });
    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    url.clicks++;
    await url.save();
    res.redirect(url.longUrl);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getAllUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id });
    res.status(201).json({ urls });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id });
    const dailyCounts = urls.reduce((acc, url) => {
      const date = url.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    const monthlyCounts = urls.reduce((acc, url) => {
      const month = url.createdAt.toISOString().split("T")[0].substring(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    res.json({
      dailyCounts: Object.entries(dailyCounts).map(([date, count]) => ({
        date,
        count,
      })),
      monthlyCounts: Object.entries(monthlyCounts).map(([month, count]) => ({
        month,
        count,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

module.exports = {
  createShortUrl,
  getShortUrl,
  getAllUrls,
  getDashboardData,
};
