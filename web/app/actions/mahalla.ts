"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { saveFile } from "@/lib/storage";
import { authOptions } from "@/lib/auth";

export async function updateMainMahalla(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PLATFORM_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const country = formData.get("country") as string;
  const province = formData.get("province") as string;
  const district = formData.get("district") as string;
  const area = formData.get("area") as string;
  const defaultCurrency = formData.get("defaultCurrency") as string;
  const status = formData.get("status") as string;

  const logoFile = formData.get("logo") as File;
  const coverFile = formData.get("coverImage") as File;

  try {
    const current = await prisma.mainMahalla.findUnique({ where: { id } });
    if (!current) return { success: false, error: "Mahalla not found" };

    let activatedDate = current.activatedDate;
    let deactivatedDate = current.deactivatedDate;

    if (status === "ACTIVE" && current.status === "INACTIVE") {
      activatedDate = new Date();
      deactivatedDate = null; // Remove deactivated date on reactivation
    } else if (status === "INACTIVE" && current.status === "ACTIVE") {
      deactivatedDate = new Date();
    }

    const logo = await saveFile(logoFile, "main-mahallas");
    const coverImage = await saveFile(coverFile, "main-mahallas");

    await prisma.mainMahalla.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        country,
        province,
        district,
        area,
        defaultCurrency,
        status: status as any,
        activatedDate,
        deactivatedDate,
        ...(logo && { logo }),
        ...(coverImage && { coverImage })
      }
    });

    revalidatePath("/dashboard/main-mahallas");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to update mahalla" };
  }
}
