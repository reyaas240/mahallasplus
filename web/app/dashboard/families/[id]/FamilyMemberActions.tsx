"use client";
import { useState } from "react";
import { Edit3, Trash2, X, Loader2 } from "lucide-react";
import { deleteFamilyMember, updateFamilyMember } from "@/app/actions/family";

export function FamilyMemberActions({ member, occupations, grades = [], schools = [] }: { member: any, occupations: any[], grades?: any[], schools?: any[] }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStudent, setIsStudent] = useState(member.isStudent);

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
          onClick={() => { setIsEditing(true); setIsStudent(member.isStudent); }}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Edit Member: {member.fullName}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update household member profile</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="p-8 space-y-5">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Title</label>
                  <select defaultValue={member.title} name="title" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all">
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Miss.">Miss.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Alhaj.">Alhaj.</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                  <input required name="fullName" type="text" defaultValue={member.fullName} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Phone</label>
                  <input name="phone" type="text" defaultValue={member.phone || ""} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                  <input name="email" type="email" defaultValue={member.email || ""} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Date of Birth</label>
                  <input required name="dob" type="date" defaultValue={new Date(member.dob).toISOString().split('T')[0]} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">NIC (ID Card)</label>
                  <input name="nic" type="text" defaultValue={member.nic || ""} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Relationship</label>
                  <select defaultValue={member.relationship} name="relationship" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all">
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
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Marital Status</label>
                  <select defaultValue={member.maritalStatus} name="maritalStatus" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all">
                    <option value="Married">Married</option>
                    <option value="Single">Single</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Occupation</label>
                <select defaultValue={member.occupation || ""} name="occupation" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm transition-all">
                  <option value="">-- Select Occupation --</option>
                  {occupations.map(occ => (
                    <option key={occ.id} value={occ.name}>{occ.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-[24px] border border-slate-100 shadow-inner">
                <div className="flex items-center gap-8 px-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input name="isBreadwinner" type="checkbox" defaultChecked={member.isBreadwinner} className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Breadwinner</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input name="isStudent" type="checkbox" checked={isStudent} onChange={(e) => setIsStudent(e.target.checked)} className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Student</span>
                  </label>
                </div>

                {isStudent && (
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300 p-2 pt-0">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Grade</label>
                      <select defaultValue={member.grade || ""} name="grade" required={isStudent} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-xs shadow-sm">
                        <option value="">-- Select --</option>
                        {grades.map(g => (
                          <option key={g.id} value={g.name}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Institution</label>
                      <select defaultValue={member.school || ""} name="school" required={isStudent} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-xs shadow-sm">
                        <option value="">-- Select --</option>
                        {schools.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
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
