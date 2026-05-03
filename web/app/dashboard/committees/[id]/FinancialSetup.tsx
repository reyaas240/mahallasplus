"use client";
import { useState, useEffect } from "react";
import { Wallet, Plus, Save, Loader2, Coins, Landmark, Banknote, CreditCard, X, ShieldCheck, Lock, AlertTriangle } from "lucide-react";
import { 
  getOpeningBalanceCategories, 
  createOpeningBalanceCategory, 
  saveOpeningBalances, 
  getFinancialSettings,
  approveOpeningBalances
} from "@/app/actions/committee";

export function FinancialSetup({ term, onClose }: { term: any, onClose: () => void }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState({ currency: "LKR", decimals: 2 });
  const [balances, setBalances] = useState<{ [key: string]: string }>({});
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const isApproved = term.financialsStatus === "APPROVED";

  const formatValue = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: settings.decimals,
      maximumFractionDigits: settings.decimals,
    }).format(val);
  };

  const parseValue = (str: string) => {
    return parseFloat(str.replace(/,/g, '')) || 0;
  };

  useEffect(() => {
    async function init() {
      const [catList, finSettings] = await Promise.all([
        getOpeningBalanceCategories(),
        getFinancialSettings()
      ]);
      setCategories(catList || []);
      setSettings(finSettings);
      
      const initialBalances: { [key: string]: string } = {};
      term.balances?.forEach((b: any) => {
        initialBalances[b.categoryId] = formatValue(b.amount);
      });
      setBalances(initialBalances);
      setIsLoading(false);
    }
    init();
  }, [term]);

  const handleInputChange = (categoryId: string, val: string) => {
    // Only allow numbers, dots, and commas
    const clean = val.replace(/[^0-9.]/g, '');
    setBalances({ ...balances, [categoryId]: clean });
  };

  const handleBlur = (categoryId: string) => {
    const numeric = parseValue(balances[categoryId] || "0");
    setBalances({ ...balances, [categoryId]: formatValue(numeric) });
  };

  const handleSave = async () => {
    if (isApproved) return;
    setIsSaving(true);
    const balanceArray = Object.entries(balances).map(([categoryId, amountStr]) => ({
      categoryId,
      amount: parseValue(amountStr)
    }));
    
    const res = await saveOpeningBalances(term.id, balanceArray);
    setIsSaving(false);
    if (!res.success) alert(res.error);
    else alert("Balances saved as draft!");
  };

  const handleApprove = async () => {
    if (!confirm("Are you sure? Once approved, these opening balances are locked and cannot be modified.")) return;
    
    setIsApproving(true);
    const res = await approveOpeningBalances(term.id);
    setIsApproving(false);
    if (res.success) {
      alert("Balances finalized and locked!");
      onClose();
    } else {
      alert(res.error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory || isApproved) return;
    const res = await createOpeningBalanceCategory(newCategory);
    if (res.success) {
      setCategories([...categories, res.category]);
      setNewCategory("");
      setIsAddingCategory(false);
    } else {
      alert(res.error);
    }
  };

  if (isLoading) return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center">
      <div className="bg-white p-10 rounded-[40px] flex flex-col items-center gap-3 shadow-2xl">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verifying Accounts...</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[48px] max-w-2xl w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${isApproved ? 'bg-emerald-600' : 'bg-slate-900'} rounded-[24px] flex items-center justify-center shadow-xl shadow-slate-200 transition-colors`}>
              {isApproved ? <ShieldCheck className="w-8 h-8 text-white" /> : <Wallet className="w-8 h-8 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Opening Balances</h3>
                {isApproved && (
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest border border-emerald-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Finalized
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{term.name} Initialization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white text-slate-400 rounded-2xl hover:text-rose-600 transition-all border border-slate-100 hover:border-rose-100 shadow-sm">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          {isApproved && (
            <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100 flex gap-4 items-start animate-in slide-in-from-top-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-emerald-900 uppercase tracking-wide">Financial Position Locked</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">
                  Approved on {term.financialsApprovedAt ? new Date(term.financialsApprovedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {categories.map((cat) => (
              <div key={cat.id} className="group relative">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                    {cat.name.toLowerCase().includes('bank') ? <Landmark className="w-3.5 h-3.5" /> : 
                     cat.name.toLowerCase().includes('cash') ? <Banknote className="w-3.5 h-3.5" /> : 
                     cat.name.toLowerCase().includes('pdc') ? <CreditCard className="w-3.5 h-3.5" /> : 
                     <Coins className="w-3.5 h-3.5" />}
                    {cat.name}
                  </label>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{settings.currency} Entry</span>
                </div>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg transition-colors group-focus-within:text-blue-600">{settings.currency}</span>
                  <input 
                    type="text"
                    disabled={isApproved}
                    value={balances[cat.id] || ""}
                    onBlur={() => handleBlur(cat.id)}
                    onChange={(e) => handleInputChange(cat.id, e.target.value)}
                    className="w-full pl-20 pr-6 py-6 bg-white border border-slate-200 rounded-[28px] outline-none focus:ring-[6px] focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-xl disabled:bg-slate-50/50 disabled:text-slate-400 disabled:border-slate-100"
                    placeholder={formatValue(0)}
                  />
                </div>
              </div>
            ))}

            {!isApproved && (
              <div className="pt-4 space-y-4">
                {isAddingCategory ? (
                  <div className="flex gap-3 animate-in zoom-in-95">
                    <input 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Account Name (e.g. Union Bank 004)"
                      className="flex-1 px-6 py-4 bg-white border border-blue-600 rounded-[20px] outline-none text-sm font-black text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-600/10"
                    />
                    <button onClick={handleAddCategory} className="px-6 bg-blue-600 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 shadow-lg shadow-blue-100">Add</button>
                    <button onClick={() => setIsAddingCategory(false)} className="p-4 text-slate-400 hover:text-rose-600"><X className="w-5 h-5" /></button>
                  </div>
                ) : (
                  <button onClick={() => setIsAddingCategory(true)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[24px] text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Define Account Type
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {!isApproved && (
          <div className="p-10 border-t border-slate-100 bg-slate-50/30 flex gap-4">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-6 bg-slate-100 text-slate-600 rounded-[28px] font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all flex justify-center items-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Draft</>}
            </button>
            <button 
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-[1.5] py-6 bg-slate-900 text-white rounded-[28px] font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all flex justify-center items-center gap-3 shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
            >
              {isApproving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Finalize & Lock</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
