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
  if (!session || session.user.role !== "MAIN_ADMIN") {
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
            mainMahallaId: session.user.mainMahallaId as string
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

  return (
    <div className="space-y-10 pb-20">
      <div className="flex justify-between items-center">
        <div className="flex gap-6 items-start">
          <div className="w-20 h-20 bg-transparent rounded-[28px] flex items-center justify-center text-slate-900 font-black text-3xl shadow-xl shadow-slate-100 overflow-hidden border-2 border-slate-200">
            {committee.logo ? (
              <img src={committee.logo} alt={committee.name} className="w-full h-full object-contain p-1" />
            ) : (
              committee.name.charAt(0)
            )}
          </div>
          <div>
            <Link href="/dashboard/committees" className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-blue-600 transition-all mb-2 uppercase tracking-[0.2em]">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Committees
            </Link>
            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">{committee.name}</h2>
              <div className="flex gap-3 items-center">
                <span className="px-4 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-200">
                  {committee.status}
                </span>
                {currentTerm && (
                  <span className="px-4 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> {currentTerm.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CommitteeView 
        committee={committee} 
        currentTerm={currentTerm} 
        members={members} 
        allMembers={allMembers}
        stats={stats}
        settings={settings}
      />
    </div>
  );
}
