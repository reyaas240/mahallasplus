"use client";
import { addFamilyMember } from "@/app/actions/family";
import { useState } from "react";
import { Loader2, UserPlus, AlertCircle, X, Users } from "lucide-react";

export function FamilyMemberForm({ cardId, occupations }: { cardId: string, occupations: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const res = await addFamilyMember(cardId, formData);
    setIsSubmitting(false);
    
    if (res.success) {
      form.reset();
      setIsOpen(false);
    } else {
      setError(res.error || "Failed to add member");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
      >
        <UserPlus className="w-4 h-4" /> Add Member
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Add Family Member</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Register a new person to this household</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-left">Title</label>
                  <select required name="title" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all">
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Miss.">Miss.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Alhaj.">Alhaj.</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-left">Full Name</label>
                  <input required name="fullName" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all" placeholder="Enter full name" />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-left">Phone No</label>
                  <input name="phone" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all" placeholder="07XXXXXXXX" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-left">Date of Birth</label>
                  <input required name="dob" type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-left">NIC (ID Card)</label>
                  <input name="nic" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all" placeholder="ID Number" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-left">Email Address</label>
                  <input name="email" type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all" placeholder="Optional" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-left">Relationship</label>
                  <select required name="relationship" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all">
                    <option value="Head">Family Head</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-left">Marital Status</label>
                  <select required name="maritalStatus" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all">
                    <option value="Married">Married</option>
                    <option value="Single">Single</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1 text-left">Occupation</label>
                  <select name="occupation" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all">
                    <option value="">-- Select Occupation --</option>
                    {occupations.map(occ => (
                      <option key={occ.id} value={occ.name}>{occ.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-8 px-2 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input name="isBreadwinner" type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all" />
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest group-hover:text-blue-600">Breadwinner</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input name="isStudent" type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all" />
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest group-hover:text-blue-600">Student</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-200 transition-all"
                >
                  Discard
                </button>
                <button 
                  disabled={isSubmitting} 
                  type="submit" 
                  className="flex-2 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
