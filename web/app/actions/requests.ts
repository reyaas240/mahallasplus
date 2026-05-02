"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function approveRequest(requestId: string) {
  try {
    const request = await prisma.registrationRequest.findUnique({
      where: { id: requestId }
    });

    if (!request) return { success: false, error: "Request not found" };
    if (request.status !== "PENDING") return { success: false, error: "Request already processed" };

    // 1. Mark as approved
    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" }
    });

    // 2. Create the Main Mahalla
    const mahalla = await prisma.mainMahalla.create({
      data: {
        name: request.mahallaName,
        email: request.email,
        status: "ACTIVE"
      }
    });

    // 3. Create the Main Admin User
    const password = await bcrypt.hash("Mahalla123!", 10);
    
    // Check if user exists first to prevent unique constraint error
    const existingUser = await prisma.user.findUnique({ where: { email: request.email } });
    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: request.email,
          name: request.fullName,
          password,
          role: "MAIN_ADMIN",
          mainMahallaId: mahalla.id,
        }
      });
    }

    revalidatePath("/dashboard/requests");
    revalidatePath("/dashboard/main-mahallas");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to approve request" };
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
