"use client";
import { useState } from "react";
import { Pencil, Trash2, X, Loader2 } from "lucide-react";
import { updateUser, deleteUser } from "@/app/actions/main-admin";

export function UserTableActions({ user, subMahallas }: { user: any, subMahallas: any[] }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [role, setRole] = useState(user.role);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    setIsDeleting(true);
    const res = await deleteUser(user.id);
    if (!res.success) {
      alert(res.error);
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData(e.target as HTMLFormElement);
    formData.append("role", role);
    
    const res = await updateUser(user.id, formData);
    setIsUpdating(false);
    if (res.success) {
      setIsEditOpen(false);
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button 
          onClick={() => setIsEditOpen(true)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
          title="Delete"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Edit User Account</h3>
              <button onClick={() => setIsEditOpen(false)} className="p-2 text-slate-600 rounded-xl hover:text-rose-600 transition-all border border-slate-100 shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Account Role</label>
                <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
                  <button 
                    type="button" 
                    onClick={() => setRole('SUB_ADMIN')}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${role === 'SUB_ADMIN' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Sub Admin
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRole('MAIN_STAFF')}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${role === 'MAIN_STAFF' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Mahalla Staff
                  </button>
                </div>
              </div>

              {role === 'SUB_ADMIN' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Assign to Sub Mahalla</label>
                  <select required name="subMahallaId" defaultValue={user.subMahallaId} className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm">
                    <option value="">-- Select Sub Mahalla --</option>
                    {subMahallas.map(sm => (
                      <option key={sm.id} value={sm.id}>{sm.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Full Name</label>
                <input required name="name" type="text" defaultValue={user.name || ""} className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Email (Login ID)</label>
                <input required name="email" type="email" defaultValue={user.email || ""} className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">New Password (leave blank to keep current)</label>
                <input name="password" type="password" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900 text-sm" placeholder="••••••••" />
              </div>

              <button disabled={isUpdating} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-black transition-all flex justify-center items-center gap-3 shadow-xl">
                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
