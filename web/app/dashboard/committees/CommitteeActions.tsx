"use client";
import { useState } from "react";
import { Power, PowerOff, Loader2, Edit3, Trash2, X } from "lucide-react";
import { toggleCommitteeStatus, deleteCommittee } from "@/app/actions/committee";
import { CommitteeForm } from "./CommitteeForm";

export function CommitteeActions({ committee }: { committee: any }) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    const res = await toggleCommitteeStatus(committee.id);
    setIsToggling(false);
    if (!res.success) alert(res.error);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this committee? This will remove all member assignments.")) {
      setIsDeleting(true);
      const res = await deleteCommittee(committee.id);
      setIsDeleting(false);
      if (!res.success) alert(res.error);
    }
  };

  const isActive = committee.status === "ACTIVE";

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => setIsEditing(true)}
        className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all border border-transparent hover:border-amber-100"
        title="Edit Committee"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      <button 
        onClick={handleToggle}
        disabled={isToggling}
        title={isActive ? "Deactivate" : "Activate"}
        className={`p-2.5 rounded-xl transition-all border flex items-center justify-center ${
          isActive 
            ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
            : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100"
        }`}
      >
        {isToggling ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isActive ? (
          <Power className="w-4 h-4" />
        ) : (
          <PowerOff className="w-4 h-4" />
        )}
      </button>

      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100"
        title="Delete Committee"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>

      {isEditing && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
          {/* Backdrop */}
          <div 
            onClick={() => setIsEditing(false)} 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" 
          />
          
          {/* Drawer Content */}
          <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500 ease-out text-left">
            <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Update Committee</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Modify board configurations</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-600 transition-all hover:bg-rose-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <CommitteeForm 
                initialData={committee} 
                onComplete={() => setIsEditing(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
