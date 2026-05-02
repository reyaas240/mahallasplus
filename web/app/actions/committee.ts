"use server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createCommittee(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  try {
    const committee = await prisma.committee.create({
      data: {
        name,
        description,
        mainMahallaId: session.user.mainMahallaId as string,
      },
    });
    revalidatePath("/dashboard/committees");
    return { success: true, id: committee.id };
  } catch (e) {
    return { success: false, error: "Failed to create committee" };
  }
}

export async function updateCommittee(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const status = formData.get("status") as any;

  try {
    await prisma.committee.update({
      where: { id },
      data: { name, description, status },
    });
    revalidatePath("/dashboard/committees");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to update committee" };
  }
}

export async function addCommitteeMember(committeeId: string, familyMemberId: string, role: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.committeeMember.create({
      data: {
        committeeId,
        familyMemberId,
        role,
      },
    });
    revalidatePath(`/dashboard/committees/${committeeId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: "Member already exists in this committee" };
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
    });
    revalidatePath(`/dashboard/committees/${member.committeeId}`);
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
        committee: true
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
          committeeId: member.committeeId,
          mainMahallaId: member.committee.mainMahallaId,
        },
        create: {
          email: member.familyMember.email,
          name: member.familyMember.fullName,
          password: hashedPassword,
          role: "COMMITTEE_ADMIN",
          committeeId: member.committeeId,
          mainMahallaId: member.committee.mainMahallaId,
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

    revalidatePath(`/dashboard/committees/${member.committeeId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to toggle access" };
  }
}
