require("../settings");
const nodemailer = require("nodemailer");

const transporter =
  sendemail && sendpwmail && fromsendemail && servicesmtp
    ? nodemailer.createTransport({
        service: servicesmtp,
        auth: { user: sendemail, pass: sendpwmail },
      })
    : null;

async function sendEmailWithTemplate({ to, subject, link, actionText, message, route }) {
  if (!transporter) {
    return "error";
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background: #f5f7fb; padding: 24px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
          <h2 style="margin-top: 0;">${subject}</h2>
          <p>${message}</p>
          <p>
            <a href="http://${domain}/${route}?token=${link}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px;">
              ${actionText}
            </a>
          </p>
          <p style="font-size: 12px; color: #6b7280;">MrTomXxX - ${domain}</p>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: fromsendemail,
      to,
      subject: `${subject} | ${domain}`,
      html,
    });
    return;
  } catch (error) {
    console.log("[!] Warning SMTP error, limit habis or bad config");
    return "error";
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
