const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

function sendVerificationEmail(to, verifyToken) {
  const baseUrl =
    process.env.APP_URL || process.env.BASE_URL || "http://localhost:5000";
  const verifyUrl = `${baseUrl}/auth/verify?token=${encodeURIComponent(verifyToken)}`;

  const mailOptions = {
    from:
      process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@example.com",
    to,
    subject: "Verify your email",
    text: `Please verify your email by opening this link: ${verifyUrl}`,
    html: `<!DOCTYPE html><html><body><p>Please verify your email by clicking: <a href="${verifyUrl}">${verifyUrl}</a></p></body></html>`,
  };

  transporter.sendMail(mailOptions).catch((err) => {
    console.error("Verification email send failed:", err.message);
  });
}

module.exports = { sendVerificationEmail };
