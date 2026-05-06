import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Users, Shield, Calendar, MapPin, Trash2, ChevronLeft, UserPlus, ShieldCheck, History } from "lucide-react";
import Link from "next/link";
import { MemberSelector } from "./MemberSelector";
import { CommitteeMemberActions } from "./CommitteeMemberActions";
import { TermManager } from "./TermManager";
import { FinancialSetup } from "./FinancialSetup";
import { DonorDonationManager } from "./DonorDonationManager";
import { getCommitteeStats, getFinancialSettings } from "@/app/actions/committee";
import { CommitteeView } from "./CommitteeView";

export default async function CommitteeDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const committee = await prisma.committee.findUnique({
    where: { id: params.id },
    include: {
      terms: {
        include: {
          balances: true,
          members: {
            include: {
              familyMember: {
                include: {
                  familyCard: {
                    include: {
                      subMahalla: true
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: { members: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!committee || committee.mainMahallaId !== session.user.mainMahallaId) {
    return notFound();
  }

  const currentTerm = committee.terms.find(t => t.status === 'ACTIVE') || committee.terms[0] || null;
  const members = currentTerm?.members || [];

  const [allMembers, stats, settings] = await Promise.all([
    prisma.familyMember.findMany({
      where: {
        familyCard: {
          subMahalla: {
            mainMahallaId: session.user.mainMahallaId as string,
            ...(session.user.role === "SUB_ADMIN" && session.user.subMahallaId ? { id: session.user.subMahallaId } : {})
          }
        }
      },
      include: {
        familyCard: {
          include: {
            subMahalla: true
          }
        }
      },
      orderBy: { fullName: "asc" }
    }),
    currentTerm ? getCommitteeStats(committee.id, currentTerm.id) : { totalCollections: 0, donorCount: 0, goalProgress: 0, goalAmount: 1000000 },
    getFinancialSettings()
  ]);

  const isReadOnly = session.user.role === "MAIN_ADMIN" && (committee as any).subMahallaId !== null;

  return (
    <div className="space-y-10 pb-20">
      <CommitteeView 
        committee={committee} 
        currentTerm={currentTerm} 
        members={members} 
        allMembers={allMembers}
        stats={stats}
        settings={settings}
        isReadOnly={isReadOnly}
        userRole={session.user.role}
      />
    </div>
  );
}
