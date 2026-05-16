"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function searchInternalMembers(query: string, committeeId?: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return [];

  const mainMahallaId = session.user.mainMahallaId;
  let subMahallaId = session.user.subMahallaId;

  if (committeeId) {
    const committee = await prisma.committee.findUnique({
      where: { id: committeeId },
      select: { subMahallaId: true }
    });
    if (committee) subMahallaId = committee.subMahallaId;
  }

  const members = await prisma.familyMember.findMany({
    where: {
      familyCard: {
        subMahalla: {
          mainMahallaId,
          ...(subMahallaId ? { id: subMahallaId } : { id: { not: undefined } }) 
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

  return members.map((m: any) => ({
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

export async function createDonor(data: any, committeeId?: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return { success: false, error: "Unauthorized" };

  let subMahallaId = session.user.subMahallaId;

  if (committeeId) {
    const committee = await prisma.committee.findUnique({
      where: { id: committeeId },
      select: { subMahallaId: true }
    });
    if (committee) subMahallaId = committee.subMahallaId;
  }

  const { contacts, ...donorData } = data;

  try {
    const donor = await prisma.donor.create({
      data: {
        ...donorData,
        mainMahallaId: session.user.mainMahallaId,
        subMahallaId: subMahallaId || null,
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
        projectId: data.projectId,
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

export async function getDonors(committeeId?: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return [];

  let subMahallaId = session.user.subMahallaId;

  if (committeeId) {
    const committee = await prisma.committee.findUnique({
      where: { id: committeeId },
      select: { subMahallaId: true }
    });
    if (committee) subMahallaId = committee.subMahallaId;
  }

  return prisma.donor.findMany({
    where: { 
      mainMahallaId: session.user.mainMahallaId,
      subMahallaId: subMahallaId || null
    },
    include: { contacts: true },
    orderBy: { name: "asc" }
  });
}

export async function searchAllDonors(query: string, committeeId?: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return [];

  let subMahallaId = session.user.subMahallaId;

  if (committeeId) {
    const committee = await prisma.committee.findUnique({
      where: { id: committeeId },
      select: { subMahallaId: true }
    });
    if (committee) subMahallaId = committee.subMahallaId;
  }

  return prisma.donor.findMany({
    where: {
      mainMahallaId: session.user.mainMahallaId,
      subMahallaId: subMahallaId || null,
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
      donor: true,
      project: true
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
        projectId: data.projectId,
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
