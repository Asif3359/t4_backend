const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends verification email asynchronously (fire-and-forget).
 * Uses Resend API (HTTPS) so it works on Render; SMTP often times out there.
 * IMPORTANT: do not await; registration response must not wait for email.
 */
function sendVerificationEmail(to, verifyToken) {
  const baseUrl =
    process.env.APP_URL || process.env.BASE_URL || "http://localhost:5000";
  const verifyUrl = `${baseUrl}/auth/verify?token=${encodeURIComponent(verifyToken)}`;

  const from = process.env.RESEND_FROM || "onboarding@resend.dev";

  resend.emails
    .send({
      from,
      to: [to],
      subject: "Verify your email",
      html: `<!DOCTYPE html><html><body><p>Please verify your email by clicking: <a href="${verifyUrl}">${verifyUrl}</a></p></body></html>`,
    })
    .catch((err) => {
      console.error("Verification email send failed:", err.message);
    });
}

module.exports = { sendVerificationEmail };
