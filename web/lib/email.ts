import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, text: string, html: string) {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "global" }
  });

  if (!settings || !settings.smtpHost) {
    console.error("SMTP settings not configured");
    return { success: false, error: "Email service not configured. Please contact platform admin." };
  }

  try {
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

    await transporter.sendMail({
      from: `"${settings.smtpFromName || "MahallasPlus"}" <${settings.smtpFromEmail}>`,
      to,
      subject,
      text,
      html,
      headers: {
        "X-Priority": "1 (Highest)",
        "X-MSMail-Priority": "High",
        "Importance": "High",
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Email send failed:", err);
    return { success: false, error: err.message };
  }
}
