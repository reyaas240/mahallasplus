"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLicensePlans() {
  return prisma.licensePlan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          mainMahallas: true,
          requests: true,
        }
      }
    }
  });
}

export async function getPublicLicensePlans() {
  return prisma.licensePlan.findMany({
    where: { status: "ACTIVE" },
    orderBy: { basePrice: "asc" }
  });
}

export async function createLicensePlan(formData: FormData) {
  const name = formData.get("name") as string;
  const type = formData.get("type") as any;
  const basePrice = parseFloat(formData.get("basePrice") as string);
  const salePriceVal = formData.get("salePrice") as string;
  const salePrice = salePriceVal ? parseFloat(salePriceVal) : null;
  const isSaleActive = formData.get("isSaleActive") === "true";
  const description = formData.get("description") as string;
  const featuresStr = formData.get("features") as string;
  const features = featuresStr.split(",").map(f => f.trim()).filter(f => f);
  const featureConfig = JSON.parse(formData.get("featureConfig") as string || "{}");

  try {
    await prisma.licensePlan.create({
      data: {
        name,
        type,
        basePrice,
        salePrice,
        isSaleActive,
        description,
        features,
        featureConfig
      }
    });
    revalidatePath("/dashboard/licenses");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateLicensePlan(id: string, formData: FormData) {
  try {
    // Check if plan is in use
    const usage = await prisma.licensePlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            mainMahallas: true,
            requests: true,
          }
        }
      }
    });

    if (!usage) return { success: false, error: "Plan not found" };

    const inUse = usage._count.mainMahallas > 0 || usage._count.requests > 0;
    if (inUse) {
      return { success: false, error: "Cannot edit this plan because it is already in use by registered Mahallas or pending requests. Please copy this plan instead." };
    }

    const name = formData.get("name") as string;
    const type = formData.get("type") as any;
    const basePrice = parseFloat(formData.get("basePrice") as string);
    const salePriceVal = formData.get("salePrice") as string;
    const salePrice = salePriceVal ? parseFloat(salePriceVal) : null;
    const isSaleActive = formData.get("isSaleActive") === "true";
    const description = formData.get("description") as string;
    const featuresStr = formData.get("features") as string;
    const features = featuresStr.split(",").map(f => f.trim()).filter(f => f);
    const featureConfig = JSON.parse(formData.get("featureConfig") as string || "{}");

    await prisma.licensePlan.update({
      where: { id },
      data: {
        name,
        type,
        basePrice,
        salePrice,
        isSaleActive,
        description,
        features,
        featureConfig
      }
    });
    revalidatePath("/dashboard/licenses");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function toggleLicensePlanStatus(id: string, currentStatus: string) {
  const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
  await prisma.licensePlan.update({
    where: { id },
    data: { status: newStatus as any }
  });
  revalidatePath("/dashboard/licenses");
  return { success: true };
}

export async function deleteLicensePlan(id: string) {
  try {
    await prisma.licensePlan.delete({ where: { id } });
    revalidatePath("/dashboard/licenses");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: "Cannot delete plan as it is in use." };
  }
}
