"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInvoices() {
  return prisma.invoice.findMany({
    include: {
      licensePlan: true,
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function updateInvoiceStatus(id: string, status: any) {
  try {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { 
        status,
        paidAt: status === "PAID" ? new Date() : null
      }
    });
    revalidatePath("/dashboard/invoices");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteInvoice(id: string) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/dashboard/invoices");
  return { success: true };
}
