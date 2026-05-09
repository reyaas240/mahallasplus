import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Plus, Shield, Search, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CreateCommitteeButton } from "./CreateCommitteeButton";
import { CommitteeActions } from "./CommitteeActions";
import { checkFeature } from "@/lib/features";
import { getProxiedImageUrl } from "@/lib/utils";

export default async function CommitteesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const canOversight = await checkFeature(session.user.mainMahallaId as string, "ALLOW_COMMITTEE_OVERSIGHT");

  const where: any = {
    mainMahallaId: session.user.mainMahallaId as string,
  };

  if (session.user.role === "SUB_ADMIN") {
    where.subMahallaId = session.user.subMahallaId as string;
  } else if (session.user.role === "MAIN_ADMIN") {
    if (canOversight) {
      where.OR = [
        { subMahallaId: null }, // Committees directly under Main Mahalla
        { allowMainMahallaView: true } // Sub Mahalla committees that granted view access
      ];
    } else {
      where.subMahallaId = null; // Only directly owned committees
    }
  }

  const committees = await prisma.committee.findMany({
    where,
    include: {
      _count: {
        select: { terms: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Committee Management</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-[0.2em]">
            {session.user.role === "MAIN_ADMIN" ? "Central Control & Sub-Mahalla Oversight" : "Local Board Administration"}
          </p>
        </div>
        <CreateCommitteeButton userRole={session.user.role} canOversight={canOversight} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" /> Active Committees
              </h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter committees..." 
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none w-64 font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {committees.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No committees found</p>
                </div>
              ) : (
                committees.map((c) => {
                  const isOversight = session.user.role === "MAIN_ADMIN" && !!c.subMahallaId;
                  return (
                    <div key={c.id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                      <div className="flex gap-5 items-center">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm overflow-hidden border border-slate-100">
                          {c.logo ? (
                            <img src={getProxiedImageUrl(c.logo)} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-7 h-7" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-900 uppercase tracking-wide group-hover:text-blue-600 transition-colors">
                            {c.name}
                          </h4>
                          <div className="flex gap-4 items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span className={`px-2 py-0.5 rounded-md border ${c.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                              {c.status}
                            </span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {c._count.terms} Terms</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Created {new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          {c.description && (
                            <p className="text-sm text-slate-500 font-medium line-clamp-1 max-w-md">
                              {c.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CommitteeActions committee={c} isReadOnly={isOversight} userRole={session.user.role} canOversight={canOversight} />
                        <Link 
                          href={`/dashboard/committees/${c.id}`}
                          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-slate-200"
                        >
                          {isOversight ? "View Committee" : "Manage Committee"} <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
