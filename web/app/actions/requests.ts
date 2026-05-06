"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

export async function verifyRequest(requestId: string) {
  try {
    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { isVerified: true }
    });
    revalidatePath("/dashboard/requests");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to verify request" };
  }
}

export async function approveRequest(requestId: string) {
  try {
    const request = await prisma.registrationRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.status !== "PENDING") return { success: false, error: "Request already processed" };
    if (!request.isVerified) return { success: false, error: "Request must be verified before approval" };

    // 1. Generate random password
    const rawPassword = Math.random().toString(36).slice(-10) + "A1!";
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // 2. Create the Main Mahalla
    const mahalla = await prisma.mainMahalla.create({
      data: {
        name: request.mahallaName,
        email: request.email,
        phone: request.phone,
        address: request.address,
        country: request.country,
        province: request.province,
        district: request.district,
        status: "ACTIVE",
        licensePlanId: request.licensePlanId
      }
    });

    // 2.1 Link Invoices and Initialize Subscription
    if (request.licensePlanId) {
      // Link previous invoices to this mahalla
      await prisma.invoice.updateMany({
        where: { registrationRequestId: request.id },
        data: { mainMahallaId: mahalla.id }
      });

      const plan = await prisma.licensePlan.findUnique({ where: { id: request.licensePlanId } });
      if (plan) {
        let nextInvoiceDate = new Date();
        if (plan.type === "MONTHLY") nextInvoiceDate.setMonth(nextInvoiceDate.getMonth() + 1);
        else if (plan.type === "ANNUALLY") nextInvoiceDate.setFullYear(nextInvoiceDate.getFullYear() + 1);
        else nextInvoiceDate.setFullYear(nextInvoiceDate.getFullYear() + 100); // Lifetime

        await prisma.subscription.create({
          data: {
            mainMahallaId: mahalla.id,
            licensePlanId: plan.id,
            nextInvoiceDate,
            status: "ACTIVE"
          }
        });
      }
    }

    // 3. Create the Main Admin User
    const existingUser = await prisma.user.findUnique({ where: { email: request.email } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: request.email,
          name: request.fullName,
          password: hashedPassword,
          role: "MAIN_ADMIN",
          mainMahallaId: mahalla.id,
        }
      });
    } else {
       // Update existing user if needed, or link them
       await prisma.user.update({
         where: { email: request.email },
         data: {
           role: "MAIN_ADMIN",
           mainMahallaId: mahalla.id,
           password: hashedPassword
         }
       });
    }

    // 4. Send Confirmation Email
    const subject = `Congratulations! Your Mahalla "${request.mahallaName}" is Approved`;
    const text = `Your registration request has been approved. You can now access the MahallasPlus platform. 
    Login URL: ${process.env.NEXTAUTH_URL}/login
    Email: ${request.email}
    Password: ${rawPassword}`;
    
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 40px; background: #f8fafc; border-radius: 24px; border: 1px solid #e2e8f0;">
        <h1 style="color: #0f172a; margin-top: 0;">Welcome to MahallasPlus!</h1>
        <p style="color: #475569; font-size: 16px; line-height: 1.6;">Your registration for <strong>${request.mahallaName}</strong> has been approved by the platform administration. Your account is now active.</p>
        
        <div style="background: white; padding: 32px; border-radius: 16px; border: 1px solid #cbd5e1; margin: 32px 0;">
          <h2 style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px; margin-top: 0;">Your Credentials</h2>
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 12px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Login Email</label>
            <div style="font-size: 18px; font-weight: bold; color: #0f172a;">${request.email}</div>
          </div>
          <div>
            <label style="display: block; font-size: 12px; color: #94a3b8; font-weight: bold; text-transform: uppercase;">Temporary Password</label>
            <div style="font-size: 18px; font-weight: bold; color: #2563eb; letter-spacing: 1px;">${rawPassword}</div>
          </div>
        </div>

        <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 32px;">
          Please change your password after your first login for security purposes.
        </p>
      </div>
    `;

    await sendEmail(request.email, subject, text, html);

    // 5. Update Request Status
    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" }
    });

    revalidatePath("/dashboard/requests");
    revalidatePath("/dashboard/main-mahallas");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || "Failed to approve request" };
  }
}

export async function rejectRequest(requestId: string) {
  try {
    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" }
    });

    revalidatePath("/dashboard/requests");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to reject request" };
  }
}
