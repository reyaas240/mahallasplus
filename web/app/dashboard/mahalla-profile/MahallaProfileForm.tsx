"use client";

import { useState } from "react";
import { Save, Loader2, Plus, Building, Mail, Phone, MapPin, Globe } from "lucide-react";
import { updateMainMahalla } from "@/app/actions/mahalla";

export function MahallaProfileForm({ mahalla, masters }: { mahalla: any, masters: any }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [previewLogo, setPreviewLogo] = useState<string | null>(mahalla.logo);
  const [previewCover, setPreviewCover] = useState<string | null>(mahalla.coverImage);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Initialize selections if mahalla has names
  useState(() => {
    const country = masters.countries.find((c: any) => c.name === mahalla.country);
    if (country) setSelectedCountryId(country.id);
    
    const province = masters.provinces.find((p: any) => p.name === mahalla.province);
    if (province) setSelectedProvinceId(province.id);

    const district = masters.districts.find((d: any) => d.name === mahalla.district);
    if (district) setSelectedDistrictId(district.id);
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    formData.append("status", mahalla.status);
    
    const countryName = masters.countries.find((c: any) => c.id === selectedCountryId)?.name || "";
    const provinceName = masters.provinces.find((p: any) => p.id === selectedProvinceId)?.name || "";
    const districtName = masters.districts.find((d: any) => d.id === selectedDistrictId)?.name || "";
    
    formData.set("country", countryName);
    formData.set("province", provinceName);
    formData.set("district", districtName);
    
    const res = await updateMainMahalla(mahalla.id, formData);
    setIsUpdating(false);
    if (res.success) {
      setMessage({ type: "success", text: "Mahalla profile updated successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update" });
    }
  };

  const filteredProvinces = masters.provinces.filter((p: any) => p.countryId === selectedCountryId);
  const filteredDistricts = masters.districts.filter((d: any) => d.provinceId === selectedProvinceId);
  const filteredAreas = masters.areas.filter((a: any) => a.districtId === selectedDistrictId);

  return (
    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-10 relative group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="relative space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Mahalla Logo</label>
            <div className="relative group/logo">
              <input 
                name="logo" 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPreviewLogo(URL.createObjectURL(file));
                }}
              />
              <div className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 group-hover/logo:border-blue-400 transition-all overflow-hidden relative">
                {previewLogo ? (
                  <img src={previewLogo} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                      <Plus className="w-6 h-6 text-slate-300" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Logo</span>
                  </>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="text-white font-black text-[10px] uppercase tracking-widest">Click to change</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Cover Image</label>
            <div className="relative group/cover">
              <input 
                name="coverImage" 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPreviewCover(URL.createObjectURL(file));
                }}
              />
              <div className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 group-hover/cover:border-blue-400 transition-all overflow-hidden relative">
                {previewCover ? (
                  <img src={previewCover} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                      <Plus className="w-6 h-6 text-slate-300" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Cover</span>
                  </>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="text-white font-black text-[10px] uppercase tracking-widest">Click to change</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] px-1">Core Identity</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Mahalla Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Building className="w-4 h-4" /></div>
                <input name="name" defaultValue={mahalla.name} required className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-slate-900 text-sm uppercase tracking-widest focus:bg-white focus:border-blue-600 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Official Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail className="w-4 h-4" /></div>
                <input name="email" type="email" defaultValue={mahalla.email} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Contact Phone</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone className="w-4 h-4" /></div>
                <input name="phone" defaultValue={mahalla.phone} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] px-1">Location Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Full Physical Address</label>
              <div className="relative">
                <div className="absolute left-4 top-6 text-slate-400"><MapPin className="w-4 h-4" /></div>
                <textarea name="address" defaultValue={mahalla.address} rows={3} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Country</label>
              <select 
                value={selectedCountryId}
                onChange={(e) => { setSelectedCountryId(e.target.value); setSelectedProvinceId(""); setSelectedDistrictId(""); }}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-slate-900 text-xs uppercase tracking-widest focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none"
              >
                <option value="">Select Country</option>
                {masters.countries.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Province / State</label>
              <select 
                value={selectedProvinceId}
                disabled={!selectedCountryId}
                onChange={(e) => { setSelectedProvinceId(e.target.value); setSelectedDistrictId(""); }}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-slate-900 text-xs uppercase tracking-widest focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none disabled:opacity-50"
              >
                <option value="">Select Province</option>
                {filteredProvinces.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">District</label>
              <select 
                value={selectedDistrictId}
                disabled={!selectedProvinceId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-slate-900 text-xs uppercase tracking-widest focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none disabled:opacity-50"
              >
                <option value="">Select District</option>
                {filteredDistricts.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Area / City</label>
              <select 
                name="area"
                defaultValue={mahalla.area}
                disabled={!selectedDistrictId}
                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-slate-900 text-xs uppercase tracking-widest focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none disabled:opacity-50"
              >
                <option value="">Select Area</option>
                {filteredAreas.map((a: any) => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100">
          <div className="flex-1">
             {message.text && (
               <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                 {message.type === 'success' ? <Globe className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                 {message.text}
               </div>
             )}
          </div>
          <button 
            disabled={isUpdating}
            className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-100 active:scale-95 disabled:opacity-50"
          >
            {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Mahalla Profile
          </button>
        </div>
      </div>
    </form>
  );
}
