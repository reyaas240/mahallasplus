"use server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function requestPasswordReset(email: string) {
  try {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // 2. Generate secure token
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 3600000); // 1 hour

      // 3. Save request to DB
      await prisma.passwordResetRequest.upsert({
        where: { token }, // This is unique
        update: {
          token,
          expires,
          email
        },
        create: {
          email,
          token,
          expires
        }
      });

      // 4. Send reset link to user
      const resetLink = `${process.env.NEXTAUTH_URL}/login/reset-password?token=${token}`;
      await sendEmail(
        email,
        "Password Reset Request - MahallasPlus",
        `Click here to reset your password: ${resetLink}`,
        `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>We received a request to reset your password for MahallasPlus.</p>
          <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; padding: 14px 28px; background: #2563eb; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
          <p style="color: #999; font-size: 11px; margin-top: 20px;">If the button doesn't work, copy and paste this link: <br/> ${resetLink}</p>
        </div>`
      );
    }

    // 5. Notify Platform Admin (as requested)
    const platformAdmins = await prisma.user.findMany({
      where: { role: "PLATFORM_ADMIN" }
    });

    for (const admin of platformAdmins) {
      if (admin.email) {
        await sendEmail(
          admin.email,
          "ALERT: Password Reset Request Notification",
          `A password reset was requested for user: ${email}`,
          `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #dc2626;">Admin Notification</h2>
            <p>A password reset has been requested for the following account:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p>This is an automated security notification for your oversight.</p>
          </div>`
        );
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("Password reset request failed:", err);
    return { success: false, error: "Failed to process request" };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    // 1. Find the request
    const request = await prisma.passwordResetRequest.findUnique({
      where: { token }
    });

    if (!request || request.expires < new Date()) {
      return { success: false, error: "Token invalid or expired" };
    }

    // 2. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 3. Update user
    await prisma.user.update({
      where: { email: request.email },
      data: { password: hashedPassword }
    });

    // 4. Delete the used request
    await prisma.passwordResetRequest.delete({
      where: { token }
    });

    return { success: true };
  } catch (err: any) {
    console.error("Password reset failed:", err);
    return { success: false, error: "Failed to update password" };
  }
}
