"use client";
import { useState, useEffect } from "react";
import { Loader2, Plus, X, Trash2, FolderOpen, LayoutGrid, Tag } from "lucide-react";
import {
  getRequestCategories, createRequestCategory, deleteRequestCategory,
  getProjectMasters, createProjectMaster, deleteProjectMaster,
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
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-violet-500 rounded-full shrink-0" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">{c.name}</span>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-100 group hover:bg-blue-50/50 hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wide block truncate">{p.name}</span>
                      {p.description && (
                        <span className="text-[9px] font-medium text-slate-400 block truncate">{p.description}</span>
                      )}
                    </div>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={() => handleDeleteProject(p.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
