"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ─────────────── Fund Requests ───────────────

export async function createFundRequest(data: any) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return { success: false, error: "Unauthorized" };

  try {
    const request = await prisma.$transaction(async (tx) => {
      const req = await tx.fundRequest.create({
        data: {
          committeeId: data.committeeId,
          committeeTermId: data.committeeTermId,
          projectName: data.projectName || null,
          beneficiaryType: data.beneficiaryType,
          familyMemberId: data.familyMemberId || null,
          externalName: data.externalName || null,
          externalPhone: data.externalPhone || null,
          externalAddress: data.externalAddress || null,
          purpose: data.purpose,
          description: data.description || null,
          requestedAmount: data.requestedAmount ? parseFloat(data.requestedAmount) : null,
          letterRefNo: data.letterRefNo || null,
          attachments: data.attachments || [],
          status: data.beneficiaryType === "INTERNAL" ? "UNDER_VERIFICATION" : "UNDER_DISCUSSION",
        },
      });

      await tx.fundRequestEvent.create({
        data: {
          fundRequestId: req.id,
          action: "Request received",
          performedBy: session.user.name || session.user.email || "System",
          note: `New ${data.beneficiaryType.toLowerCase()} request for: ${data.purpose}`,
        },
      });

      return req;
    });

    revalidatePath(`/dashboard/committees/${data.committeeId}`);
    return { success: true, id: request.id };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to create fund request" };
  }
}

export async function getFundRequests(committeeId: string, termId?: string) {
  const session = await getServerSession(authOptions);
  if (!session) return [];

  return prisma.fundRequest.findMany({
    where: {
      committeeId,
      ...(termId ? { committeeTermId: termId } : {}),
    },
    include: {
      familyMember: {
        include: {
          familyCard: {
            include: {
              subMahalla: true,
            },
          },
        },
      },
      investigations: true,
      appointments: true,
      quotations: true,
      events: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFundRequestDetail(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  return prisma.fundRequest.findUnique({
    where: { id },
    include: {
      familyMember: {
        include: {
          familyCard: {
            include: {
              subMahalla: true,
              members: true,
            },
          },
        },
      },
      investigations: { orderBy: { createdAt: "desc" } },
      appointments: { orderBy: { scheduledDate: "desc" } },
      quotations: { orderBy: { createdAt: "desc" } },
      events: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function updateFundRequest(id: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.fundRequest.update({
      where: { id },
      data: {
        purpose: data.purpose,
        description: data.description,
        requestedAmount: data.requestedAmount ? parseFloat(data.requestedAmount) : null,
        projectName: data.projectName || null,
      },
    });

    const req = await prisma.fundRequest.findUnique({ where: { id } });
    revalidatePath(`/dashboard/committees/${req?.committeeId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to update fund request" };
  }
}

export async function deleteFundRequest(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const req = await prisma.fundRequest.delete({ where: { id } });
    revalidatePath(`/dashboard/committees/${req.committeeId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete fund request" };
  }
}

// ─────────────── Verification ───────────────

export async function verifyBeneficiary(requestId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.fundRequest.update({
        where: { id: requestId },
        data: {
          verified: true,
          verifiedAt: new Date(),
          verifiedBy: session.user.name || session.user.email || "System",
          status: "UNDER_DISCUSSION",
        },
      });

      await tx.fundRequestEvent.create({
        data: {
          fundRequestId: requestId,
          action: "Beneficiary verified",
          performedBy: session.user.name || session.user.email || "System",
          note: "Family card verification completed successfully",
        },
      });
    });

    const req = await prisma.fundRequest.findUnique({ where: { id: requestId } });
    revalidatePath(`/dashboard/committees/${req?.committeeId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to verify beneficiary" };
  }
}

// ─────────────── Investigations ───────────────

export async function addInvestigation(data: any) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.investigation.create({
        data: {
          fundRequestId: data.fundRequestId,
          investigators: data.investigators,
          visitDate: new Date(data.visitDate),
          findings: data.findings,
          attachmentUrl: data.attachmentUrl || null,
        },
      });

      await tx.fundRequest.update({
        where: { id: data.fundRequestId },
        data: { status: "UNDER_INVESTIGATION" },
      });

      await tx.fundRequestEvent.create({
        data: {
          fundRequestId: data.fundRequestId,
          action: "Investigation added",
          performedBy: session.user.name || session.user.email || "System",
          note: `Field visit by: ${data.investigators}`,
        },
      });
    });

    const req = await prisma.fundRequest.findUnique({ where: { id: data.fundRequestId } });
    revalidatePath(`/dashboard/committees/${req?.committeeId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to add investigation" };
  }
}

// ─────────────── Appointments ───────────────

export async function scheduleAppointment(data: any) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.fundAppointment.create({
        data: {
          fundRequestId: data.fundRequestId,
          scheduledDate: new Date(data.scheduledDate),
          location: data.location || null,
          purpose: data.purpose || null,
        },
      });

      await tx.fundRequest.update({
        where: { id: data.fundRequestId },
        data: { status: "INQUIRY_SCHEDULED" },
      });

      await tx.fundRequestEvent.create({
        data: {
          fundRequestId: data.fundRequestId,
          action: "Appointment scheduled",
          performedBy: session.user.name || session.user.email || "System",
          note: `Inquiry at: ${data.location || "Office"} on ${data.scheduledDate}`,
        },
      });
    });

    const req = await prisma.fundRequest.findUnique({ where: { id: data.fundRequestId } });
    revalidatePath(`/dashboard/committees/${req?.committeeId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to schedule appointment" };
  }
}

export async function updateAppointmentOutcome(appointmentId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const appt = await prisma.fundAppointment.update({
      where: { id: appointmentId },
      data: {
        outcome: data.outcome,
        attended: data.attended ?? true,
      },
    });

    await prisma.fundRequestEvent.create({
      data: {
        fundRequestId: appt.fundRequestId,
        action: data.attended ? "Appointment completed" : "Appointment missed",
        performedBy: session.user.name || session.user.email || "System",
        note: data.outcome,
      },
    });

    // Move back to discussion after appointment is done
    await prisma.fundRequest.update({
      where: { id: appt.fundRequestId },
      data: { status: "UNDER_DISCUSSION" },
    });

    const req = await prisma.fundRequest.findUnique({ where: { id: appt.fundRequestId } });
    revalidatePath(`/dashboard/committees/${req?.committeeId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to update appointment" };
  }
}

// ─────────────── Quotations ───────────────

export async function addQuotation(data: any) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.fundQuotation.create({
        data: {
          fundRequestId: data.fundRequestId,
          vendor: data.vendor,
          amount: parseFloat(data.amount),
          description: data.description || null,
          fileUrl: data.fileUrl,
        },
      });

      await tx.fundRequestEvent.create({
        data: {
          fundRequestId: data.fundRequestId,
          action: "Quotation attached",
          performedBy: session.user.name || session.user.email || "System",
          note: `Vendor: ${data.vendor} — Amount: ${data.amount}`,
        },
      });
    });

    const req = await prisma.fundRequest.findUnique({ where: { id: data.fundRequestId } });
    revalidatePath(`/dashboard/committees/${req?.committeeId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to add quotation" };
  }
}

// ─────────────── Approval / Rejection ───────────────

export async function approveFundRequest(requestId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.fundRequest.update({
        where: { id: requestId },
        data: {
          grantedAmount: parseFloat(data.grantedAmount),
          decisionNotes: data.decisionNotes || null,
          status: "APPROVED",
        },
      });

      await tx.fundRequestEvent.create({
        data: {
          fundRequestId: requestId,
          action: "Request approved",
          performedBy: session.user.name || session.user.email || "System",
          note: `Granted: ${data.grantedAmount}. ${data.decisionNotes || ""}`,
        },
      });
    });

    const req = await prisma.fundRequest.findUnique({ where: { id: requestId } });
    revalidatePath(`/dashboard/committees/${req?.committeeId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to approve request" };
  }
}

export async function rejectFundRequest(requestId: string, reason: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.fundRequest.update({
        where: { id: requestId },
        data: {
          decisionNotes: reason,
          status: "REJECTED",
        },
      });

      await tx.fundRequestEvent.create({
        data: {
          fundRequestId: requestId,
          action: "Request rejected",
          performedBy: session.user.name || session.user.email || "System",
          note: reason,
        },
      });
    });

    const req = await prisma.fundRequest.findUnique({ where: { id: requestId } });
    revalidatePath(`/dashboard/committees/${req?.committeeId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to reject request" };
  }
}

// ─────────────── Disbursement ───────────────

export async function disburseFunds(requestId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.fundRequest.update({
        where: { id: requestId },
        data: {
          disbursementMethod: data.disbursementMethod,
          chequeNumber: data.chequeNumber || null,
          bankReference: data.bankReference || null,
          receiptUrl: data.receiptUrl || null,
          disbursedAt: new Date(),
          status: "DISBURSED",
        },
      });

      await tx.fundRequestEvent.create({
        data: {
          fundRequestId: requestId,
          action: "Funds disbursed",
          performedBy: session.user.name || session.user.email || "System",
          note: `Method: ${data.disbursementMethod}${data.chequeNumber ? ` — Cheque #${data.chequeNumber}` : ""}${data.bankReference ? ` — Ref: ${data.bankReference}` : ""}`,
        },
      });
    });

    const req = await prisma.fundRequest.findUnique({ where: { id: requestId } });
    revalidatePath(`/dashboard/committees/${req?.committeeId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to disburse funds" };
  }
}

// ─────────────── Stats ───────────────

export async function getFundDistributionStats(committeeId: string, termId?: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { totalDisbursed: 0, activeRequests: 0, approvedPending: 0 };

  const where = {
    committeeId,
    ...(termId ? { committeeTermId: termId } : {}),
  };

  const [disbursedAgg, activeCount, approvedCount] = await Promise.all([
    prisma.fundRequest.aggregate({
      where: { ...where, status: "DISBURSED" },
      _sum: { grantedAmount: true },
    }),
    prisma.fundRequest.count({
      where: { ...where, status: { notIn: ["DISBURSED", "REJECTED"] } },
    }),
    prisma.fundRequest.count({
      where: { ...where, status: "APPROVED" },
    }),
  ]);

  return {
    totalDisbursed: disbursedAgg._sum.grantedAmount || 0,
    activeRequests: activeCount,
    approvedPending: approvedCount,
  };
}

// ─────────────── Search Members (for beneficiary selection) ───────────────

export async function searchFamilyMembers(query: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.mainMahallaId) return [];

  return prisma.familyMember.findMany({
    where: {
      familyCard: {
        subMahalla: { mainMahallaId: session.user.mainMahallaId },
      },
      OR: [
        { fullName: { contains: query, mode: "insensitive" } },
        { nic: { contains: query, mode: "insensitive" } },
      ],
      status: "ACTIVE",
    },
    include: {
      familyCard: {
        include: { subMahalla: true },
      },
    },
    take: 10,
  });
}
