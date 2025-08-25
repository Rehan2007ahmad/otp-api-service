const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 }
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-delete

module.exports = mongoose.model('Otp', otpSchema);