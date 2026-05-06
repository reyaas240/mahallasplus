"use client";

import { useState } from "react";
import { Lock, Key, Save, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { changeUserPassword } from "@/app/actions/user-profile";

export function ChangePasswordForm() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    const current = formData.get("current") as string;
    const newPass = formData.get("new") as string;
    const confirm = formData.get("confirm") as string;

    if (newPass !== confirm) {
      setIsUpdating(false);
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    const res = await changeUserPassword({ current, new: newPass });
    setIsUpdating(false);
    if (res.success) {
      setMessage({ type: "success", text: "Password changed successfully!" });
      (e.target as HTMLFormElement).reset();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to change password" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8 relative group overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-rose-50 rounded-full blur-[100px] -ml-32 -mt-32 opacity-30 group-hover:opacity-60 transition-opacity duration-1000" />

      <div className="relative space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Security Access</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update your platform access password</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Current Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Key className="w-4 h-4" /></div>
              <input name="current" type="password" required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-rose-600 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">New Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock className="w-4 h-4" /></div>
              <input name="new" type="password" required minLength={8} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-rose-600 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Confirm New Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock className="w-4 h-4" /></div>
              <input name="confirm" type="password" required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-rose-600 outline-none transition-all" />
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100">
          <div className="flex-1">
             {message.text && (
               <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                 {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                 {message.text}
               </div>
             )}
          </div>
          <button 
            disabled={isUpdating}
            className="w-full md:w-auto px-10 py-5 bg-rose-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-rose-100 active:scale-95 disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Update Password
          </button>
        </div>
      </div>
    </form>
  );
}
