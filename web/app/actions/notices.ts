"use server";

import { prisma } from "@/lib/prisma";
import { NoticeStatus, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { smartUpload } from "@/lib/upload";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

export async function upsertNotice(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Unauthorized");

  const id = formData.get("id") as string | null;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const coverImageFile = formData.get("coverImage") as File | null;
  const attachmentFiles = formData.getAll("attachments") as File[];
  const targetAllSub = formData.get("targetAllSub") === "true";
  const targetSubMahallaIds = JSON.parse(formData.get("targetSubMahallaIds") as string || "[]");

  // Validate Authorization
  const isMainAdmin = session.user.role === Role.MAIN_ADMIN;
  const isSubAdmin = session.user.role === Role.SUB_ADMIN;

  if (!isMainAdmin && !isSubAdmin) throw new Error("Forbidden: Only admins can create notices.");

  let coverImageUrl = formData.get("existingCoverImage") as string | null;
  if (coverImageFile && coverImageFile.size > 0) {
    coverImageUrl = await smartUpload(coverImageFile, "notices/covers");
  }

  const data = {
    title,
    content,
    coverImage: coverImageUrl,
    authorId: session.user.id,
    mainMahallaId: session.user.mainMahallaId!,
    subMahallaId: isSubAdmin ? session.user.subMahallaId : null,
    targetAllSub: isMainAdmin ? targetAllSub : false,
    targetSubMahallaIds: isMainAdmin ? targetSubMahallaIds : [session.user.subMahallaId].filter(Boolean),
  };

  const notice = id 
    ? await prisma.notice.update({ where: { id }, data })
    : await prisma.notice.create({ data });

  // Handle Attachments
  for (const file of attachmentFiles) {
    if (file.size > 0) {
      const url = await smartUpload(file, "notices/attachments");
      await prisma.noticeAttachment.create({
        data: {
          noticeId: notice.id,
          url,
          name: file.name,
          type: file.type,
        },
      });
    }
  }

  revalidatePath("/dashboard/notices");
  return notice;
}

export async function publishNotice(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Unauthorized");

  const notice = await prisma.notice.findUnique({
    where: { id },
    include: { mainMahalla: true },
  });

  if (!notice) throw new Error("Notice not found");
  if (notice.authorId !== session.user.id && session.user.role !== Role.MAIN_ADMIN) {
    throw new Error("Forbidden");
  }

  const updatedNotice = await prisma.notice.update({
    where: { id },
    data: { status: NoticeStatus.PUBLISHED },
  });

  // Trigger WhatsApp Notifications
  await triggerNoticeNotifications(notice.id);

  revalidatePath("/dashboard/notices");
  return updatedNotice;
}

async function triggerNoticeNotifications(noticeId: string) {
  const notice = await prisma.notice.findUnique({
    where: { id: noticeId },
    include: { 
      mainMahalla: true,
      subMahalla: true
    },
  });

  if (!notice) return;

  // Determine Targeted Sub-Mahallas
  let targetSubIds = notice.targetSubMahallaIds;
  if (notice.targetAllSub) {
    const allSubs = await prisma.subMahalla.findMany({
      where: { mainMahallaId: notice.mainMahallaId },
      select: { id: true },
    });
    targetSubIds = allSubs.map(s => s.id);
  }

  // Fetch Members from those Sub-Mahallas
  const members = await prisma.familyMember.findMany({
    where: {
      familyCard: {
        subMahallaId: { in: targetSubIds },
      },
      phone: { not: null },
    },
    select: { phone: true, fullName: true },
  });

  // Unique phone numbers
  const uniquePhones = Array.from(new Set(members.map(m => m.phone).filter(Boolean)));

  const mahallaName = notice.subMahalla?.name || notice.mainMahalla.name;
  const noticeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notices/${notice.id}`;

  console.log(`Broadcasting notice "${notice.title}" to ${uniquePhones.length} members...`);

  // Loop and send (In production, use a queue)
  for (const phone of uniquePhones) {
    await sendWhatsAppMessage(phone!, {
      type: "text",
      text: { 
        body: `📢 *New Notice from ${mahallaName}*\n\n*${notice.title}*\n\nPlease click the link below to view the full notice and attachments:\n\n🔗 ${noticeUrl}`
      }
    });
  }
}

export async function deleteNotice(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Unauthorized");

  const notice = await prisma.notice.findUnique({ where: { id } });
  if (!notice) throw new Error("Notice not found");

  if (notice.authorId !== session.user.id && session.user.role !== Role.MAIN_ADMIN) {
    throw new Error("Forbidden");
  }

  await prisma.notice.delete({ where: { id } });
  revalidatePath("/dashboard/notices");
}

export async function getNotices() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) throw new Error("Unauthorized");

  const { role, mainMahallaId, subMahallaId } = session.user;

  if (role === Role.MAIN_ADMIN) {
    return prisma.notice.findMany({
      where: { mainMahallaId: mainMahallaId! },
      include: { author: true, attachments: true, subMahalla: true },
      orderBy: { createdAt: "desc" },
    });
  }

  if (role === Role.SUB_ADMIN) {
    return prisma.notice.findMany({
      where: {
        OR: [
          { subMahallaId: subMahallaId },
          { targetSubMahallaIds: { has: subMahallaId! } },
          { targetAllSub: true, mainMahallaId: mainMahallaId! }
        ]
      },
      include: { author: true, attachments: true, subMahalla: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // Standard members see only PUBLISHED notices
  return prisma.notice.findMany({
    where: {
      status: NoticeStatus.PUBLISHED,
      OR: [
        { subMahallaId: subMahallaId },
        { targetSubMahallaIds: { has: subMahallaId! } },
        { targetAllSub: true, mainMahallaId: mainMahallaId! }
      ]
    },
    include: { author: true, attachments: true, subMahalla: true },
    orderBy: { createdAt: "desc" },
  });
}
