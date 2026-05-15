"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getSystemSettings() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PLATFORM_ADMIN") {
    throw new Error("Unauthorized");
  }

  const settings = await prisma.systemSettings.findUnique({
    where: { id: "global" }
  });

  if (!settings) {
    return await prisma.systemSettings.create({
      data: { id: "global" }
    });
  }

  return settings;
}

export async function getPublicSettings() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "global" },
    select: { 
      recaptchaSiteKey: true,
      logoUrl: true
    }
  });
  return settings;
}

export async function updateSystemSettings(data: any) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PLATFORM_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.systemSettings.upsert({
      where: { id: "global" },
      update: {
        smtpEncryption: data.smtpEncryption || null,
        recaptchaSiteKey: data.recaptchaSiteKey || null,
        recaptchaSecretKey: data.recaptchaSecretKey || null,
        bankName: data.bankName || null,
        accountHolder: data.accountHolder || null,
        accountNumber: data.accountNumber || null,
        bankInstructions: data.bankInstructions || null,
        logoUrl: data.logoUrl || null,
        whatsappBroadcastsEnabled: data.whatsappBroadcastsEnabled !== undefined ? data.whatsappBroadcastsEnabled : true,
      },
      create: {
        id: "global",
        smtpHost: data.smtpHost || null,
        smtpPort: data.smtpPort ? parseInt(data.smtpPort) : null,
        smtpUser: data.smtpUser || null,
        smtpPassword: data.smtpPassword || null,
        smtpFromEmail: data.smtpFromEmail || null,
        smtpFromName: data.smtpFromName || null,
        smtpEncryption: data.smtpEncryption || null,
        recaptchaSiteKey: data.recaptchaSiteKey || null,
        recaptchaSecretKey: data.recaptchaSecretKey || null,
        bankName: data.bankName || null,
        accountHolder: data.accountHolder || null,
        accountNumber: data.accountNumber || null,
        bankInstructions: data.bankInstructions || null,
        logoUrl: data.logoUrl || null,
        whatsappBroadcastsEnabled: data.whatsappBroadcastsEnabled !== undefined ? data.whatsappBroadcastsEnabled : true,
      }
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message || "Failed to update settings" };
  }
}

export async function testSmtpConnection(data: any) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PLATFORM_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const nodemailer = await import("nodemailer");

  try {
    const transporter = nodemailer.createTransport({
      host: data.smtpHost,
      port: parseInt(data.smtpPort),
      secure: data.smtpEncryption === "SSL",
      auth: {
        user: data.smtpUser,
        pass: data.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false // Often needed for custom/local servers
      }
    });

    await transporter.verify();

    // Send a real test email
    await transporter.sendMail({
      from: `"${data.smtpFromName}" <${data.smtpFromEmail}>`,
      to: session.user.email as string,
      subject: "MahallasPlus - SMTP Test Connection",
      text: "This is a test email from MahallasPlus to verify your SMTP configuration. If you received this, your settings are correct!",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #2563eb;">SMTP Test Successful</h2>
          <p>This is a test email from <b>MahallasPlus</b> to verify your SMTP configuration.</p>
          <p>If you are reading this, your SMTP server (<b>${data.smtpHost}</b>) is correctly configured and ready to use!</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">This email was sent to ${session.user.email} at the request of the platform admin.</p>
        </div>
      `,
    });

    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message || "Connection failed" };
  }
}
