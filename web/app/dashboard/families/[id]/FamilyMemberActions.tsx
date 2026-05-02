"use client";
import { useState } from "react";
import { Edit3, Trash2, X, Loader2 } from "lucide-react";
import { deleteFamilyMember, updateFamilyMember } from "@/app/actions/family";

export function FamilyMemberActions({ member, occupations }: { member: any, occupations: any[] }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${member.fullName}?`)) {
      setIsDeleting(true);
      const res = await deleteFamilyMember(member.id);
      setIsDeleting(false);
      if (!res.success) alert(res.error);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const res = await updateFamilyMember(member.id, formData);
    setIsSubmitting(false);
    if (res.success) {
      setIsEditing(false);
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setIsEditing(true)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 uppercase tracking-wide">Edit Member: {member.fullName}</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Title</label>
                  <select defaultValue={member.title} name="title" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm">
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
                  <input required name="fullName" type="text" defaultValue={member.fullName} className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                  <input name="email" type="email" defaultValue={member.email || ""} className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Date of Birth</label>
                  <input required name="dob" type="date" defaultValue={new Date(member.dob).toISOString().split('T')[0]} className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">NIC (ID Card)</label>
                  <input name="nic" type="text" defaultValue={member.nic || ""} className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Relationship</label>
                  <select defaultValue={member.relationship} name="relationship" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm">
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
                  <select defaultValue={member.maritalStatus} name="maritalStatus" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm">
                    <option value="Married">Married</option>
                    <option value="Single">Single</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input name="isBreadwinner" type="checkbox" defaultChecked={member.isBreadwinner} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <span className="text-sm font-bold text-slate-700">Breadwinner</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input name="isStudent" type="checkbox" defaultChecked={member.isStudent} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <span className="text-sm font-bold text-slate-700">Student</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Occupation / Job</label>
                <select defaultValue={member.occupation || ""} name="occupation" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm">
                  <option value="">-- Select Occupation --</option>
                  {occupations.map(occ => (
                    <option key={occ.id} value={occ.name}>{occ.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all uppercase tracking-wide text-xs">Cancel</button>
                <button disabled={isSubmitting} type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-all flex justify-center items-center gap-2 active:scale-95 uppercase tracking-wide text-xs shadow-lg shadow-emerald-200">
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
