const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER ,
    pass: process.env.GMAIL_PASS
  }
});

// Test connection on startup
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP Connection Failed:", err);
  } else {
    console.log("✅ SMTP Ready to send emails");
  }
});

async function sendOtpMail(to, otp) {
  try {
    const info = await transporter.sendMail({
      from: `"OTP Service" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`
    });

    console.log("📨 OTP Email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Failed to send OTP Email:", err);
    return false;
  }
}

module.exports = { sendOtpMail };
