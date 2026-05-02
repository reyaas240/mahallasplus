"use client";
import { createSubMahalla } from "@/app/actions/main-admin";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function SubMahallaForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const res = await createSubMahalla(formData);
    setIsSubmitting(false);
    
    if (res.success) {
      form.reset();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="font-bold text-slate-900 mb-4">Create Sub Mahalla</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
          <input required name="name" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" placeholder="e.g. North Zone" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input name="email" type="email" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" placeholder="Optional" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Area</label>
          <input name="area" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" placeholder="Geographic area" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
          <input name="address" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" placeholder="Physical address" />
        </div>
        <button disabled={isSubmitting} type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex justify-center items-center">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Sub Mahalla"}
        </button>
      </form>
    </div>
  );
}
