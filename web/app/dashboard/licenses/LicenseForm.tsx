"use client";
import { useState } from "react";
import { createLicensePlan, updateLicensePlan } from "@/app/actions/licensePlans";
import { Loader2, ShieldCheck, Tag, Info, ListChecks, DollarSign, Calendar } from "lucide-react";

export function LicenseForm({ initialData, onComplete }: { initialData?: any, onComplete?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaleActive, setIsSaleActive] = useState(initialData?.isSaleActive || false);
  const [featureConfig, setFeatureConfig] = useState<Record<string, any>>(initialData?.featureConfig || {
    MAX_SUB_MAHALLAS: 5,
    ALLOW_COMMITTEE_OVERSIGHT: false,
    ALLOW_FUND_DISTRIBUTION: false,
    ALLOW_DONOR_REGISTRY: false,
    ALLOW_ANALYTICS: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    formData.append("isSaleActive", isSaleActive.toString());
    formData.append("featureConfig", JSON.stringify(featureConfig));

    let res;
    if (initialData) {
      res = await updateLicensePlan(initialData.id, formData);
    } else {
      res = await createLicensePlan(formData);
    }
    
    setIsSubmitting(false);
    
    if (res.success) {
      if (onComplete) onComplete();
    } else {
      alert(res.error);
    }
  };

  const isEdit = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Plan Identity</h4>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Plan Name</label>
            <input 
              required 
              name="name" 
              defaultValue={initialData?.name}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm uppercase tracking-wide" 
              placeholder="e.g. Professional Plan" 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Short Description</label>
            <textarea 
              name="description" 
              defaultValue={initialData?.description}
              rows={2}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold text-slate-900 text-sm resize-none" 
              placeholder="Brief summary of the plan's purpose..." 
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-blue-600" />
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Billing & Pricing</h4>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Plan Type</label>
            <select 
              name="type" 
              defaultValue={initialData?.type || "MONTHLY"}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm uppercase"
            >
              <option value="MONTHLY">Monthly Billing</option>
              <option value="ANNUALLY">Annual Billing</option>
              <option value="LIFETIME">Lifetime Access</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Base Price (LKR)</label>
            <input 
              required 
              name="basePrice" 
              type="number" 
              step="0.01"
              defaultValue={initialData?.basePrice}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm" 
              placeholder="0.00" 
            />
          </div>

          <div className="col-span-2">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-[32px] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSaleActive ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-slate-900 uppercase tracking-widest">Sale Promotion</span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Activate discounted pricing</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsSaleActive(!isSaleActive)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isSaleActive ? 'bg-rose-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isSaleActive ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {isSaleActive && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 pt-2 border-t border-slate-200">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Sale Price (LKR)</label>
                  <input 
                    required={isSaleActive}
                    name="salePrice" 
                    type="number" 
                    step="0.01"
                    defaultValue={initialData?.salePrice}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 transition-all font-black text-rose-600 text-sm" 
                    placeholder="Discounted Amount" 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <ListChecks className="w-4 h-4 text-blue-600" />
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Feature Entitlements</h4>
        </div>
        
        <div className="bg-slate-50 border border-slate-200 rounded-[32px] p-8 space-y-6">
          {/* Max Sub Mahallas */}
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-black text-slate-900 uppercase tracking-widest">Max Sub-Mahallas</span>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Numeric limit for expansion</p>
            </div>
            <input 
              type="number"
              value={featureConfig.MAX_SUB_MAHALLAS}
              onChange={(e) => setFeatureConfig({ ...featureConfig, MAX_SUB_MAHALLAS: parseInt(e.target.value) || 0 })}
              className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-slate-900 text-center"
            />
          </div>

          <div className="h-px bg-slate-200" />

          {/* Boolean Toggles */}
          {[
            { key: "ALLOW_COMMITTEE_OVERSIGHT", label: "Committee Oversight", desc: "Main Mahalla view of sub-committees" },
            { key: "ALLOW_FUND_DISTRIBUTION", label: "Fund Distribution", desc: "Zakat and charity management modules" },
            { key: "ALLOW_DONOR_REGISTRY", label: "Donor Registry", desc: "Central donor tracking system" },
            { key: "ALLOW_ANALYTICS", label: "Advanced Analytics", desc: "Financial reporting and trends" }
          ].map((feat) => (
            <div key={feat.key} className="flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-black text-slate-900 uppercase tracking-widest">{feat.label}</span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{feat.desc}</p>
              </div>
              <button 
                type="button"
                onClick={() => setFeatureConfig({ ...featureConfig, [feat.key]: !featureConfig[feat.key] })}
                className={`w-10 h-5 rounded-full transition-all relative ${featureConfig[feat.key] ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${featureConfig[feat.key] ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Display Features (Comma Separated)</label>
          <textarea 
            required
            name="features" 
            defaultValue={initialData?.features?.join(", ")}
            rows={2}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold text-slate-900 text-sm" 
            placeholder="e.g. Unlimited Families, Custom Reports..." 
          />
        </div>
      </div>

      <button 
        disabled={isSubmitting} 
        type="submit" 
        className={`w-full py-5 ${isEdit ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"} text-white rounded-[24px] font-black uppercase tracking-widest text-xs transition-all flex justify-center items-center gap-3 active:scale-95 shadow-xl mt-4`}
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : isEdit ? "Update Plan Identity" : "Establish License Plan"}
      </button>
    </form>
  );
}
