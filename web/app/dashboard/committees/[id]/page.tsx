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

  const allMembers = await prisma.familyMember.findMany({
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
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard/committees" className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors mb-2 uppercase tracking-[0.2em]">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Committees
          </Link>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{committee.name}</h2>
          <div className="flex gap-4 items-center mt-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
              {committee.status}
            </span>
            <span className="text-slate-400 text-xs font-bold flex items-center gap-1.5 uppercase tracking-widest">
              <Calendar className="w-3.5 h-3.5" /> Created {new Date(committee.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Members List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> 
                {currentTerm ? `${currentTerm.name} Members` : 'Committee Members'} ({members.length})
              </h3>
              {currentTerm && (
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" /> Showing {currentTerm.status === 'ACTIVE' ? 'Active' : 'Latest'} Term
                </span>
              )}
            </div>
            
            <div className="divide-y divide-slate-100">
              {members.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No members assigned to this term</p>
                </div>
              ) : (
                members.map((m) => (
                  <div key={m.id} className="p-6 flex justify-between items-center hover:bg-slate-50/50 transition-all group">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-black text-lg">
                        {m.familyMember.fullName.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 uppercase tracking-wide text-sm">{m.familyMember.fullName}</h4>
                          <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">{m.role}</span>
                          {m.status === 'INACTIVE' && <span className="bg-rose-50 text-rose-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase border border-rose-100 tracking-tighter">InActive</span>}
                        </div>
                        <div className="flex gap-3 items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {m.familyMember.familyCard.subMahalla.name}</span>
                          {m.hasDashboardAccess && <span className="flex items-center gap-1 text-emerald-600"><ShieldCheck className="w-3.5 h-3.5" /> Dashboard Access</span>}
                        </div>
                      </div>
                    </div>
                    <CommitteeMemberActions member={m} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="bg-slate-900 rounded-3xl p-8 shadow-xl relative overflow-hidden text-white">
            <div className="absolute -right-4 -top-4 p-8 opacity-10 rotate-12">
              <Shield className="w-32 h-32" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              Committee Goal
            </h3>
            <p className="text-slate-400 font-medium leading-relaxed mb-6">
              {committee.description || "No description provided for this committee."}
            </p>
          </div>

          <TermManager committeeId={committee.id} terms={committee.terms} />

          <MemberSelector terms={committee.terms} allMembers={allMembers} />
        </div>
      </div>
    </div>
  );
}
