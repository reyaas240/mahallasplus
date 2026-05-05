import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Users, Shield, Calendar, MapPin, MessageSquare, Info } from "lucide-react";

export default async function CommitteePortalPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "COMMITTEE_ADMIN" || !session.user.committeeId) {
    redirect("/dashboard");
  }

  const committee = await prisma.committee.findUnique({
    where: { id: session.user.committeeId },
    include: {
      terms: {
        where: { status: 'ACTIVE' },
        include: {
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
          }
        }
      }
    }
  });

  const members = committee?.terms?.[0]?.members || [];

  if (!committee) return notFound();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{committee.name} Portal</h2>
          <p className="text-emerald-600 font-bold mt-1 uppercase text-xs tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4" /> Official Committee Access
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Welcome Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
               <Shield className="w-48 h-48 text-slate-900" />
             </div>
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
               Welcome to the Committee Dashboard
             </h3>
             <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">
               You have been granted administrative access to manage the <strong>{committee.name}</strong>. 
               Use this portal to collaborate with other committee members and oversee your assigned tasks.
             </p>
          </div>

          {/* Members List (ReadOnly for Committee Admins for now) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> My Committee Colleagues ({members.length})
              </h3>
            </div>
            
            <div className="divide-y divide-slate-100">
              {members.map((m) => (
                <div key={m.id} className="p-6 flex justify-between items-center hover:bg-slate-50/50 transition-all group">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-black text-lg">
                      {m.familyMember.fullName.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 uppercase tracking-wide text-sm">{m.familyMember.fullName}</h4>
                        <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">{m.role}</span>
                      </div>
                      <div className="flex gap-3 items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {m.familyMember.familyCard.subMahalla.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          {/* Committee Info */}
          <div className="bg-slate-900 rounded-3xl p-8 shadow-xl relative overflow-hidden text-white">
            <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" /> About
            </h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              {committee.description || "No description provided."}
            </p>
            <div className="mt-8 pt-8 border-t border-slate-800 space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mahalla</span>
                  <span className="text-xs font-bold text-blue-400">Main Mahalla HQ</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Established</span>
                  <span className="text-xs font-bold">{new Date(committee.createdAt).toLocaleDateString()}</span>
               </div>
            </div>
          </div>

          {/* Quick Actions (Future) */}
          <div className="bg-blue-600 rounded-3xl p-8 shadow-xl text-white">
             <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
               Operations
             </h3>
             <div className="space-y-3">
                <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 border border-white/10">
                   <MessageSquare className="w-4 h-4" /> Post Announcement
                </button>
                <p className="text-[10px] text-blue-200 text-center font-bold uppercase tracking-widest mt-4">
                  Operational features coming soon
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
