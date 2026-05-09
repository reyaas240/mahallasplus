"use client";
import { useState } from "react";
import { X, Building, MapPin, Users } from "lucide-react";
import { getProxiedImageUrl } from "@/lib/utils";

export function SubMahallaDrawer({ mainMahallaName, subMahallas }: { mainMahallaName: string, subMahallas: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all border border-blue-100 group"
      >
        <Building className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">{subMahallas.length} Sub Mahallas</span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          {/* Drawer Content */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{mainMahallaName}</h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">Jurisdictional Nodes Registry</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {subMahallas.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-10">
                  <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                    <Building className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">No jurisdictions mapped for this mahalla</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subMahallas.map((sm) => (
                    <div key={sm.id} className="p-5 bg-white border border-slate-100 rounded-[28px] hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:border-blue-100 transition-colors">
                          {sm.logo ? (
                            <img src={getProxiedImageUrl(sm.logo)} className="w-full h-full object-contain" alt={sm.name} />
                          ) : (
                            <Building className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-slate-900 uppercase tracking-wide text-sm truncate">{sm.name}</h4>
                          <div className="flex flex-col gap-1.5 mt-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate">{sm.area || "Area Not Set"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-blue-400" />
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Node</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/30">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                Platform Registry &bull; Core Jurisdictions
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
