"use client";
import { useState } from "react";
import { Edit2, Trash2, Check, X, Loader2 } from "lucide-react";
import { updateGenericMasterData, deleteGenericMasterData } from "@/app/actions/master-data";

export function MasterDataActions({ item, type }: { item: any, type: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!newName || newName === item.name) {
      setIsEditing(false);
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", newName);
    
    const res = await updateGenericMasterData(type, item.id, formData);
    setIsLoading(false);
    
    if (res.success) {
      setIsEditing(false);
      window.location.reload();
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;
    
    setIsLoading(true);
    const res = await deleteGenericMasterData(type, item.id);
    setIsLoading(false);
    
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input 
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="px-2 py-1 text-sm border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button disabled={isLoading} onClick={handleUpdate} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </button>
        <button disabled={isLoading} onClick={() => setIsEditing(false)} className="p-1 text-slate-400 hover:bg-slate-50 rounded-md">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button 
        onClick={() => setIsEditing(true)}
        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Edit"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button 
        onClick={handleDelete}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
