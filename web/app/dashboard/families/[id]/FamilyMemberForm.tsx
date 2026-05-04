"use client";
import { addFamilyMember } from "@/app/actions/family";
import { useState } from "react";
import { Loader2, UserPlus, AlertCircle } from "lucide-react";

export function FamilyMemberForm({ cardId, occupations }: { cardId: string, occupations: any[] }) {
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
    } else {
      setError(res.error || "Failed to add member");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-emerald-600" />
        </div>
        <h3 className="font-bold text-slate-900">Add Family Member</h3>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700 text-sm font-medium animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Title</label>
            <select required name="title" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900">
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Miss.">Miss.</option>
              <option value="Ms.">Ms.</option>
              <option value="Dr.">Dr.</option>
              <option value="Alhaj.">Alhaj.</option>
            </select>
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
            <input required name="fullName" type="text" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900" placeholder="Member Name" />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone No</label>
            <input name="phone" type="text" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900" placeholder="07XXXXXXXX" />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email (For Access)</label>
            <input name="email" type="email" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900" placeholder="Optional" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Date of Birth</label>
            <input required name="dob" type="date" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">NIC (ID Card)</label>
            <input name="nic" type="text" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900" placeholder="ID Number" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Relationship</label>
            <select required name="relationship" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900">
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
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Marital Status</label>
            <select required name="maritalStatus" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900">
              <option value="Married">Married</option>
              <option value="Single">Single</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6 py-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input name="isBreadwinner" type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Breadwinner</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input name="isStudent" type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Student</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Occupation / Job</label>
          <select name="occupation" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm font-bold text-slate-900">
            <option value="">-- Select Occupation --</option>
            {occupations.map(occ => (
              <option key={occ.id} value={occ.name}>{occ.name}</option>
            ))}
          </select>
        </div>

        <button disabled={isSubmitting} type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-lg font-black hover:bg-emerald-700 transition-all flex justify-center items-center gap-2 mt-4 active:scale-95 shadow-md shadow-emerald-200/50 uppercase tracking-wide text-sm">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Add to Family List</>}
        </button>
      </form>
    </div>
  );
}
