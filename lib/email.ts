import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(
  email: string,
  token: string
) {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

  // Log URL to terminal for instant local testing
  console.log("==========================================");
  console.log("🔑 PASSWORD RESET URL FOR:", email);
  console.log(resetUrl);
  console.log("==========================================");

  if (!emailUser || !emailPassword) {
    console.warn("EMAIL_USER or EMAIL_PASSWORD missing in environment.");
    return { devMode: true, resetUrl };
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    const info = await Promise.race([
      transporter.sendMail({
        from: `"PadelBook" <${emailUser}>`,
        to: email,
        subject: "Reset your PadelBook password",
        text: `Reset your PadelBook password here:\n\n${resetUrl}\n\nThis link is valid for 30 minutes.\n\nIf you did not request this, ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px; margin: auto;">
            <h2>Reset your password</h2>
            <p>You requested to reset your password for PadelBook.</p>
            <p>
              <a href="${resetUrl}" style="display:inline-block; background:#b8f500; color:#000; padding:12px 18px; border-radius:10px; text-decoration:none; font-weight:bold;">
                Reset password
              </a>
            </p>
            <p>This link is valid for 30 minutes.</p>
            <p>If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Email sending timed out. Check server console for reset URL."));
        }, 10000);
      }),
    ]);

    return info;
  } catch (error) {
    console.error("Nodemailer sendMail failed:", error);
    throw error;
  }
}
