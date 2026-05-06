"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { LicenseForm } from "./LicenseForm";

export function CreateLicenseButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-blue-200"
      >
        <Plus className="w-4 h-4" /> Create License Plan
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
          {/* Backdrop */}
          <div 
            onClick={() => setIsOpen(false)} 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" 
          />
          
          {/* Drawer Content */}
          <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500 ease-out">
            <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Establish License Plan</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Configure new subscription model</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-600 transition-all hover:bg-rose-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <LicenseForm 
                onComplete={() => setIsOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
