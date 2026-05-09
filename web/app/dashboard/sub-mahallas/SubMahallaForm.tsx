"use client";
import { createSubMahalla, updateSubMahalla } from "@/app/actions/main-admin";
import { getProxiedImageUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Loader2, Camera, Image as ImageIcon } from "lucide-react";

export function SubMahallaForm({ initialData, subAreas = [], onCancel }: { initialData?: any, subAreas?: any[], onCancel?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initialData?.coverImage || null);

  useEffect(() => {
    if (initialData) {
      setLogoPreview(initialData.logo);
      setCoverPreview(initialData.coverImage);
    } else {
      setLogoPreview(null);
      setCoverPreview(null);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const res = initialData 
      ? await updateSubMahalla(initialData.id, formData)
      : await createSubMahalla(formData);
      
    setIsSubmitting(false);
    
    if (res.success) {
      if (!initialData) form.reset();
      if (onCancel) onCancel();
    } else {
      alert(res.error);
    }
  };

  return (
    <div key={initialData?.id || 'new'} className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
          {initialData ? "Edit Sub Mahalla" : "Create Sub Mahalla"}
        </h3>
        {initialData && (
          <button onClick={onCancel} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Cancel</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Visual Identity */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Logo</label>
            <div className="relative group cursor-pointer h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 transition-all">
              {logoPreview ? (
                <img src={getProxiedImageUrl(logoPreview)} className="w-full h-full object-contain" alt="Logo" />
              ) : (
                <Camera className="w-6 h-6 text-slate-300" />
              )}
              <input 
                name="logo" 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setLogoPreview(URL.createObjectURL(file));
                }}
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cover Image</label>
            <div className="relative group cursor-pointer h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 transition-all">
              {coverPreview ? (
                <img src={getProxiedImageUrl(coverPreview)} className="w-full h-full object-cover" alt="Cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-300" />
              )}
              <input 
                name="coverImage" 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setCoverPreview(URL.createObjectURL(file));
                }}
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Sub Mahalla Name</label>
            <input 
              required 
              name="name" 
              type="text" 
              defaultValue={initialData?.name}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 font-black text-slate-900 text-sm uppercase tracking-wider" 
              placeholder="e.g. North Zone" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email</label>
              <input 
                name="email" 
                type="email" 
                defaultValue={initialData?.email}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 font-bold text-slate-900 text-xs" 
                placeholder="Official Email" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Sub Area / Locality</label>
              <select 
                name="area" 
                defaultValue={initialData?.area}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 font-black text-slate-900 text-[10px] uppercase cursor-pointer"
              >
                <option value="">Select Sub Area</option>
                {subAreas.map(sa => <option key={sa.id} value={sa.name}>{sa.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Physical Address</label>
            <input 
              name="address" 
              type="text" 
              defaultValue={initialData?.address}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 font-bold text-slate-900 text-xs" 
              placeholder="Full address details" 
            />
          </div>

          {initialData && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Status</label>
              <select 
                name="status" 
                defaultValue={initialData.status}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-600 font-black text-slate-900 text-[10px] uppercase cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          )}
        </div>

        <button 
          disabled={isSubmitting} 
          type="submit" 
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex justify-center items-center gap-2 shadow-xl active:scale-95"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? "Update Sub Mahalla" : "Create Sub Mahalla")}
        </button>
      </form>
    </div>
  );
}
