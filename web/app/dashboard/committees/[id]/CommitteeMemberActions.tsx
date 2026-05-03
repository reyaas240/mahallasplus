"use client";
import { useState } from "react";
import { Shield, ShieldOff, Trash2, Loader2, Edit3, X, Calendar, CheckCircle2, UserMinus } from "lucide-react";
import { removeCommitteeMember, toggleMemberAccess, updateCommitteeMember } from "@/app/actions/committee";

export function CommitteeMemberActions({ member }: { member: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(member.status);

  const handleDelete = async () => {
    if (confirm(`Remove ${member.familyMember.fullName} from this committee?`)) {
      setIsDeleting(true);
      await removeCommitteeMember(member.id);
      setIsDeleting(false);
    }
  };

  const handleToggleAccess = async () => {
    setIsToggling(true);
    const res = await toggleMemberAccess(member.id);
    if (res && !res.success) alert(res.error);
    setIsToggling(false);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      role: formData.get("role") as string,
      status: selectedStatus,
      activeDateFrom: formData.get("activeDateFrom") as string,
      activeDateTo: formData.get("activeDateTo") as string,
    };
    
    const res = await updateCommitteeMember(member.id, data);
    setIsUpdating(false);
    if (res.success) {
      setIsEditing(false);
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => { setSelectedStatus(member.status); setIsEditing(true); }}
        className="p-2.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl hover:text-blue-600 hover:bg-blue-50 transition-all"
        title="Edit Member Details"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      <button 
        onClick={handleToggleAccess}
        disabled={isToggling}
        title={member.hasDashboardAccess ? "Revoke Access" : "Grant Dashboard Access"}
        className={`p-2.5 rounded-xl transition-all border ${
          member.hasDashboardAccess 
            ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
            : "bg-slate-50 text-slate-400 border-slate-100 hover:text-blue-600 hover:bg-blue-50"
        }`}
      >
        {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : member.hasDashboardAccess ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
      </button>
      
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden">
            <button onClick={() => setIsEditing(false)} className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-600 transition-all hover:bg-rose-50">
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Edit3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Update Membership</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{member.familyMember.fullName}</p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Committee Role</label>
                  <select 
                    name="role"
                    defaultValue={member.role}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm uppercase tracking-widest"
                  >
                    <option value="President">President</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Organizer">Organizer</option>
                    <option value="Member">Member</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Active From</label>
                  <input 
                    name="activeDateFrom"
                    type="date"
                    defaultValue={member.activeDateFrom ? new Date(member.activeDateFrom).toISOString().split('T')[0] : ''}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Active To</label>
                  <input 
                    name="activeDateTo"
                    type="date"
                    defaultValue={member.activeDateTo ? new Date(member.activeDateTo).toISOString().split('T')[0] : ''}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Operational Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setSelectedStatus('ACTIVE')}
                      className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${selectedStatus === 'ACTIVE' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-50 scale-105' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-emerald-200'}`}
                    >
                      <CheckCircle2 className={`w-5 h-5 ${selectedStatus === 'ACTIVE' ? 'text-emerald-500' : ''}`} />
                      <span className="font-black text-xs uppercase tracking-widest">Active</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setSelectedStatus('INACTIVE')}
                      className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${selectedStatus === 'INACTIVE' ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-lg shadow-rose-50 scale-105' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-rose-200'}`}
                    >
                      <UserMinus className={`w-5 h-5 ${selectedStatus === 'INACTIVE' ? 'text-rose-500' : ''}`} />
                      <span className="font-black text-xs uppercase tracking-widest">InActive</span>
                    </button>
                  </div>
                </div>
              </div>

              <button 
                disabled={isUpdating}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex justify-center items-center gap-3 shadow-xl shadow-blue-200 mt-4 active:scale-95"
              >
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Member Identity"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
