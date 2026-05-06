"use server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function generateAndSendOtp(email: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    await prisma.otpVerification.upsert({
      where: { email },
      update: { otp, expiresAt },
      create: { email, otp, expiresAt }
    });

    const subject = "Your MahallasPlus Verification Code";
    const text = `Your MahallasPlus Verification Code: ${otp}. This code will expire in 10 minutes.`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; background-color: #f4f7fa; }
            .card { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
            .header { text-align: center; margin-bottom: 32px; }
            .logo-text { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.025em; }
            .content { text-align: center; color: #475569; line-height: 1.6; }
            .otp-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 32px 0; }
            .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 0.25em; color: #2563eb; }
            .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <div class="logo-text">MahallasPlus</div>
              </div>
              <div class="content">
                <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">Verify your identity</h1>
                <p>To complete your mahalla onboarding, please use the 6-digit verification code below. This code is valid for 10 minutes.</p>
                <div class="otp-box">
                  <div class="otp-code">${otp}</div>
                </div>
                <p style="font-size: 14px;">If you did not request this code, you can safely ignore this email.</p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} MahallasPlus Platform. All rights reserved.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return await sendEmail(email, subject, text, html);
  } catch (err: any) {
    console.error(err);
    return { success: false, error: "Failed to generate OTP" };
  }
}

export async function verifyOtp(email: string, otp: string) {
  const record = await prisma.otpVerification.findUnique({
    where: { email }
  });

  if (!record) return { success: false, error: "No OTP found for this email" };
  if (record.otp !== otp) return { success: false, error: "Invalid verification code" };
  if (new Date() > record.expiresAt) return { success: false, error: "OTP has expired" };

  // Delete OTP after successful verification
  await prisma.otpVerification.delete({ where: { email } });

  return { success: true };
}
