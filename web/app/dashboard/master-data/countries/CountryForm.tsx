"use client";
import { createCountry } from "@/app/actions/master-data";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function CountryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const res = await createCountry(formData);
    setIsSubmitting(false);
    
    if (res.success) {
      form.reset();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="font-bold text-slate-900 mb-4">Add New Country</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Country Name</label>
          <input required name="name" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" placeholder="e.g. United Kingdom" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ISO Code</label>
          <input required name="code" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" placeholder="e.g. GB" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
          <input required name="currency" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" placeholder="e.g. GBP" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Currency Decimal Places</label>
          <input required name="currencyDecimalPlaces" type="number" min="0" max="4" defaultValue="2" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" placeholder="e.g. 2" />
        </div>
        <button disabled={isSubmitting} type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex justify-center items-center">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add Country"}
        </button>
      </form>
    </div>
  );
}
