import { prisma } from "@/lib/prisma";
import { Plus, Search, Building, Calendar, Power, CheckCircle2 } from "lucide-react";
import { MainMahallaActions } from "./MainMahallaActions";
import { SubMahallaDrawer } from "./SubMahallaDrawer";

export default async function MainMahallasPage() {
  const [mahallas, countries, provinces, districts, divisionalSecretariats, areas] = await Promise.all([
    prisma.mainMahalla.findMany({ 
      orderBy: { createdAt: "desc" },
      include: { subMahallas: true }
    }),
    prisma.masterCountry.findMany({ orderBy: { name: "asc" } }),
    prisma.masterProvince.findMany({ orderBy: { name: "asc" } }),
    prisma.masterDistrict.findMany({ orderBy: { name: "asc" } }),
    prisma.masterDivisionalSecretariat.findMany({ orderBy: { name: "asc" } }),
    prisma.masterArea.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Main Mahallas</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">Global Platform Administration</p>
        </div>
        <button className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-100 active:scale-95">
          <Plus className="w-5 h-5" /> Add New Mahalla
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter Mahallas..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all font-bold text-sm"
            />
          </div>
        </div>

        {mahallas.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="bg-slate-50 p-6 rounded-[24px] mb-4">
              <Building className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-1">No Mahallas Found</h3>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Platform registry is currently empty</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                  <th className="p-6">Mahalla Identity</th>
                  <th className="p-6">Currency</th>
                  <th className="p-6">Jurisdiction</th>
                  <th className="p-6">Status</th>
                  <th className="p-6">Operational Dates</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mahallas.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 uppercase tracking-wide text-sm">{m.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{m.country || "Location Not Set"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-widest">
                        {m.defaultCurrency}
                      </span>
                    </td>
                    <td className="p-6">
                      <SubMahallaDrawer mainMahallaName={m.name} subMahallas={m.subMahallas} />
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        m.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Active: {m.activatedDate ? new Date(m.activatedDate).toLocaleDateString() : 'Pending'}</span>
                        </div>
                        {m.deactivatedDate && (
                          <div className="flex items-center gap-2 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                            <Power className="w-3.5 h-3.5" />
                            <span>Deactivated: {new Date(m.deactivatedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <MainMahallaActions 
                        mahalla={m} 
                        masters={{ countries, provinces, districts, divisionalSecretariats, areas }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
