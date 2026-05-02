"use client";
import { createFamilyCard } from "@/app/actions/family";
import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export function FamilyCardForm({ subMahallas, userRole }: { subMahallas: any[], userRole: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const res = await createFamilyCard(formData);
    setIsSubmitting(false);
    
    if (res.success) {
      router.push(`/dashboard/families/${res.id}`);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-bold text-slate-900">New Family Card</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Sub Mahalla</label>
          <select required name="subMahallaId" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm font-medium">
            <option value="">-- Select Mahalla --</option>
            {subMahallas.map(sm => (
              <option key={sm.id} value={sm.id}>{sm.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Living Type</label>
          <select required name="livingType" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm font-medium">
            <option value="OWN_HOUSE">Own House</option>
            <option value="RENTED">Rented</option>
            <option value="MONTHLY_SUBSCRIPTION_MAIN">Monthly Subscription (Main)</option>
            <option value="MONTHLY_SUBSCRIPTION_SUB">Monthly Subscription (Sub)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Main Card No</label>
            <input name="mainMahallaCardNo" type="text" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm" placeholder="M-000" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sub Card No</label>
            <input name="subMahallaCardNo" type="text" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm" placeholder="S-000" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Living From Date</label>
          <input name="livingFromDate" type="date" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-sm" />
        </div>

        <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all flex justify-center items-center gap-2 mt-4 active:scale-95">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Register Card</>}
        </button>
      </form>
    </div>
  );
}
