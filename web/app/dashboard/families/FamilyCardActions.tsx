"use client";
import { useState } from "react";
import { Edit3, Trash2, X, Loader2 } from "lucide-react";
import { deleteFamilyCard, updateFamilyCard } from "@/app/actions/family";

export function FamilyCardActions({ family }: { family: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this family card? All members will also be deleted.")) {
      setIsDeleting(true);
      const res = await deleteFamilyCard(family.id);
      setIsDeleting(false);
      if (!res.success) alert(res.error);
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
          title="Edit Card"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
          title="Delete Card"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 uppercase tracking-wide">Edit Family Card</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Living Type</label>
                <select 
                  required 
                  name="livingType" 
                  defaultValue={family.livingType}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900"
                >
                  <option value="OWN_HOUSE">Own House</option>
                  <option value="RENTED">Rented</option>
                  <option value="MONTHLY_SUBSCRIPTION_MAIN">Monthly Subscription (Main)</option>
                  <option value="MONTHLY_SUBSCRIPTION_SUB">Monthly Subscription (Sub)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Main Card No</label>
                  <input 
                    name="mainMahallaCardNo" 
                    type="text" 
                    defaultValue={family.mainMahallaCardNo}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Sub Card No</label>
                  <input 
                    name="subMahallaCardNo" 
                    type="text" 
                    defaultValue={family.subMahallaCardNo}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Living From Date</label>
                <input 
                  name="livingFromDate" 
                  type="date" 
                  defaultValue={family.livingFromDate ? new Date(family.livingFromDate).toISOString().split('T')[0] : ""}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900" 
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all uppercase tracking-wide text-xs"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all flex justify-center items-center gap-2 active:scale-95 uppercase tracking-wide text-xs shadow-lg shadow-blue-200"
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
