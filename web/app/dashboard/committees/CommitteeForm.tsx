"use client";
import { useState } from "react";
import { createCommittee, updateCommittee } from "@/app/actions/committee";
import { Loader2, ShieldCheck, Edit3 } from "lucide-react";
import { LogoUpload } from "./LogoUpload";

export function CommitteeForm({ initialData, onComplete }: { initialData?: any, onComplete?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoBlob, setLogoBlob] = useState<Blob | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (logoBlob) {
      formData.append("logo", logoBlob, "logo.png");
    }

    if (initialData) {
      formData.append("currentLogo", initialData.logo || "");
    }

    let res;
    if (initialData) {
      res = await updateCommittee(initialData.id, formData);
    } else {
      res = await createCommittee(formData);
    }
    
    setIsSubmitting(false);
    
    if (res.success) {
      if (!initialData) form.reset();
      setLogoBlob(null);
      if (onComplete) onComplete();
    } else {
      alert(res.error);
    }
  };

  const isEdit = !!initialData;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <LogoUpload onImageCropped={(blob) => setLogoBlob(blob)} currentLogo={initialData?.logo} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Committee Name</label>
            <input 
              required 
              name="name" 
              type="text" 
              defaultValue={initialData?.name}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm uppercase tracking-wide" 
              placeholder="e.g. Welfare Board" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Short Code</label>
            <input 
              name="shortCode" 
              type="text" 
              defaultValue={initialData?.shortCode}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm uppercase" 
              placeholder="e.g. WB01" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Established Date</label>
            <input 
              name="establishedDate" 
              type="date" 
              defaultValue={initialData?.establishedDate ? new Date(initialData.establishedDate).toISOString().split('T')[0] : ''}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Registration No</label>
            <input 
              name="registrationNo" 
              type="text" 
              defaultValue={initialData?.registrationNo}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm" 
              placeholder="Reg-12345" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Email Address</label>
            <input 
              name="email" 
              type="email" 
              defaultValue={initialData?.email}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm" 
              placeholder="committee@mahalla.com" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Contact Number</label>
            <input 
              name="contactNo" 
              type="tel" 
              defaultValue={initialData?.contactNo}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm" 
              placeholder="+94 ..." 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Website</label>
            <input 
              name="website" 
              type="url" 
              defaultValue={initialData?.website}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm" 
              placeholder="https://..." 
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Office Address</label>
          <textarea 
            name="address" 
            rows={2}
            defaultValue={initialData?.address}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold text-slate-900 text-sm" 
            placeholder="Complete office address..." 
          />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] mb-5">Bank Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Bank Name</label>
              <input 
                name="bankName" 
                type="text" 
                defaultValue={initialData?.bankName}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm" 
                placeholder="Bank Name" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Branch</label>
              <input 
                name="branch" 
                type="text" 
                defaultValue={initialData?.branch}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm" 
                placeholder="Branch Name" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Account Number</label>
              <input 
                name="accountNumber" 
                type="text" 
                defaultValue={initialData?.accountNumber}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm" 
                placeholder="Acc No" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Account Holder</label>
              <input 
                name="accountHolderName" 
                type="text" 
                defaultValue={initialData?.accountHolderName}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm" 
                placeholder="Name as in bank" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Default Currency</label>
              <select 
                name="defaultCurrency" 
                defaultValue={initialData?.defaultCurrency || "LKR"}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm"
              >
                <option value="LKR">LKR - Sri Lankan Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="SAR">SAR - Saudi Riyal</option>
                <option value="AED">AED - UAE Dirham</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Description / Purpose</label>
          <textarea 
            name="description" 
            rows={3}
            defaultValue={initialData?.description}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold text-slate-900 text-sm" 
            placeholder="Define the purpose of this committee..." 
          />
        </div>

        {isEdit && (
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Operational Status</label>
            <select 
              name="status" 
              defaultValue={initialData.status}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm uppercase tracking-wide"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        )}

        <button 
          disabled={isSubmitting} 
          type="submit" 
          className={`w-full py-5 ${isEdit ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"} text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex justify-center items-center gap-3 active:scale-95 shadow-xl mt-4`}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : isEdit ? "Update Committee Identity" : "Establish Committee"}
        </button>
      </form>
    </div>
  );
}
