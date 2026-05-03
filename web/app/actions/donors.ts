"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function searchInternalMembers(query: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return [];

  const mainMahallaId = session.user.mainMahallaId;

  const members = await prisma.familyMember.findMany({
    where: {
      familyCard: {
        subMahalla: {
          mainMahallaId
        }
      },
      OR: [
        { fullName: { contains: query, mode: "insensitive" } },
        { nic: { contains: query, mode: "insensitive" } },
        { familyCard: { subMahallaCardNo: { contains: query, mode: "insensitive" } } },
        { familyCard: { mainMahallaCardNo: { contains: query, mode: "insensitive" } } }
      ]
    },
    include: {
      familyCard: {
        include: {
          subMahalla: true
        }
      }
    },
    take: 10
  });

  return members.map(m => ({
    id: m.id,
    name: m.fullName,
    nic: m.nic,
    cardNo: m.familyCard.mainMahallaCardNo || m.familyCard.subMahallaCardNo,
    subMahalla: m.familyCard.subMahalla.name
  }));
}

export async function updateDonor(donorId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return { success: false, error: "Unauthorized" };

  const { contacts, ...donorData } = data;

  try {
    // Transaction to update donor and contacts
    await prisma.$transaction([
      prisma.donorContact.deleteMany({ where: { donorId } }),
      prisma.donor.update({
        where: { id: donorId },
        data: {
          ...donorData,
          contacts: contacts ? {
            create: contacts
          } : undefined
        }
      })
    ]);
    
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to update donor" };
  }
}

export async function createDonor(data: any) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return { success: false, error: "Unauthorized" };

  const { contacts, ...donorData } = data;

  try {
    const donor = await prisma.donor.create({
      data: {
        ...donorData,
        mainMahallaId: session.user.mainMahallaId,
        contacts: contacts ? {
          create: contacts
        } : undefined
      }
    });
    return { success: true, donor };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to create donor" };
  }
}

export async function recordDonation(data: any) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return { success: false, error: "Unauthorized" };

  try {
    const donation = await prisma.donation.create({
      data: {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        attachmentUrl: data.attachmentUrl,
        donorId: data.donorId,
        committeeId: data.committeeId,
        committeeTermId: data.committeeTermId,
        mainMahallaId: session.user.mainMahallaId
      }
    });
    revalidatePath(`/dashboard/committees/${data.committeeId}`);
    return { success: true, donation };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to record donation" };
  }
}

export async function getDonors() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return [];

  return prisma.donor.findMany({
    where: { mainMahallaId: session.user.mainMahallaId },
    include: { contacts: true },
    orderBy: { name: "asc" }
  });
}

export async function searchAllDonors(query: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return [];

  return prisma.donor.findMany({
    where: {
      mainMahallaId: session.user.mainMahallaId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } }
      ]
    },
    include: { contacts: true },
    take: 10
  });
}

export async function getCommitteeDonations(committeeId: string, termId?: string) {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  return prisma.donation.findMany({
    where: {
      committeeId,
      ...(termId ? { committeeTermId: termId } : {})
    },
    include: {
      donor: true
    },
    orderBy: [
      { date: "desc" },
      { createdAt: "desc" }
    ]
  });
}

export async function updateDonation(id: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return { success: false, error: "Unauthorized" };

  try {
    const donation = await prisma.donation.update({
      where: { id },
      data: {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        paymentMethod: data.paymentMethod,
        reference: data.reference,
        attachmentUrl: data.attachmentUrl
      }
    });
    revalidatePath(`/dashboard/committees/${donation.committeeId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to update donation" };
  }
}

export async function deleteDonation(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return { success: false, error: "Unauthorized" };

  try {
    const donation = await prisma.donation.delete({
      where: { id }
    });
    revalidatePath(`/dashboard/committees/${donation.committeeId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete donation" };
  }
}
