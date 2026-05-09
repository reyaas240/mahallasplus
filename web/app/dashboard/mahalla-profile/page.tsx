import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Building, MapPin, Globe, Mail, Phone, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { MahallaProfileForm } from "./MahallaProfileForm";
import { getProxiedImageUrl } from "@/lib/utils";

export default async function MahallaProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MAIN_ADMIN" || !session.user.mainMahallaId) {
    redirect("/dashboard");
  }

  const [mahalla, countries, provinces, districts, areas] = await Promise.all([
    prisma.mainMahalla.findUnique({ 
      where: { id: session.user.mainMahallaId },
      include: {
        licensePlan: true,
        subscription: true,
      }
    }),
    prisma.masterCountry.findMany({ orderBy: { name: "asc" } }),
    prisma.masterProvince.findMany({ orderBy: { name: "asc" } }),
    prisma.masterDistrict.findMany({ orderBy: { name: "asc" } }),
    prisma.masterArea.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!mahalla) redirect("/dashboard");

  const plan = mahalla.licensePlan;
  const sub = mahalla.subscription;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative h-64 rounded-[40px] overflow-hidden group shadow-2xl border-4 border-white">
        {mahalla.coverImage ? (
          <img src={getProxiedImageUrl(mahalla.coverImage)} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-8 left-8 flex items-end gap-6">
          <div className="w-32 h-32 bg-white rounded-3xl p-1 shadow-2xl border-4 border-white/20 backdrop-blur-sm overflow-hidden">
            {mahalla.logo ? (
              <img src={getProxiedImageUrl(mahalla.logo)} className="w-full h-full object-cover rounded-2xl" alt="Logo" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                <Building className="w-12 h-12" />
              </div>
            )}
          </div>
          <div className="pb-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">{mahalla.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                {mahalla.status}
              </span>
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {mahalla.district}, {mahalla.country}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <MahallaProfileForm 
            mahalla={mahalla} 
            masters={{ countries, provinces, districts, areas }} 
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[60px] -mr-16 -mt-16 opacity-50" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" /> Subscription Status
            </h3>
            <div className="space-y-4 relative">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</span>
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-200">{plan?.name || "No Plan"}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Cycle</span>
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-200">{plan?.type || "—"}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered</span>
                <span className="text-xs font-bold text-slate-900">{new Date(mahalla.registeredDate).toLocaleDateString()}</span>
              </div>
              {sub && (
                <>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period Start</span>
                    <span className="text-xs font-bold text-slate-900">{new Date(sub.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Invoice</span>
                    <span className="text-xs font-bold text-slate-900">{new Date(sub.nextInvoiceDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                    <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${sub.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{sub.status}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-[60px] -mr-16 -mb-16" />
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" /> Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Currency</p>
                <p className="text-xl font-black">{mahalla.defaultCurrency}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                <p className="text-xl font-black text-emerald-400">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
