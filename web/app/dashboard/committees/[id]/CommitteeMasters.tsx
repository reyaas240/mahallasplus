"use client";
import { useState, useEffect } from "react";
import { Loader2, Plus, X, Trash2, FolderOpen, LayoutGrid, Tag, Pencil, Check, Star, Eye, EyeOff } from "lucide-react";
import {
  getRequestCategories, createRequestCategory, deleteRequestCategory, updateRequestCategory,
  getProjectMasters, createProjectMaster, deleteProjectMaster, updateProjectMaster, updateProjectMasterStatus
} from "@/app/actions/masters";

export function CommitteeMasters({ committeeId, isReadOnly }: { committeeId: string, isReadOnly?: boolean }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Category form
  const [newCatName, setNewCatName] = useState("");
  const [catSubmitting, setCatSubmitting] = useState(false);
  const [catError, setCatError] = useState("");

  // Project form
  const [newProjName, setNewProjName] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [projSubmitting, setProjSubmitting] = useState(false);
  const [projError, setProjError] = useState("");

  // Edit states
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [editProjName, setEditProjName] = useState("");
  const [editProjDesc, setEditProjDesc] = useState("");

  const fetchAll = async () => {
    setIsLoading(true);
    const [cats, projs] = await Promise.all([
      getRequestCategories(committeeId),
      getProjectMasters(committeeId),
    ]);
    setCategories(cats);
    setProjects(projs);
    setIsLoading(false);
  };

  useEffect(() => { fetchAll(); }, [committeeId]);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setCatSubmitting(true);
    setCatError("");
    const res = await createRequestCategory(committeeId, newCatName);
    if (res.success) {
      setNewCatName("");
      await fetchAll();
    } else {
      setCatError(res.error || "Failed");
    }
    setCatSubmitting(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await deleteRequestCategory(id, committeeId);
    await fetchAll();
  };

  const handleAddProject = async () => {
    if (!newProjName.trim()) return;
    setProjSubmitting(true);
    setProjError("");
    const res = await createProjectMaster(committeeId, newProjName, newProjDesc);
    if (res.success) {
      setNewProjName("");
      setNewProjDesc("");
      await fetchAll();
    } else {
      setProjError(res.error || "Failed");
    }
    setProjSubmitting(false);
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await deleteProjectMaster(id, committeeId);
    await fetchAll();
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCatName.trim()) return;
    const res = await updateRequestCategory(id, committeeId, editCatName);
    if (res.success) {
      setEditingCatId(null);
      await fetchAll();
    } else {
      alert(res.error || "Failed to update category.");
    }
  };

  const handleUpdateProject = async (id: string) => {
    if (!editProjName.trim()) return;
    const res = await updateProjectMaster(id, committeeId, editProjName, editProjDesc);
    if (res.success) {
      setEditingProjId(null);
      await fetchAll();
    } else {
      alert(res.error || "Failed to update project.");
    }
  };

  const handleToggleProjectStatus = async (id: string, currentActive: boolean) => {
    const res = await updateProjectMasterStatus(id, committeeId, { isActive: !currentActive });
    if (res.success) await fetchAll();
    else alert(res.error || "Failed to update status");
  };

  const handleSetProjectDefault = async (id: string) => {
    const res = await updateProjectMasterStatus(id, committeeId, { isDefault: true });
    if (res.success) await fetchAll();
    else alert(res.error || "Failed to set default");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Request Categories */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Request Categories</h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Used for fund request purpose</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Add Form */}
          {!isReadOnly && (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 font-bold text-slate-900 text-xs transition-all placeholder:text-slate-400"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={catSubmitting || !newCatName.trim()}
                  className="px-4 py-2.5 bg-violet-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-violet-700 transition-all active:scale-95 shadow-lg shadow-violet-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {catSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Add
                </button>
              </div>
              {catError && <p className="text-[10px] font-bold text-rose-600 px-1">{catError}</p>}
            </>
          )}

          {/* List */}
          <div className="space-y-1.5 max-h-[320px] overflow-y-auto custom-scrollbar">
            {categories.length === 0 ? (
              <div className="py-10 text-center">
                <Tag className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No categories yet</p>
              </div>
            ) : (
              categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100 group hover:bg-violet-50/50 hover:border-violet-100 transition-all">
                  {editingCatId === c.id ? (
                    <div className="flex items-center gap-2 w-full pr-2">
                      <div className="w-2 h-2 bg-violet-500 rounded-full shrink-0" />
                      <input
                        type="text"
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdateCategory(c.id)}
                        autoFocus
                        className="flex-1 px-2 py-1 bg-white border border-violet-200 rounded text-xs font-black text-slate-800 uppercase outline-none focus:ring-1 focus:ring-violet-500"
                      />
                      <button
                        onClick={() => handleUpdateCategory(c.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingCatId(null)}
                        className="p-1 text-slate-400 hover:bg-slate-200 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-violet-500 rounded-full shrink-0" />
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wide">{c.name}</span>
                      </div>
                      {!isReadOnly && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => {
                              setEditingCatId(c.id);
                              setEditCatName(c.name);
                            }}
                            className="p-1.5 text-slate-300 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Project Masters */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm">Project Master</h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Used for fund request project selection</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Add Form */}
          {!isReadOnly && (
            <>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Project name..."
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-900 text-xs transition-all placeholder:text-slate-400"
                  />
                  <button
                    onClick={handleAddProject}
                    disabled={projSubmitting || !newProjName.trim()}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {projSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Add
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 text-[11px] transition-all placeholder:text-slate-400"
                />
              </div>
              {projError && <p className="text-[10px] font-bold text-rose-600 px-1">{projError}</p>}
            </>
          )}

          {/* List */}
          <div className="space-y-1.5 max-h-[320px] overflow-y-auto custom-scrollbar">
            {projects.length === 0 ? (
              <div className="py-10 text-center">
                <FolderOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No projects yet</p>
              </div>
            ) : (
              projects.map((p) => (
                <div key={p.id} className="flex items-start justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100 group hover:bg-blue-50/50 hover:border-blue-100 transition-all">
                  {editingProjId === p.id ? (
                    <div className="flex flex-col gap-2 w-full pr-2">
                      <input
                        type="text"
                        value={editProjName}
                        onChange={(e) => setEditProjName(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-blue-200 rounded text-xs font-black text-slate-800 uppercase outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={editProjDesc}
                        onChange={(e) => setEditProjDesc(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full px-2 py-1 bg-white border border-blue-200 rounded text-[10px] font-medium text-slate-600 outline-none focus:ring-1 focus:ring-blue-500"
                        onKeyDown={(e) => e.key === "Enter" && handleUpdateProject(p.id)}
                      />
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleUpdateProject(p.id)}
                          className="px-3 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingProjId(null)}
                          className="px-3 py-1 bg-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 self-start ${p.isActive ? 'bg-blue-500' : 'bg-slate-300'}`} />
                        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-black uppercase tracking-wide block truncate ${p.isActive ? 'text-slate-800' : 'text-slate-400 line-through'}`}>{p.name}</span>
                            {p.isDefault && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-amber-500" /> Default
                              </span>
                            )}
                            {!p.isActive && (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest">
                                Inactive
                              </span>
                            )}
                          </div>
                          {p.description && (
                            <span className={`text-[9px] font-medium block truncate mt-0.5 ${p.isActive ? 'text-slate-400' : 'text-slate-300'}`}>{p.description}</span>
                          )}
                        </div>
                      </div>
                      {!isReadOnly && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-4">
                          <button
                            onClick={() => handleSetProjectDefault(p.id)}
                            disabled={p.isDefault || !p.isActive}
                            className={`p-1.5 rounded-lg transition-all ${p.isDefault || !p.isActive ? 'text-slate-300 opacity-50 cursor-not-allowed' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                            title="Set as Default"
                          >
                            <Star className={`w-3.5 h-3.5 ${p.isDefault ? 'fill-amber-400 text-amber-400 opacity-100' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleToggleProjectStatus(p.id, p.isActive)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title={p.isActive ? "Mark Inactive" : "Mark Active"}
                          >
                            {p.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <div className="w-px h-4 bg-slate-200 mx-1" />
                          <button
                            onClick={() => {
                              setEditingProjId(p.id);
                              setEditProjName(p.name);
                              setEditProjDesc(p.description || "");
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
