"use client";
import { createFamilyCard } from "@/app/actions/family";
import { useState } from "react";
import { Loader2, CreditCard, MapPin, Image as ImageIcon, Camera, Home, Map } from "lucide-react";
import { useRouter } from "next/navigation";

export function FamilyCardForm({ subMahallas, userRole, selectedMahallaId }: { subMahallas: any[], userRole: string, selectedMahallaId?: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Ensure selectedMahallaId is included even if the select is visually disabled
    if (selectedMahallaId && !formData.get("subMahallaId")) {
      formData.append("subMahallaId", selectedMahallaId);
    }

    const res = await createFamilyCard(formData);
    setIsSubmitting(false);

    if (res.success) {
      router.push(`/dashboard/families/${res.id}`);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl p-8 sticky top-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">New Family Card</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Register household record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Target Sub Mahalla</label>
            <select
              required
              name="subMahallaId"
              value={selectedMahallaId || ""}
              disabled={!!selectedMahallaId}
              onChange={() => { }}
              className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900 ${selectedMahallaId ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              <option value="">-- Select Mahalla --</option>
              {subMahallas.map(sm => (
                <option key={sm.id} value={sm.id}>{sm.name}</option>
              ))}
            </select>
            {selectedMahallaId && <input type="hidden" name="subMahallaId" value={selectedMahallaId} />}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Main Card No</label>
              <input required name="mainMahallaCardNo" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900" placeholder="M-000" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Sub Card No</label>
              <input required name="subMahallaCardNo" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900" placeholder="S-000" />
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Living Type</label>
            <select required name="livingType" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900">
              <option value="OWN_HOUSE">Own House</option>
              <option value="RENTED">Rented</option>
              <option value="MONTHLY_SUBSCRIPTION_MAIN">Monthly Subscription (Main)</option>
              <option value="MONTHLY_SUBSCRIPTION_SUB">Monthly Subscription (Sub)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Residential Address</label>
            <textarea 
              name="address" 
              required 
              rows={3}
              placeholder="Full street address, house number, and area..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900 resize-none"
            />
          </div>

          <div className="grid grid-cols-1">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Living From</label>
              <input name="livingFromDate" type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900" />
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Attachments & Images</label>
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-[24px] hover:bg-slate-50 transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors mb-2" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Click to upload images</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">PNG, JPG, PDF (MAX 5MB)</p>
              </div>
              <input name="attachments" type="file" multiple className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
            </label>

            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {previews.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                    <img src={url} className="w-full h-full object-cover" alt="Preview" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-all flex justify-center items-center gap-3 mt-6 active:scale-95 uppercase tracking-[0.2em] text-xs shadow-xl shadow-slate-200">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Register Family Card</>}
        </button>
      </form>
    </div>
  );
}
