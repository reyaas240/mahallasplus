"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateUserProfile(data: { name: string, email: string }) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        // email: data.email, // Keeping email read-only for now to avoid session issues, or allow it if you handle re-auth
      }
    });
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to update profile" };
  }
}

export async function changeUserPassword(data: { current: string, new: string }) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || !user.password) return { success: false, error: "User not found" };

    const isValid = await bcrypt.compare(data.current, user.password);
    if (!isValid) return { success: false, error: "Current password is incorrect" };

    const hashed = await bcrypt.hash(data.new, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed }
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to change password" };
  }
}
