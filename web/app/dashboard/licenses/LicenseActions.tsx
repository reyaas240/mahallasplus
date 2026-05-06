"use client";
import { useState } from "react";
import { MoreVertical, Edit2, Trash2, Power, X, Copy, AlertCircle } from "lucide-react";
import { toggleLicensePlanStatus, deleteLicensePlan } from "@/app/actions/licensePlans";
import { LicenseForm } from "./LicenseForm";

export function LicenseActions({ plan }: { plan: any }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCopyMode, setIsCopyMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggle = async () => {
    setIsProcessing(true);
    await toggleLicensePlanStatus(plan.id, plan.status);
    setIsProcessing(false);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    setIsProcessing(true);
    const res = await deleteLicensePlan(plan.id);
    setIsProcessing(false);
    if (!res.success) alert(res.error);
    setShowMenu(false);
  };

  const inUse = plan._count && (plan._count.mainMahallas > 0 || plan._count.requests > 0);

  return (
    <div className="relative">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
            {inUse ? (
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 mb-1">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <p className="text-[9px] font-bold text-amber-700 leading-tight">This plan is currently in use and cannot be edited. Please copy it to make changes.</p>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => { setIsEditing(true); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-slate-700 uppercase tracking-widest hover:bg-slate-50 hover:text-blue-600 transition-all"
              >
                <Edit2 className="w-4 h-4" /> Edit Plan
              </button>
            )}
            
            <button 
              onClick={() => { setIsCopyMode(true); setShowMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-slate-700 uppercase tracking-widest hover:bg-slate-50 hover:text-blue-600 transition-all"
            >
              <Copy className="w-4 h-4" /> Copy Plan
            </button>
            
            <button 
              onClick={handleToggle}
              disabled={isProcessing}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all ${plan.status === 'ACTIVE' ? 'text-amber-600' : 'text-emerald-600'}`}
            >
              <Power className="w-4 h-4" /> {plan.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
            <div className="h-px bg-slate-50 my-1" />
            <button 
              onClick={handleDelete}
              disabled={isProcessing || inUse}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${inUse ? 'text-slate-400 cursor-not-allowed opacity-50' : 'text-rose-600 hover:bg-rose-50'}`}
            >
              <Trash2 className="w-4 h-4" /> Delete Plan
            </button>
          </div>
        </>
      )}

      {(isEditing || isCopyMode) && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
          <div onClick={() => { setIsEditing(false); setIsCopyMode(false); }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
          <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500 ease-out">
            <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {isCopyMode ? "Copy License Plan" : "Modify License Plan"}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                  {isCopyMode ? "Create a new plan from existing configuration" : "Update subscription configurations"}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => { setIsEditing(false); setIsCopyMode(false); }}
                className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-600 transition-all hover:bg-rose-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <LicenseForm 
                initialData={plan} 
                isCopy={isCopyMode}
                onComplete={() => { setIsEditing(false); setIsCopyMode(false); }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
