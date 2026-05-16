"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ──────────── Request Categories ────────────

export async function getRequestCategories(committeeId: string) {
  return prisma.requestCategory.findMany({
    where: { committeeId },
    orderBy: { name: "asc" },
  });
}

export async function createRequestCategory(committeeId: string, name: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN", "COMMITTEE_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.requestCategory.create({
      data: { name: name.trim(), committeeId },
    });
    revalidatePath(`/dashboard/committees/${committeeId}`);
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") return { success: false, error: "Category already exists." };
    return { success: false, error: "Failed to create category." };
  }
}

export async function deleteRequestCategory(id: string, committeeId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN", "COMMITTEE_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.requestCategory.delete({ where: { id } });
    revalidatePath(`/dashboard/committees/${committeeId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete category." };
  }
}

export async function updateRequestCategory(id: string, committeeId: string, name: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN", "COMMITTEE_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.requestCategory.update({
      where: { id },
      data: { name: name.trim() },
    });
    revalidatePath(`/dashboard/committees/${committeeId}`);
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") return { success: false, error: "Category already exists." };
    return { success: false, error: "Failed to update category." };
  }
}

// ──────────── Project Masters ────────────

export async function getProjectMasters(committeeId: string) {
  return prisma.projectMaster.findMany({
    where: { committeeId },
    orderBy: { name: "asc" },
  });
}

export async function createProjectMaster(committeeId: string, name: string, description?: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN", "COMMITTEE_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.projectMaster.create({
      data: { name: name.trim(), description: description?.trim() || null, committeeId },
    });
    revalidatePath(`/dashboard/committees/${committeeId}`);
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") return { success: false, error: "Project already exists." };
    return { success: false, error: "Failed to create project." };
  }
}

export async function deleteProjectMaster(id: string, committeeId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN", "COMMITTEE_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.projectMaster.delete({ where: { id } });
    revalidatePath(`/dashboard/committees/${committeeId}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete project." };
  }
}

export async function updateProjectMaster(id: string, committeeId: string, name: string, description?: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN", "COMMITTEE_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.projectMaster.update({
      where: { id },
      data: { name: name.trim(), description: description?.trim() || null },
    });
    revalidatePath(`/dashboard/committees/${committeeId}`);
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") return { success: false, error: "Project already exists." };
    return { success: false, error: "Failed to update project." };
  }
}
