const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_Oc5zI9AadiRW@ep-winter-math-aqzei3qn.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function test() {
  try {
    const email = "test@example.com";
    const otp = "123456";
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    console.log("Upserting OTP...");
    await prisma.otpVerification.upsert({
      where: { email },
      update: { otp, expiresAt },
      create: { email, otp, expiresAt }
    });
    console.log("OTP upsert successful.");

    const settings = await prisma.systemSettings.findUnique({
      where: { id: "global" }
    });

    console.log("Found settings", settings.smtpHost);

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort || 587,
      secure: settings.smtpEncryption === "SSL",
      auth: {
        user: settings.smtpUser || "",
        pass: settings.smtpPassword || "",
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log("Sending email...");
    await transporter.sendMail({
      from: `"${settings.smtpFromName || "MahallasPlus"}" <${settings.smtpFromEmail}>`,
      to: email,
      subject: "Test",
      text: "Test",
      html: "Test"
    });
    console.log("Email sent successfully!");
  } catch (err) {
    console.error("Failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
