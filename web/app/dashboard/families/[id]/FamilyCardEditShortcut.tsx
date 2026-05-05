"use client";
import { useState } from "react";
import { Edit3, X, Loader2, Image as ImageIcon, CreditCard } from "lucide-react";
import { updateFamilyCard } from "@/app/actions/family";

export function FamilyCardEditShortcut({ family, subMahallas }: { family: any, subMahallas: any[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const res = await updateFamilyCard(family.id, formData);
    setIsSubmitting(false);
    if (res.success) {
      setIsEditing(false);
      setPreviews([]);
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsEditing(true)}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all group relative z-10"
        title="Edit Family Card"
      >
        <Edit3 className="w-4 h-4 text-slate-300 group-hover:text-white" />
      </button>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Edit Family Card</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update household info</p>
                </div>
              </div>
              <button onClick={() => { setIsEditing(false); setPreviews([]); }} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-left">Living Type</label>
                  <select 
                    required 
                    name="livingType" 
                    defaultValue={family.livingType}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all"
                  >
                    <option value="OWN_HOUSE">Own House</option>
                    <option value="RENTED">Rented</option>
                    <option value="MONTHLY_SUBSCRIPTION_MAIN">Monthly Subscription (Main)</option>
                    <option value="MONTHLY_SUBSCRIPTION_SUB">Monthly Subscription (Sub)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-left">Main Card No</label>
                  <input 
                    name="mainMahallaCardNo" 
                    type="text" 
                    defaultValue={family.mainMahallaCardNo}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-left">Sub Card No</label>
                  <input 
                    name="subMahallaCardNo" 
                    type="text" 
                    defaultValue={family.subMahallaCardNo}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-left">Residential Address</label>
                <textarea 
                  name="address" 
                  required 
                  rows={3}
                  defaultValue={family.address}
                  placeholder="Full street address..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-left">Living From Date</label>
                <input 
                  name="livingFromDate" 
                  type="date" 
                  defaultValue={family.livingFromDate ? new Date(family.livingFromDate).toISOString().split('T')[0] : ""}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1 text-left">Images & Documents</label>
                <div className="space-y-4">
                  {/* Existing Attachments */}
                  {family.attachments && family.attachments.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {family.attachments.map((path: string, i: number) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-blue-100 bg-blue-50/30 group">
                          {path.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img src={path} className="w-full h-full object-cover" alt="Existing" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-[8px] font-black text-blue-500 uppercase">Doc</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] font-black text-blue-600 bg-white px-1.5 py-0.5 rounded shadow-sm uppercase">Current</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Upload Label */}
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group">
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors mb-1" />
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Add more files</p>
                    </div>
                    <input name="attachments" type="file" multiple className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
                  </label>

                  {/* New Previews */}
                  {previews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {previews.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-emerald-200 bg-emerald-50/30">
                          <img src={url} className="w-full h-full object-cover" alt="Preview" />
                          <div className="absolute top-1 right-1">
                            <span className="text-[6px] font-black text-white bg-emerald-500 px-1 py-0.5 rounded shadow-sm uppercase">New</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setIsEditing(false); setPreviews([]); }}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all uppercase tracking-[0.2em] text-[10px]"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all flex justify-center items-center gap-2 active:scale-95 uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-blue-100"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
