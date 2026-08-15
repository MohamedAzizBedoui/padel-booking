const nodemailer = require("nodemailer");

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;

console.log("Testing Gmail SMTP...");
console.log("Email:", user);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  auth: {
    user,
    pass,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,

  tls: {
    servername: "smtp.gmail.com",
    minVersion: "TLSv1.2",
    rejectUnauthorized: false,
  },

  logger: true,
  debug: true,
});

async function test() {
  try {
    console.log("Verifying SMTP connection...");

    await transporter.verify();

    console.log("SMTP CONNECTION SUCCESS");

    console.log("Sending test email...");

    const info = await transporter.sendMail({
      from: `"PadelBook Test" <${user}>`,
      to: user,
      subject: "PadelBook SMTP Test",
      text: "If you received this email, Gmail SMTP is working.",
    });

    console.log("EMAIL SENT SUCCESSFULLY");
    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
  } catch (error) {
    console.error("SMTP TEST FAILED");
    console.error(error);
  }
}

test();