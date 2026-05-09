"use client";
import { useState } from "react";
import { Plus, X, Loader2, Edit2, Check } from "lucide-react";
import { createGenericMasterData, deleteGenericMasterData, updateGenericMasterData } from "@/app/actions/master-data";

export function SubAreaManager({ areaId, initialSubAreas }: { areaId: string, initialSubAreas: any[] }) {
  const [subAreas, setSubAreas] = useState(initialSubAreas);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", newName);
    formData.append("areaId", areaId);
    
    const res = await createGenericMasterData("sub-areas", formData);
    setIsSubmitting(false);
    
    if (res.success) {
      setNewName("");
      setIsAdding(false);
      window.location.reload();
    } else {
      alert(res.error);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", editName);
    const res = await updateGenericMasterData("sub-areas", id, formData);
    setIsSubmitting(false);
    if (res.success) {
      setSubAreas(subAreas.map(sa => sa.id === id ? { ...sa, name: editName } : sa));
      setEditingId(null);
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sub-area?")) return;
    const res = await deleteGenericMasterData("sub-areas", id);
    if (res.success) {
      setSubAreas(subAreas.filter(sa => sa.id !== id));
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {subAreas.map((sa) => (
          <div key={sa.id} className="group relative">
            {editingId === sa.id ? (
              <div className="flex items-center gap-1 bg-white border border-blue-200 rounded-md p-0.5 shadow-sm">
                <input 
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-1.5 py-0.5 text-[10px] font-bold text-slate-900 outline-none w-20"
                />
                <button onClick={() => handleUpdate(sa.id)} className="text-emerald-600 hover:text-emerald-700">
                  <Check className="w-3 h-3" />
                </button>
                <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <span className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-700 rounded-md text-[10px] font-black uppercase tracking-wider border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-default">
                {sa.name}
                <div className="hidden group-hover:flex items-center gap-1 border-l border-slate-200 pl-1.5 ml-0.5">
                  <button 
                    onClick={() => { setEditingId(sa.id); setEditName(sa.name); }}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(sa.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              </span>
            )}
          </div>
        ))}
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-blue-600 rounded-md text-[10px] font-black uppercase tracking-wider border border-blue-200 border-dashed hover:border-blue-400 hover:bg-blue-50 transition-all shadow-sm"
          >
            <Plus className="w-2.5 h-2.5" /> Add Sub
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <input 
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-grow px-3 py-2 text-xs bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-blue-600 font-bold text-slate-900 placeholder:text-slate-400 transition-all"
            placeholder="New Sub Area Name..."
          />
          <button disabled={isSubmitting} type="submit" className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md active:scale-95">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
          <button type="button" onClick={() => setIsAdding(false)} className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all">
            <X className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
