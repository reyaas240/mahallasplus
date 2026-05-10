"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { saveFile } from "@/lib/storage";
import { authOptions } from "@/lib/auth";

export async function updateMainMahalla(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  const isPlatformAdmin = session.user.role === "PLATFORM_ADMIN";
  const isMainAdminOfThisMahalla = session.user.role === "MAIN_ADMIN" && session.user.mainMahallaId === id;

  if (!isPlatformAdmin && !isMainAdminOfThisMahalla) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const country = formData.get("country") as string;
  const province = formData.get("province") as string;
  const district = formData.get("district") as string;
  const divisionalSecretariat = formData.get("divisionalSecretariat") as string;
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

    const effectiveStatus = status || current.status;

    if (effectiveStatus === "ACTIVE" && current.status === "INACTIVE") {
      activatedDate = new Date();
      deactivatedDate = null;
    } else if (effectiveStatus === "INACTIVE" && current.status === "ACTIVE") {
      deactivatedDate = new Date();
    }

    const logo = await saveFile(logoFile, "main-mahallas");
    const coverImage = await saveFile(coverFile, "main-mahallas");

    await prisma.mainMahalla.update({
      where: { id },
      data: {
        name: name || current.name,
        email: email || current.email,
        phone: phone || current.phone,
        address: address || current.address,
        country: country || current.country,
        province: province || current.province,
        district: district || current.district,
        divisionalSecretariat: divisionalSecretariat || current.divisionalSecretariat,
        area: area || current.area,
        defaultCurrency: defaultCurrency || current.defaultCurrency,
        status: (effectiveStatus as any) || current.status,
        activatedDate,
        deactivatedDate,
        ...(logo && { logo }),
        ...(coverImage && { coverImage })
      }
    });

    revalidatePath("/dashboard/main-mahallas");
    revalidatePath("/dashboard/mahalla-profile");
    return { success: true };
  } catch (e: any) {
    console.error("Failed to update mahalla:", e);
    return { success: false, error: e.message || "Failed to update mahalla" };
  }
}
