"use client";
import { prisma } from "@/lib/prisma";
import { Building, Pencil, MapPin } from "lucide-react";
import { SubMahallaForm } from "./SubMahallaForm";
import { getProxiedImageUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SubMahallasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subMahallas, setSubMahallas] = useState<any[]>([]);
  const [subAreas, setSubAreas] = useState<any[]>([]);
  const [selectedSubMahalla, setSelectedSubMahalla] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/dashboard");
    if (status === "authenticated") fetchData();
  }, [status]);

  async function fetchData() {
    setIsLoading(true);
    try {
      // We'll use a server action or a direct fetch if this were a server component, 
      // but since we need client state for the edit form, let's use an inline fetch pattern 
      // (or we could have kept it a server component and passed a "key" to the form, 
      // but client component is more flexible for the "Edit" toggle).
      
      const response = await fetch('/api/dashboard/sub-mahallas');
      const data = await response.json();
      
      setSubMahallas(data.subMahallas);
      setSubAreas(data.subAreas);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-black uppercase tracking-widest text-xs">Loading Visual Identity...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Sub Mahalla Registry</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Institutional nodes and geographic jurisdictions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 sticky top-6">
          <SubMahallaForm 
            initialData={selectedSubMahalla} 
            subAreas={subAreas} 
            onCancel={() => { setSelectedSubMahalla(null); fetchData(); }}
          />
        </div>
        
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
            {subMahallas.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No jurisdictions mapped yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                      <th className="p-6">Entity</th>
                      <th className="p-6">Location</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {subMahallas.map((sm) => (
                      <tr key={sm.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                              {sm.logo ? (
                                <img src={getProxiedImageUrl(sm.logo)} className="w-full h-full object-contain" alt={sm.name} />
                              ) : (
                                <Building className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 uppercase tracking-wide text-sm">{sm.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] font-bold text-slate-500 lowercase">{sm.email || "no-email-configured"}</p>
                                <span className="text-[10px] text-slate-300">•</span>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{sm.memberCount || 0} Members</p>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <div>
                              <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{sm.area || "N/A"}</p>
                              <p className="text-[10px] font-medium text-slate-400 truncate max-w-[200px]">{sm.address || "Street Address Unset"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`inline-flex px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${
                            sm.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {sm.status}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <button 
                            onClick={() => setSelectedSubMahalla(sm)}
                            className="p-2.5 bg-white text-slate-400 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
