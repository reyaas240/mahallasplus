"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { saveFile } from "@/lib/storage";
import { checkLicenseLimit } from "@/lib/license";

export async function createSubMahalla(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "MAIN_ADMIN" || !session?.user?.mainMahallaId) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  const area = formData.get("area") as string;
  
  const logoFile = formData.get("logo") as File;
  const coverFile = formData.get("coverImage") as File;

  try {
    const limitCheck = await checkLicenseLimit(session.user.mainMahallaId, "MAX_SUB_MAHALLAS");
    if (!limitCheck.allowed) {
      return { success: false, error: limitCheck.error };
    }

    const logo = await saveFile(logoFile, "sub-mahallas");
    const coverImage = await saveFile(coverFile, "sub-mahallas");

    await prisma.subMahalla.create({
      data: {
        name,
        email,
        address,
        area,
        logo,
        coverImage,
        mainMahallaId: session.user.mainMahallaId,
      }
    });
    revalidatePath("/dashboard/sub-mahallas");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to create Sub Mahalla" };
  }
}

export async function updateSubMahalla(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "MAIN_ADMIN" || !session?.user?.mainMahallaId) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;
  const area = formData.get("area") as string;
  const status = formData.get("status") as any;
  
  const logoFile = formData.get("logo") as File;
  const coverFile = formData.get("coverImage") as File;

  try {
    const current = await prisma.subMahalla.findUnique({ where: { id } });
    if (!current || current.mainMahallaId !== session.user.mainMahallaId) {
      return { success: false, error: "Access denied" };
    }

    const logo = logoFile.size > 0 ? await saveFile(logoFile, "sub-mahallas") : current.logo;
    const coverImage = coverFile.size > 0 ? await saveFile(coverFile, "sub-mahallas") : current.coverImage;

    await prisma.subMahalla.update({
      where: { id },
      data: {
        name,
        email,
        address,
        area,
        status,
        logo,
        coverImage
      }
    });
    revalidatePath("/dashboard/sub-mahallas");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to update Sub Mahalla" };
  }
}

export async function createSubAdmin(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "MAIN_ADMIN" || !session?.user?.mainMahallaId) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const subMahallaId = formData.get("subMahallaId") as string;

  if (!subMahallaId) return { success: false, error: "Sub Mahalla selection is required" };

  try {
    // Verify that the selected SubMahalla actually belongs to this MainAdmin's MainMahalla
    const sm = await prisma.subMahalla.findUnique({ where: { id: subMahallaId }});
    if (!sm || sm.mainMahallaId !== session.user.mainMahallaId) {
      return { success: false, error: "Invalid Sub Mahalla" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "SUB_ADMIN",
        mainMahallaId: session.user.mainMahallaId,
        subMahallaId: subMahallaId,
      }
    });
    revalidatePath("/dashboard/sub-admins");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to create Sub Admin. Email might already exist." };
  }
}

export async function createMainStaff(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "MAIN_ADMIN" || !session?.user?.mainMahallaId) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "MAIN_STAFF",
        mainMahallaId: session.user.mainMahallaId,
      }
    });
    revalidatePath("/dashboard/sub-admins");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to create Mahalla Staff. Email might already exist." };
  }
}

export async function updateUser(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "MAIN_ADMIN" || !session?.user?.mainMahallaId) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as any;
  const subMahallaId = formData.get("subMahallaId") as string;

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.mainMahallaId !== session.user.mainMahallaId) {
      return { success: false, error: "User not found or access denied" };
    }

    const data: any = {
      name,
      email,
      role,
      subMahallaId: role === 'SUB_ADMIN' ? subMahallaId : null
    };

    if (password && password.length > 0) {
      data.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data
    });

    revalidatePath("/dashboard/sub-admins");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to update user" };
  }
}

export async function deleteUser(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "MAIN_ADMIN" || !session?.user?.mainMahallaId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.mainMahallaId !== session.user.mainMahallaId) {
      return { success: false, error: "User not found or access denied" };
    }

    await prisma.user.delete({ where: { id } });

    revalidatePath("/dashboard/sub-admins");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to delete user" };
  }
}
