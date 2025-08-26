const express = require("express");
const crypto = require("crypto");
const Otp = require("../models/Otp.js")
const { sendOtpMail } = require("../utils/mailer.js")
const { isRateLimited } =require("../utils/limiter.js")

const router = express.Router();

// Middleware for RapidAPI secret validation
router.use((req, res, next) => {
  const secret = req.headers["x-rapidapi-proxy-secret"];
  if (!secret || secret !== process.env.RAPID_PROXY_SECRET) {
    return res.status(403).json({ error: "Forbidden - Invalid RapidAPI secret" });
  }
  next();
});


// Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  // Rate limit: 3 per 15 min per email
  if (isRateLimited(email, 3, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Rate limited, try later" });
  }

  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

  await Otp.deleteMany({ email }); // clear old OTPs
  await Otp.create({
    email,
    otpHash,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });

  try {
    await sendOtpMail(email, otp);
    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send email", err:err });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email + OTP required" });

  const record = await Otp.findOne({ email });
  if (!record) return res.status(400).json({ error: "OTP not found or expired" });

  if (record.attempts >= 5) return res.status(429).json({ error: "Too many attempts" });

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  if (otpHash === record.otpHash) {
    await Otp.deleteOne({ _id: record._id });
    return res.json({ success: true, message: "OTP verified" });
  }

  record.attempts++;
  await record.save();
  res.status(401).json({ error: "Invalid OTP" });
});

module.exports = router;