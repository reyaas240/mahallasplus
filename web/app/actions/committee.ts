"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { writeFile } from "fs/promises";
import path from "path";

export async function createCommittee(formData: FormData) {
  console.log("Create Committee Action triggered");
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const shortCode = formData.get("shortCode") as string;
  const establishedDate = formData.get("establishedDate") ? new Date(formData.get("establishedDate") as string) : null;
  const registrationNo = formData.get("registrationNo") as string;
  const address = formData.get("address") as string;
  const email = formData.get("email") as string;
  const contactNo = formData.get("contactNo") as string;
  const website = formData.get("website") as string;
  const bankName = formData.get("bankName") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const accountHolderName = formData.get("accountHolderName") as string;
  const branch = formData.get("branch") as string;
  const defaultCurrency = formData.get("defaultCurrency") as string;

  const logoFile = formData.get("logo") as File;
  let logoPath = null;

  try {
    if (logoFile && logoFile.size > 0) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${logoFile.name.replace(/\s+/g, "-")}`;
      logoPath = `/uploads/committees/${filename}`;
      const absolutePath = path.join(process.cwd(), "public", logoPath);
      await writeFile(absolutePath, buffer);
    }

    const committee = await prisma.committee.create({
      data: {
        name,
        description,
        logo: logoPath,
        shortCode,
        establishedDate,
        registrationNo,
        address,
        email,
        contactNo,
        website,
        bankName,
        accountNumber,
        accountHolderName,
        branch,
        defaultCurrency,
        mainMahallaId: session.user.mainMahallaId as string,
        subMahallaId: session.user.role === "SUB_ADMIN" ? session.user.subMahallaId : (formData.get("subMahallaId") as string || null),
      },
    });
    revalidatePath("/dashboard/committees");
    return { success: true, id: committee.id };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message || "Failed to create committee" };
  }
}

export async function updateCommittee(id: string, formData: FormData) {
  console.log("Update Committee Action triggered for ID:", id);
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const shortCode = formData.get("shortCode") as string;
  const establishedDate = formData.get("establishedDate") ? new Date(formData.get("establishedDate") as string) : null;
  const registrationNo = formData.get("registrationNo") as string;
  const address = formData.get("address") as string;
  const email = formData.get("email") as string;
  const contactNo = formData.get("contactNo") as string;
  const website = formData.get("website") as string;
  const bankName = formData.get("bankName") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const accountHolderName = formData.get("accountHolderName") as string;
  const branch = formData.get("branch") as string;
  const defaultCurrency = formData.get("defaultCurrency") as string;
  const status = formData.get("status") as any;

  const logoFile = formData.get("logo") as File;
  let logoPath = formData.get("currentLogo") as string || null;

  try {
    if (logoFile && logoFile.size > 0) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${logoFile.name.replace(/\s+/g, "-")}`;
      logoPath = `/uploads/committees/${filename}`;
      const absolutePath = path.join(process.cwd(), "public", logoPath);
      await writeFile(absolutePath, buffer);
    }

    await prisma.committee.update({
      where: { id },
      data: { 
        name, 
        description, 
        status, 
        logo: logoPath,
        shortCode,
        establishedDate,
        registrationNo,
        address,
        email,
        contactNo,
        website,
        bankName,
        accountNumber,
        accountHolderName,
        branch,
        defaultCurrency
      },
    });
    revalidatePath("/dashboard/committees");
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: e.message || "Failed to update committee" };
  }
}

export async function addCommitteeMember(committeeTermId: string, familyMemberId: string, role: string) {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const member = await prisma.committeeMember.create({
      data: {
        committeeTermId,
        familyMemberId,
        role,
      },
      include: {
        committeeTerm: true
      }
    });
    revalidatePath(`/dashboard/committees/${member.committeeTerm.committeeId}`);
    return { success: true };
  } catch (e: any) {
    console.error("DEBUG: addCommitteeMember Error:", e);
    // Specifically check for unique constraint violation (P2002)
    if (e.code === 'P2002') {
      return { success: false, error: "Member already exists in this term" };
    }
    return { success: false, error: e.message || "Failed to add member to term" };
  }
}

export async function updateCommitteeMember(id: string, data: { role: string, status: string, activeDateFrom?: string, activeDateTo?: string }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const member = await prisma.committeeMember.update({
      where: { id },
      data: {
        role: data.role,
        status: data.status as any,
        activeDateFrom: data.activeDateFrom ? new Date(data.activeDateFrom) : null,
        activeDateTo: data.activeDateTo ? new Date(data.activeDateTo) : null,
      },
      include: { committeeTerm: true }
    });
    revalidatePath(`/dashboard/committees/${member.committeeTerm.committeeId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to update member" };
  }
}

export async function removeCommitteeMember(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const member = await prisma.committeeMember.delete({
      where: { id },
      include: { committeeTerm: true }
    });
    revalidatePath(`/dashboard/committees/${member.committeeTerm.committeeId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to remove member" };
  }
}

export async function toggleMemberAccess(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const member = await prisma.committeeMember.findUnique({
      where: { id },
      include: { 
        familyMember: true,
        committeeTerm: {
          include: { committee: true }
        }
      },
    });

    if (!member) return { success: false, error: "Member not found" };

    const newAccessState = !member.hasDashboardAccess;

    if (newAccessState) {
      // Provision access
      if (!member.familyMember.email) {
        return { success: false, error: "Member must have an email address to be granted dashboard access." };
      }

      const hashedPassword = await bcrypt.hash("Mahalla123", 10); // Default password

      await prisma.user.upsert({
        where: { email: member.familyMember.email },
        update: {
          role: "COMMITTEE_ADMIN",
          committeeId: member.committeeTerm.committeeId,
          mainMahallaId: member.committeeTerm.committee.mainMahallaId,
        },
        create: {
          email: member.familyMember.email,
          name: member.familyMember.fullName,
          password: hashedPassword,
          role: "COMMITTEE_ADMIN",
        committeeId: member.committeeTerm.committeeId,
          mainMahallaId: member.committeeTerm.committee.mainMahallaId,
        }
      });
    } else {
      // Revoke access - optionally downgrade role or just set committeeId to null
      // For now, let's keep the user but set their role back to MEMBER or deactivate
      await prisma.user.updateMany({
        where: { email: member.familyMember.email || "" },
        data: { role: "MEMBER", committeeId: null }
      });
    }

    await prisma.committeeMember.update({
      where: { id },
      data: { hasDashboardAccess: newAccessState },
    });

    revalidatePath(`/dashboard/committees/${member.committeeTerm.committeeId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to toggle access" };
  }
}

export async function toggleCommitteeStatus(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const committee = await prisma.committee.findUnique({ where: { id } });
    if (!committee) return { success: false, error: "Committee not found" };

    const newStatus = committee.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    await prisma.committee.update({
      where: { id },
      data: { status: newStatus },
    });

    revalidatePath("/dashboard/committees");
    revalidatePath(`/dashboard/committees/${id}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to toggle status" };
  }
}

export async function deleteCommittee(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.committee.delete({ where: { id } });
    revalidatePath(`/dashboard/committees/${id}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete committee" };
  }
}

export async function createCommitteeTerm(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const startDate = formData.get("startDate") ? new Date(formData.get("startDate") as string) : null;
  const endDate = formData.get("endDate") ? new Date(formData.get("endDate") as string) : null;
  const committeeId = formData.get("committeeId") as string;

  try {
    const term = await prisma.committeeTerm.create({
      data: {
        name,
        startDate,
        endDate,
        committeeId,
      },
    });
    revalidatePath(`/dashboard/committees/${committeeId}`);
    return { success: true, id: term.id };
  } catch (e) {
    return { success: false, error: "Failed to create term" };
  }
}

export async function updateCommitteeTerm(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const startDate = formData.get("startDate") ? new Date(formData.get("startDate") as string) : null;
  const endDate = formData.get("endDate") ? new Date(formData.get("endDate") as string) : null;

  try {
    const term = await prisma.committeeTerm.update({
      where: { id },
      data: { name, startDate, endDate },
    });
    revalidatePath(`/dashboard/committees/${term.committeeId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to update term" };
  }
}

export async function toggleTermActive(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const term = await prisma.committeeTerm.findUnique({ where: { id } });
    if (!term) return { success: false, error: "Term not found" };

    // If activating, deactivate all others for this committee
    await prisma.committeeTerm.updateMany({
      where: { committeeId: term.committeeId },
      data: { status: "INACTIVE" }
    });

    await prisma.committeeTerm.update({
      where: { id },
      data: { status: "ACTIVE" }
    });

    revalidatePath(`/dashboard/committees/${term.committeeId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to activate term" };
  }
}

export async function deleteCommitteeTerm(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const term = await prisma.committeeTerm.delete({ where: { id } });
    revalidatePath(`/dashboard/committees/${term.committeeId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete term" };
  }
}

export async function getFinancialSettings() {
  const session = await getServerSession(authOptions);
  if (!session) return { currency: "LKR", decimals: 2 };

  const mahallaId = session.user.mainMahallaId;
  const mahalla = await prisma.mainMahalla.findUnique({
    where: { id: mahallaId ?? undefined },
    select: { country: true, defaultCurrency: true }
  });

  if (!mahalla) return { currency: "LKR", decimals: 2 };

  const countryMaster = await prisma.masterCountry.findUnique({
    where: { name: mahalla.country || "" }
  });

  return {
    currency: mahalla.defaultCurrency || countryMaster?.currency || "LKR",
    decimals: countryMaster?.currencyDecimalPlaces ?? 2
  };
}

export async function getMainMahallaCurrency() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return "LKR";

  const mahalla = await prisma.mainMahalla.findUnique({
    where: { id: session.user.mainMahallaId },
    select: { defaultCurrency: true }
  });
  return mahalla?.defaultCurrency || "LKR";
}

export async function getOpeningBalanceCategories() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return [];

  return await prisma.openingBalanceCategory.findMany({
    where: { mainMahallaId: session.user.mainMahallaId },
    orderBy: { name: "asc" }
  });
}

export async function createOpeningBalanceCategory(name: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return { success: false, error: "Unauthorized" };

  try {
    const category = await prisma.openingBalanceCategory.create({
      data: {
        name,
        mainMahallaId: session.user.mainMahallaId
      }
    });
    return { success: true, category };
  } catch (e) {
    return { success: false, error: "Category already exists" };
  }
}

export async function saveOpeningBalances(committeeTermId: string, balances: { categoryId: string, amount: number }[]) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN") return { success: false, error: "Unauthorized" };

  try {
    const term = await prisma.committeeTerm.findUnique({
      where: { id: committeeTermId },
      select: { financialsStatus: true, committeeId: true }
    });

    if (term?.financialsStatus === "APPROVED") {
      return { success: false, error: "Balances are locked and cannot be modified." };
    }

    // Using transaction to ensure all balances are saved correctly
    await prisma.$transaction(
      balances.map(b => prisma.committeeTermBalance.upsert({
        where: {
          committeeTermId_categoryId: {
            committeeTermId,
            categoryId: b.categoryId
          }
        },
        update: { amount: b.amount },
        create: {
          committeeTermId,
          categoryId: b.categoryId,
          amount: b.amount
        }
      }))
    );
    
    if (term) revalidatePath(`/dashboard/committees/${term.committeeId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to save balances" };
  }
}

export async function getCommitteeStats(committeeId: string, termId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { totalCollections: 0, donorCount: 0, goalProgress: 0 };

  const [donations, balances, committee, disbursement] = await Promise.all([
    prisma.donation.aggregate({
      where: { committeeId, committeeTermId: termId },
      _sum: { amount: true },
      _count: { donorId: true }
    }),
    prisma.committeeTermBalance.aggregate({
      where: { committeeTermId: termId },
      _sum: { amount: true }
    }),
    prisma.committee.findUnique({
      where: { id: committeeId },
      select: { description: true }
    }),
    prisma.fundRequest.aggregate({
      where: { committeeTermId: termId, status: "DISBURSED" },
      _sum: { grantedAmount: true }
    })
  ]);

  const totalOpening = balances._sum.amount || 0;
  const totalDonations = donations._sum.amount || 0;
  const totalAmount = totalOpening + totalDonations;
  const totalDisbursed = disbursement._sum.grantedAmount || 0;

  // Extract numeric goal from description if possible (simple heuristic)
  const goalMatch = committee?.description?.match(/(\d+[\d,]*)/);
  const goalAmount = goalMatch ? parseFloat(goalMatch[0].replace(/,/g, '')) : 1000000;

  return {
    openingBalance: totalOpening,
    totalCollections: totalDonations,
    totalAmount: totalAmount,
    totalDisbursed: totalDisbursed,
    netBalance: totalAmount - totalDisbursed,
    donorCount: donations._count.donorId,
    goalAmount: goalAmount,
    goalProgress: Math.min(Math.round((totalDonations / goalAmount) * 100), 100)
  };
}

export async function approveOpeningBalances(committeeTermId: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN") return { success: false, error: "Unauthorized" };

  try {
    const term = await prisma.committeeTerm.update({
      where: { id: committeeTermId },
      data: {
        financialsStatus: "APPROVED",
        financialsApprovedAt: new Date()
      },
      select: { committeeId: true }
    });

    revalidatePath(`/dashboard/committees/${term.committeeId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to approve balances" };
  }
}
