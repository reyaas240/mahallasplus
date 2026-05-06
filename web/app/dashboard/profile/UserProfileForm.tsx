"use client";

import { useState } from "react";
import { User, Mail, Save, Loader2, CheckCircle2 } from "lucide-react";
import { updateUserProfile } from "@/app/actions/user-profile";

export function UserProfileForm({ user }: { user: any }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    };

    const res = await updateUserProfile(data);
    setIsUpdating(false);
    if (res.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8 relative group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="relative space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center">
            <User className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Personal Identity</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update your display name and contact email</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Full Name</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User className="w-4 h-4" /></div>
              <input name="name" defaultValue={user.name} required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">Email Address</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail className="w-4 h-4" /></div>
              <input name="email" defaultValue={user.email} disabled className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-400 text-sm cursor-not-allowed" />
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100">
          <div className="flex-1">
             {message.text && (
               <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                 {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                 {message.text}
               </div>
             )}
          </div>
          <button 
            disabled={isUpdating}
            className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-100 active:scale-95 disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Profile Changes
          </button>
        </div>
      </div>
    </form>
  );
}
