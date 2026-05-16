"use client";
import { createSubAdmin, createMainStaff } from "@/app/actions/main-admin";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function SubAdminForm({ subMahallas }: { subMahallas: { id: string, name: string }[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<'SUB_ADMIN' | 'MAIN_STAFF'>('SUB_ADMIN');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const res = role === 'SUB_ADMIN' ? await createSubAdmin(formData) : await createMainStaff(formData);
    setIsSubmitting(false);
    
    if (res.success) {
      form.reset();
    } else {
      alert(res.error);
    }
  };

  if (subMahallas.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-slate-500">
        <p>You must create at least one Sub Mahalla before adding Sub Admins.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="font-bold text-slate-900 mb-4 tracking-tight uppercase text-sm">Create New Account</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Account Role</label>
          <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
            <button 
              type="button" 
              onClick={() => setRole('SUB_ADMIN')}
              className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${role === 'SUB_ADMIN' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sub Admin
            </button>
            <button 
              type="button" 
              onClick={() => setRole('MAIN_STAFF')}
              className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${role === 'MAIN_STAFF' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Mahalla Staff
            </button>
          </div>
        </div>

        {role === 'SUB_ADMIN' && (
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Assign to Sub Mahalla</label>
            <select required name="subMahallaId" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm">
              <option value="">-- Select Sub Mahalla --</option>
              {subMahallas.map(sm => (
                <option key={sm.id} value={sm.id}>{sm.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Full Name</label>
          <input required name="name" type="text" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm" placeholder="e.g. John Doe" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Email (Login ID)</label>
          <input required name="email" type="email" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm" placeholder="admin@mahalla.com" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Temporary Password</label>
          <input required name="password" type="password" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm" placeholder="••••••••" />
        </div>
        <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-slate-900 text-white rounded-lg font-black hover:bg-slate-800 transition-all flex justify-center items-center gap-2 mt-4 active:scale-95 uppercase tracking-wide text-sm">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
        </button>
      </form>
    </div>
  );
}
