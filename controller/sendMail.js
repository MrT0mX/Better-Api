require("../settings");
const nodemailer = require("nodemailer");
const { getRuntimeConfig } = require("../lib/runtime-config");

async function sendEmailWithTemplate({ to, subject, link, actionText, message, route }) {
  const config = await getRuntimeConfig();
  if (!config.sendemail || !config.sendpwmail || !config.fromsendemail || !config.servicesmtp) {
    return "error";
  }
  const transporter = nodemailer.createTransport({
    service: config.servicesmtp,
    auth: { user: config.sendemail, pass: config.sendpwmail },
  });
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background: #f5f7fb; padding: 24px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
          <h2 style="margin-top: 0;">${subject}</h2>
          <p>${message}</p>
          <p>
            <a href="${protocol}://${config.domain || domain}/${route}?token=${encodeURIComponent(link)}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px;">
              ${actionText}
            </a>
          </p>
          <p style="font-size: 12px; color: #6b7280;">MrTomXxX - ${config.domain || domain}</p>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: config.fromsendemail,
      to,
      subject: `${subject} | ${config.domain || domain}`,
      html,
    });
    return;
  } catch (error) {
    console.warn("[!] SMTP delivery failed; verify the configured mail provider and account.");
    return "error";
  } finally {
    transporter.close();
  }
}

module.exports.sendResetEmail = async (email, token) => {
  return sendEmailWithTemplate({
    to: email,
    subject: "Reset Password",
    route: "reset-password",
    link: token,
    actionText: "Reset Password",
    message: "Anda menerima email ini karena ada permintaan reset password untuk akun Anda.",
  });
};

module.exports.sendVerifyEmail = async (email, token) => {
  return sendEmailWithTemplate({
    to: email,
    subject: "Verify Your Email",
    route: "verifyemail",
    link: token,
    actionText: "Verify Email",
    message: "Silakan verifikasi email Anda agar akun aktif dan dapat menggunakan API.",
  });
};
