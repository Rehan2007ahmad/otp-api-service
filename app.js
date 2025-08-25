const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const otpRoutes = require("./routes/otp.js");
const app = express();
const cors = require('cors')

const cron = require("node-cron");
const axios = require("axios");

const ALIVE_URL = process.env.ALIVE_URL

// Schedule: every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    const res = await axios.get(ALIVE_URL);
    console.log("✅ Keep-alive ping successful:", res.status);
  } catch (err) {
    console.error("❌ Keep-alive ping failed:", err.message);
  }
});

app.use(express.json());

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Allow all origins
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization", "X-RapidAPI-Key"]
}));


app.get("/healthz", (_, res) => res.send("ok"));
app.use("/", otpRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log("OTP API running on port", process.env.PORT)
    );
  })
  .catch(err => console.error("MongoDB connection error:", err));
