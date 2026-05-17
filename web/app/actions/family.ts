"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";


import { saveFile } from "@/lib/storage";
import { checkLicenseLimit } from "@/lib/license";

export async function createFamilyCard(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  const subMahallaId = formData.get("subMahallaId") as string;
  const livingType = formData.get("livingType") as any;
  const mainMahallaCardNo = formData.get("mainMahallaCardNo") as string;
  const subMahallaCardNo = formData.get("subMahallaCardNo") as string;
  const address = formData.get("address") as string;
  const livingFromDate = formData.get("livingFromDate") ? new Date(formData.get("livingFromDate") as string) : null;

  const files = formData.getAll("attachments") as File[];
  const attachmentPaths: string[] = [];

  try {
    const limitCheck = await checkLicenseLimit(session.user.mainMahallaId as string, "MAX_FAMILY_CARDS");
    if (!limitCheck.allowed) {
      return { success: false, error: limitCheck.error };
    }

    // Duplicate Checks
    if (mainMahallaCardNo) {
      const existingMain = await prisma.familyCard.findFirst({
        where: { mainMahallaCardNo, subMahalla: { mainMahallaId: session.user.mainMahallaId as string } }
      });
      if (existingMain) return { success: false, error: `Main Card No ${mainMahallaCardNo} is already registered in this Mahalla.` };
    }

    if (subMahallaCardNo) {
      const existingSub = await prisma.familyCard.findFirst({
        where: { subMahallaCardNo, subMahallaId }
      });
      if (existingSub) return { success: false, error: `Sub Card No ${subMahallaCardNo} is already registered in this Sub Mahalla.` };
    }

    for (const file of files) {
      const path = await saveFile(file, "families");
      if (path) attachmentPaths.push(path);
    }

    const card = await prisma.familyCard.create({
      data: {
        subMahallaId,
        livingType,
        mainMahallaCardNo,
        subMahallaCardNo,
        address,
        livingFromDate,
        attachments: attachmentPaths,
        status: "ACTIVE",
      },
    });
    revalidatePath("/dashboard/families");
    return { success: true, id: card.id };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message || "Failed to create Family Card" };
  }
}

export async function addFamilyMember(cardId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string || null;
  const title = formData.get("title") as string;
  const dobVal = formData.get("dob") as string;
  const dob = dobVal ? new Date(dobVal) : null;
  const gender = formData.get("gender") as string || null;
  const nic = (formData.get("nic") as string) || null;
  const relationship = formData.get("relationship") as string;
  const maritalStatus = formData.get("maritalStatus") as string;
  const isBreadwinner = formData.get("isBreadwinner") === "on";
  const isStudent = formData.get("isStudent") === "on";
  const occupation = formData.get("occupation") as string;
  const phone = formData.get("phone") as string || null;
  const grade = isStudent ? formData.get("grade") as string : null;
  const school = isStudent ? formData.get("school") as string : null;
  const monthlyEarnings = parseFloat(formData.get("monthlyEarnings") as string) || 0;

  try {
    const limitCheck = await checkLicenseLimit(session.user.mainMahallaId as string, "MAX_MEMBERS");
    if (!limitCheck.allowed) {
      return { success: false, error: limitCheck.error };
    }

    // Check NIC uniqueness
    if (nic) {
      const existing = await prisma.familyMember.findUnique({ where: { nic } });
      if (existing) return { success: false, error: "NIC already exists in the system." };
    }
    
    // Check Email uniqueness if provided
    if (email) {
      const existingEmail = await prisma.familyMember.findUnique({ where: { email } });
      if (existingEmail) return { success: false, error: "Email already registered." };
    }

    if (title) {
      const trimmedTitle = title.trim();
      if (trimmedTitle) {
        await prisma.masterTitle.upsert({
          where: { name: trimmedTitle },
          update: {},
          create: { name: trimmedTitle },
        });
      }
    }

    await prisma.familyMember.create({
      data: {
        familyCardId: cardId,
        fullName,
        email,
        title,
        dob,
        gender,
        nic,
        relationship,
        maritalStatus,
        isBreadwinner,
        isStudent,
        occupation,
        phone,
        grade,
        school,
        monthlyEarnings,
      },
    });
    revalidatePath(`/dashboard/families/${cardId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to add Family Member" };
  }
}

export async function updateFamilyCard(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  const livingType = formData.get("livingType") as any;
  const mainMahallaCardNo = formData.get("mainMahallaCardNo") as string;
  const subMahallaCardNo = formData.get("subMahallaCardNo") as string;
  const address = formData.get("address") as string;
  const livingFromDate = formData.get("livingFromDate") ? new Date(formData.get("livingFromDate") as string) : null;

  const files = formData.getAll("attachments") as File[];
  const newAttachmentPaths: string[] = [];

  try {
    const currentCard = await prisma.familyCard.findUnique({ 
      where: { id }, 
      select: { attachments: true, subMahallaId: true } 
    });

    // Duplicate Checks
    if (mainMahallaCardNo) {
      const existingMain = await prisma.familyCard.findFirst({
        where: { 
          mainMahallaCardNo, 
          subMahalla: { mainMahallaId: session.user.mainMahallaId as string },
          id: { not: id }
        }
      });
      if (existingMain) return { success: false, error: `Main Card No ${mainMahallaCardNo} is already registered in this Mahalla.` };
    }

    if (subMahallaCardNo) {
      const existingSub = await prisma.familyCard.findFirst({
        where: { 
          subMahallaCardNo, 
          subMahallaId: currentCard?.subMahallaId,
          id: { not: id }
        }
      });
      if (existingSub) return { success: false, error: `Sub Card No ${subMahallaCardNo} is already registered in this Sub Mahalla.` };
    }

    for (const file of files) {
      const path = await saveFile(file, "families");
      if (path) newAttachmentPaths.push(path);
    }

    const combinedAttachments = [...(currentCard?.attachments || []), ...newAttachmentPaths];

    await prisma.familyCard.update({
      where: { id },
      data: {
        livingType,
        mainMahallaCardNo,
        subMahallaCardNo,
        address,
        livingFromDate,
        attachments: combinedAttachments,
      },
    });
    revalidatePath("/dashboard/families");
    revalidatePath(`/dashboard/families/${id}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to update Family Card" };
  }
}

export async function deleteFamilyCard(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.familyCard.delete({
      where: { id },
    });
    revalidatePath("/dashboard/families");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete Family Card" };
  }
}

export async function updateFamilyMember(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string || null;
  const dobVal = formData.get("dob") as string;
  const dob = dobVal ? new Date(dobVal) : null;
  const gender = formData.get("gender") as string || null;
  const nic = formData.get("nic") as string || null;
  const relationship = formData.get("relationship") as string;
  const maritalStatus = formData.get("maritalStatus") as string;
  const isBreadwinner = formData.get("isBreadwinner") === "on";
  const isStudent = formData.get("isStudent") === "on";
  const occupation = formData.get("occupation") as string || null;
  const phone = formData.get("phone") as string || null;
  const grade = isStudent ? formData.get("grade") as string : null;
  const school = isStudent ? formData.get("school") as string : null;
  const monthlyEarnings = parseFloat(formData.get("monthlyEarnings") as string) || 0;

  console.log("Updating Member:", { id, title, fullName, email, dob, gender, nic, monthlyEarnings, isStudent, grade, school });

  try {
    // Check NIC uniqueness if changed
    if (nic) {
      const existing = await prisma.familyMember.findFirst({
        where: { nic, id: { not: id } }
      });
      if (existing) return { success: false, error: "NIC already exists for another member." };
    }

    // Check Email uniqueness if changed
    if (email) {
      const existingEmail = await prisma.familyMember.findFirst({
        where: { email, id: { not: id } }
      });
      if (existingEmail) return { success: false, error: "Email already registered to another member." };
    }

    if (title) {
      const trimmedTitle = title.trim();
      if (trimmedTitle) {
        await prisma.masterTitle.upsert({
          where: { name: trimmedTitle },
          update: {},
          create: { name: trimmedTitle },
        });
      }
    }

    const member = await prisma.familyMember.update({
      where: { id },
      data: {
        title,
        fullName,
        email,
        dob,
        gender,
        nic,
        relationship,
        maritalStatus,
        isBreadwinner,
        isStudent,
        occupation,
        phone,
        grade,
        school,
        monthlyEarnings,
      },
    });
    revalidatePath(`/dashboard/families/${member.familyCardId}`);
    return { success: true };
  } catch (e: any) {
    console.error("Update Member Error:", e);
    return { success: false, error: e.message || "Failed to update member" };
  }
}

export async function deleteFamilyMember(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const member = await prisma.familyMember.delete({
      where: { id },
    });
    revalidatePath(`/dashboard/families/${member.familyCardId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete member" };
  }
}
