"use client";
import { useState } from "react";
import { createCommittee } from "@/app/actions/committee";
import { Loader2, ShieldCheck } from "lucide-react";

export function CommitteeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const res = await createCommittee(formData);
    setIsSubmitting(false);
    
    if (res.success) {
      form.reset();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">New Committee</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Committee Name</label>
          <input 
            required 
            name="name" 
            type="text" 
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm uppercase tracking-wide" 
            placeholder="e.g. Welfare Board" 
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Description</label>
          <textarea 
            name="description" 
            rows={4}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold text-slate-900 text-sm" 
            placeholder="Purpose of this committee..." 
          />
        </div>

        <button 
          disabled={isSubmitting} 
          type="submit" 
          className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex justify-center items-center gap-3 active:scale-95 shadow-xl shadow-blue-200 mt-4"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Establish Committee"}
        </button>
      </form>
    </div>
  );
}
