"use server";

import { prisma } from "@/lib/prisma";
import { NoticeStatus, Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { smartUpload } from "@/lib/upload";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { stripHtml } from "@/lib/utils";
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
  const deletedAttachmentIds = JSON.parse(formData.get("deletedAttachmentIds") as string || "[]");

  // Validate Authorization
  const isMainAdmin = session.user.role === Role.MAIN_ADMIN;
  const isSubAdmin = session.user.role === Role.SUB_ADMIN;

  if (!isMainAdmin && !isSubAdmin) throw new Error("Forbidden: Only admins can create notices.");

  if (id) {
    const existing = await prisma.notice.findUnique({ where: { id } });
    if (existing?.status === NoticeStatus.PUBLISHED) {
      throw new Error("Cannot edit a notice that has already been published.");
    }
  }

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

  // Handle Attachment Deletions
  if (deletedAttachmentIds.length > 0) {
    await prisma.noticeAttachment.deleteMany({
      where: { id: { in: deletedAttachmentIds } }
    });
  }

  // Handle New Attachments
  for (const file of attachmentFiles) {
    if (file && file.size > 0) {
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
  if (notice.status === NoticeStatus.PUBLISHED) {
    console.log(`Notice ${id} is already published, skipping notifications.`);
    revalidatePath("/dashboard/notices");
    return notice;
  }
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
      subMahalla: true,
      attachments: true
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

  if (targetSubIds.length === 0) {
    console.log("No target sub-mahallas found, skipping notifications.");
    return;
  }

  // Fetch Members from those Sub-Mahallas
  const members = await prisma.familyMember.findMany({
    where: {
      familyCard: {
        subMahallaId: { in: targetSubIds },
      },
      phone: { not: null, notIn: ['', ' '] },
    },
    select: { phone: true, fullName: true },
    distinct: ['phone'],
  });

  // Normalize and deduplicate phone numbers
  const normalizePhone = (phone: string) => phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
  const uniquePhones = Array.from(
    new Set(
      members
        .map(m => m.phone)
        .filter(Boolean)
        .map(p => normalizePhone(p!))
    )
  );

  console.log(`All member phones (raw): ${JSON.stringify(members.map(m => m.phone))}`);
  console.log(`Unique phones after normalization: ${JSON.stringify(uniquePhones)}`);

  const mahallaName = notice.subMahalla?.name || notice.mainMahalla.name;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
  const formattedDate = new Date(notice.createdAt).toLocaleString('en-US', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  });

  // Strip HTML tags and entities from rich text content
  const plainContent = stripHtml(notice.content);
  
  let attachmentNote = "";
  if (notice.attachments.length > 0) {
    const imgCount = notice.attachments.filter(a => a.type.startsWith('image/')).length;
    const pdfCount = notice.attachments.filter(a => a.type === 'application/pdf').length;
    const parts = [];
    if (imgCount > 0) parts.push(`${imgCount} photo${imgCount > 1 ? 's' : ''}`);
    if (pdfCount > 0) parts.push(`${pdfCount} document${pdfCount > 1 ? 's' : ''}`);
    attachmentNote = `\n\n📎 *Attached:* ${parts.join(' & ')}`;
  }
  
  const messageBody = `📢 *New Notice from ${mahallaName}*\n\n*${notice.title}*\n\n🗓️ ${formattedDate}\n\n${plainContent}${attachmentNote}`;

  console.log(`Broadcasting notice "${notice.title}" to ${uniquePhones.length} unique phones...`);
  console.log(`Target sub IDs: ${JSON.stringify(targetSubIds)}`);
  console.log(`Members found: ${members.length}, Unique phones: ${uniquePhones.length}`);

  // Helper to create a publicly accessible URL for WhatsApp to fetch
  const getPublicUrl = (url: string) => {
    if (url.includes('blob.vercel-storage.com')) {
      return `${baseUrl}/api/files/proxy?url=${encodeURIComponent(url)}`;
    }
    if (url.startsWith('/')) {
      return `${baseUrl}${url}`;
    }
    return url;
  };

  const pdfAttachments = notice.attachments.filter(a => a.type === 'application/pdf');

  for (const phone of uniquePhones) {
    try {
      // Send ONE message: cover image with caption, or plain text
      if (notice.coverImage) {
        await sendWhatsAppMessage(phone!, {
          type: "image",
          image: {
            link: getPublicUrl(notice.coverImage),
            caption: messageBody,
          }
        });
      } else {
        await sendWhatsAppMessage(phone!, {
          type: "text",
          text: { body: messageBody }
        });
      }

      // Send PDF attachments as documents
      for (const pdf of pdfAttachments) {
        await sendWhatsAppMessage(phone!, {
          type: "document",
          document: {
            link: getPublicUrl(pdf.url),
            filename: pdf.name,
          }
        });
      }
    } catch (err) {
      console.error(`Failed to send WhatsApp to ${phone}:`, err);
    }
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
