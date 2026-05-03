"use client";
import { useState } from "react";
import { Edit3, X, Loader2, Save, Power, CheckCircle2, AlertTriangle, Calendar } from "lucide-react";
import { updateMainMahalla } from "@/app/actions/mahalla";

export function MainMahallaActions({ mahalla, masters }: { mahalla: any, masters: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(mahalla.status);
  
  // Dependent Selection States
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  // Initialize selections if mahalla has data
  const handleOpen = () => {
    const country = masters.countries.find((c: any) => c.name === mahalla.country);
    if (country) setSelectedCountryId(country.id);
    
    const province = masters.provinces.find((p: any) => p.name === mahalla.province);
    if (province) setSelectedProvinceId(province.id);

    const district = masters.districts.find((d: any) => d.name === mahalla.district);
    if (district) setSelectedDistrictId(district.id);

    setSelectedStatus(mahalla.status);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    formData.append("status", selectedStatus);
    
    // Ensure we send names, not IDs, as per existing schema structure
    const countryName = masters.countries.find((c: any) => c.id === selectedCountryId)?.name || "";
    const provinceName = masters.provinces.find((p: any) => p.id === selectedProvinceId)?.name || "";
    const districtName = masters.districts.find((d: any) => d.id === selectedDistrictId)?.name || "";
    
    formData.set("country", countryName);
    formData.set("province", provinceName);
    formData.set("district", districtName);
    
    const res = await updateMainMahalla(mahalla.id, formData);
    setIsUpdating(false);
    if (res.success) {
      setIsEditing(false);
    } else {
      alert(res.error);
    }
  };

  const filteredProvinces = masters.provinces.filter((p: any) => p.countryId === selectedCountryId);
  const filteredDistricts = masters.districts.filter((d: any) => d.provinceId === selectedProvinceId);
  const filteredAreas = masters.areas.filter((a: any) => a.districtId === selectedDistrictId);

  return (
    <>
      <button 
        onClick={handleOpen}
        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        title="Edit Mahalla"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] p-10 max-w-xl w-full shadow-2xl relative overflow-hidden">
            <button onClick={() => setIsEditing(false)} className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-600 transition-all hover:bg-rose-50">
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-100">
                <Edit3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Update Mahalla</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{mahalla.name}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-8">
                {/* Basic Identity */}
                <div className="space-y-5">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] px-1 text-left">Basic Identity</h4>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 text-left">Mahalla Name</label>
                      <input name="name" defaultValue={mahalla.name} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm uppercase tracking-widest text-left" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 text-left">Official Email</label>
                      <input name="email" type="email" defaultValue={mahalla.email} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs text-left" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 text-left">Global Currency</label>
                      <input name="defaultCurrency" defaultValue={mahalla.defaultCurrency} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-900 text-xs uppercase tracking-widest text-left" />
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="space-y-5">
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] px-1 text-left">Physical Location</h4>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 text-left">Full Address</label>
                      <textarea name="address" defaultValue={mahalla.address} rows={2} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs resize-none text-left" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 text-left">Country</label>
                      <select 
                        value={selectedCountryId}
                        onChange={(e) => { setSelectedCountryId(e.target.value); setSelectedProvinceId(""); setSelectedDistrictId(""); }}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs"
                      >
                        <option value="">Select Country</option>
                        {masters.countries.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 text-left">Province / State</label>
                      <select 
                        value={selectedProvinceId}
                        disabled={!selectedCountryId}
                        onChange={(e) => { setSelectedProvinceId(e.target.value); setSelectedDistrictId(""); }}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs disabled:opacity-50"
                      >
                        <option value="">Select Province</option>
                        {filteredProvinces.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 text-left">District</label>
                      <select 
                        value={selectedDistrictId}
                        disabled={!selectedProvinceId}
                        onChange={(e) => setSelectedDistrictId(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs disabled:opacity-50"
                      >
                        <option value="">Select District</option>
                        {filteredDistricts.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 text-left">Area / City</label>
                      <select 
                        name="area"
                        defaultValue={mahalla.area}
                        disabled={!selectedDistrictId}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs disabled:opacity-50"
                      >
                        <option value="">Select Area</option>
                        {filteredAreas.map((a: any) => <option key={a.id} value={a.name}>{a.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Operating Status */}
                <div className="space-y-5">
                  <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] px-1 text-left">Platform Status</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setSelectedStatus('ACTIVE')}
                      className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${selectedStatus === 'ACTIVE' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-50 scale-105' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-emerald-200'}`}
                    >
                      <CheckCircle2 className={`w-5 h-5 ${selectedStatus === 'ACTIVE' ? 'text-emerald-500' : ''}`} />
                      <div className="text-left">
                        <span className="font-black text-xs uppercase tracking-widest block">Activate</span>
                        {mahalla.activatedDate && <span className="text-[8px] font-bold opacity-60">Since {new Date(mahalla.activatedDate).toLocaleDateString()}</span>}
                      </div>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSelectedStatus('INACTIVE')}
                      className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${selectedStatus === 'INACTIVE' ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-lg shadow-rose-50 scale-105' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-rose-200'}`}
                    >
                      <Power className={`w-5 h-5 ${selectedStatus === 'INACTIVE' ? 'text-rose-500' : ''}`} />
                      <div className="text-left">
                        <span className="font-black text-xs uppercase tracking-widest block">Deactivate</span>
                        {mahalla.deactivatedDate && <span className="text-[8px] font-bold opacity-60">Since {new Date(mahalla.deactivatedDate).toLocaleDateString()}</span>}
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-left">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed text-left">
                    Deactivating this Mahalla will restrict access for all associated Main Admins and Sub Admins.
                  </p>
                </div>
              </div>

              <button 
                disabled={isUpdating}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex justify-center items-center gap-3 shadow-xl shadow-slate-100 mt-4 sticky bottom-0"
              >
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Mahalla Changes</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
