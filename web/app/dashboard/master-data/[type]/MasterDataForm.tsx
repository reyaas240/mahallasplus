"use client";
import { createGenericMasterData } from "@/app/actions/master-data";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function MasterDataForm({ type, singularName, parentKey, parentName, parents }: { type: string, singularName: string, parentKey?: string, parentName?: string, parents?: { id: string, name: string }[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const res = await createGenericMasterData(type, formData);
    setIsSubmitting(false);
    
    if (res.success) {
      form.reset();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="font-bold text-slate-900 mb-4">Add New {singularName}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {parentKey && parents && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select {parentName}</label>
            <select required name={parentKey} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600">
              <option value="">-- Select {parentName} --</option>
              {parents.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{singularName} Name</label>
          <input required name="name" type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" placeholder={`e.g. New ${singularName}`} />
        </div>
        <button disabled={isSubmitting} type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex justify-center items-center">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : `Add ${singularName}`}
        </button>
      </form>
    </div>
  );
}
