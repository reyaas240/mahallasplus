"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitRegistration(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const mahallaName = formData.get("mahallaName") as string;
  const licensePlan = formData.get("licensePlan") as string;

  try {
    await prisma.registrationRequest.create({
      data: {
        fullName,
        email,
        phone,
        mahallaName,
        licensePlan,
        status: "PENDING"
      }
    });

    revalidatePath("/dashboard/requests");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to submit request. Email might already exist." };
  }
}
