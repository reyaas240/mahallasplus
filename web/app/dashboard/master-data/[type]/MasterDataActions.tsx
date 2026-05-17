"use client";
import { useState } from "react";
import { Edit2, Trash2, Check, X, Loader2 } from "lucide-react";
import { updateGenericMasterData, deleteGenericMasterData } from "@/app/actions/master-data";

export function MasterDataActions({ item, type, parentKey, parentName, parents }: { 
  item: any, 
  type: string, 
  parentKey?: string, 
  parentName?: string, 
  parents?: { id: string, name: string }[] 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const [newParentId, setNewParentId] = useState(parentKey ? item[parentKey] || "" : "");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    const nameChanged = newName && newName !== item.name;
    const parentChanged = parentKey && newParentId && newParentId !== item[parentKey];

    if (!nameChanged && !parentChanged) {
      setIsEditing(false);
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", newName);
    if (parentKey && newParentId) {
      formData.append(parentKey, newParentId);
    }
    
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
      <div className="flex flex-col gap-2">
        {parentKey && parents && parents.length > 0 && (
          <select
            value={newParentId}
            onChange={(e) => setNewParentId(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-600 bg-white text-slate-900 font-medium"
          >
            <option value="">-- {parentName} --</option>
            {parents.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
        <div className="flex items-center gap-2">
          <input 
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium bg-white"
          />
          <button disabled={isLoading} onClick={handleUpdate} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </button>
          <button disabled={isLoading} onClick={() => { setIsEditing(false); setNewName(item.name); setNewParentId(parentKey ? item[parentKey] || "" : ""); }} className="p-1 text-slate-400 hover:bg-slate-50 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
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
