"use client";
import { useState } from "react";
import { Plus, Trash2, Calendar, LayoutGrid, X, Loader2, Edit3, ShieldCheck, Wallet, Lock } from "lucide-react";
import { createCommitteeTerm, deleteCommitteeTerm, updateCommitteeTerm, toggleTermActive } from "@/app/actions/committee";
import { FinancialSetup } from "./FinancialSetup";

export function TermManager({ committeeId, terms, isReadOnly }: { committeeId: string, terms: any[], isReadOnly?: boolean }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTerm, setEditingTerm] = useState<any | null>(null);
  const [financialTerm, setFinancialTerm] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    let res;
    if (editingTerm) {
      res = await updateCommitteeTerm(editingTerm.id, formData);
    } else {
      formData.append("committeeId", committeeId);
      res = await createCommitteeTerm(formData);
    }

    setIsSubmitting(false);
    if (res.success) {
      setIsAdding(false);
      setEditingTerm(null);
      form.reset();
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure? This will delete all member records for this term.")) {
      const res = await deleteCommitteeTerm(id);
      if (!res.success) alert(res.error);
    }
  };

  const handleToggleActive = async (id: string) => {
    const res = await toggleTermActive(id);
    if (!res.success) alert(res.error);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" /> Operational Terms
        </h3>
        {!isReadOnly && (
          <button 
            onClick={() => { setEditingTerm(null); setIsAdding(true); }}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {terms.length === 0 ? (
          <div className="p-10 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
            No terms established
          </div>
        ) : (
          terms.map((t) => (
            <div key={t.id} className={`p-4 flex items-center justify-between group transition-all ${t.status === 'ACTIVE' ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'}`}>
              <div className="flex gap-3 items-center">
                <button 
                  type="button"
                  onClick={() => !isReadOnly && handleToggleActive(t.id)}
                  title={t.status === 'ACTIVE' ? 'Currently Active' : 'Set as Active'}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${t.status === 'ACTIVE' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' : 'bg-slate-100 text-slate-400 hover:bg-blue-100 hover:text-blue-600'} ${isReadOnly ? 'cursor-default' : ''}`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-900 uppercase tracking-wide text-xs">{t.name}</p>
                    {t.status === 'ACTIVE' && (
                      <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter animate-pulse">Current</span>
                    )}
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <LayoutGrid className="w-3 h-3" /> {t._count?.members || 0} Members
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setFinancialTerm(t)}
                  title="Opening Balances"
                  className={`p-2 rounded-lg transition-all ${t.financialsStatus === 'APPROVED' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-slate-300 hover:text-blue-600 hover:bg-blue-50 border border-transparent'}`}
                >
                  {t.financialsStatus === 'APPROVED' ? <Lock className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                </button>
                {!isReadOnly && (
                  <>
                    <button 
                      onClick={() => { setEditingTerm(t); setIsAdding(true); }}
                      className="p-2 text-slate-300 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {financialTerm && (
        <FinancialSetup 
          term={financialTerm} 
          onClose={() => setFinancialTerm(null)} 
          isReadOnly={isReadOnly}
        />
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl relative overflow-hidden">
            <button onClick={() => { setIsAdding(false); setEditingTerm(null); }} className="absolute top-8 right-8 p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-rose-600 transition-all hover:bg-rose-50">
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-8">{editingTerm ? 'Update Term' : 'New Committee Term'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Term Name</label>
                <input 
                  required 
                  name="name" 
                  defaultValue={editingTerm?.name}
                  placeholder="e.g. 2024 - 2026 Term" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-sm uppercase tracking-wide"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Start Date</label>
                  <input 
                    name="startDate" 
                    type="date" 
                    defaultValue={editingTerm?.startDate ? new Date(editingTerm.startDate).toISOString().split('T')[0] : ''}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">End Date</label>
                  <input 
                    name="endDate" 
                    type="date" 
                    defaultValue={editingTerm?.endDate ? new Date(editingTerm.endDate).toISOString().split('T')[0] : ''}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs" 
                  />
                </div>
              </div>
              
              <button 
                disabled={isSubmitting}
                className={`w-full py-5 ${editingTerm ? 'bg-amber-600 shadow-amber-100' : 'bg-blue-600 shadow-blue-100'} text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all flex justify-center items-center gap-3 shadow-xl mt-4`}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingTerm ? "Update Term Identity" : "Establish Term"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
