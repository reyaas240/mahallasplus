"use client";
import { useState, useEffect } from "react";
import { Search, UserPlus, HeartHandshake, History, Plus, Loader2, X, Wallet, ArrowUpRight, DollarSign, Calendar, Landmark, CreditCard, Banknote, ShieldCheck } from "lucide-react";
import { searchInternalMembers, createDonor, recordDonation, getCommitteeDonations, getDonors, searchAllDonors } from "@/app/actions/donors";
import { getFinancialSettings } from "@/app/actions/committee";

export function DonorDonationManager({ committeeId, terms }: { committeeId: string, terms: any[] }) {
  const [activeTab, setActiveTab] = useState<'donors' | 'donations'>('donations');
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [donations, setDonations] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [settings, setSettings] = useState({ currency: "LKR", decimals: 2 });
  const [isLoading, setIsLoading] = useState(true);

  const currentTerm = terms.find(t => t.status === 'ACTIVE') || terms[0];

  useEffect(() => {
    async function init() {
      const [donationsList, donorsList, finSettings] = await Promise.all([
        getCommitteeDonations(committeeId, currentTerm?.id),
        getDonors(),
        getFinancialSettings()
      ]);
      setDonations(donationsList);
      setDonors(donorsList);
      setSettings(finSettings);
      setIsLoading(false);
    }
    init();
  }, [committeeId, currentTerm]);

  const formatValue = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: settings.decimals,
      maximumFractionDigits: settings.decimals,
    }).format(val);
  };

  if (isLoading) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('donations')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'donations' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <History className="w-4 h-4" /> Donations
          </button>
          <button 
            onClick={() => setActiveTab('donors')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'donors' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <HeartHandshake className="w-4 h-4" /> Donor Registry
          </button>
        </div>
        <button 
          onClick={() => setShowAddDonation(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-50 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Record Donation
        </button>
      </div>

      <div className="p-0">
        {activeTab === 'donations' ? (
          <div className="divide-y divide-slate-100">
            {donations.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No contributions recorded for this term</p>
              </div>
            ) : (
              donations.map((d) => (
                <div key={d.id} className="p-6 flex justify-between items-center hover:bg-slate-50/30 transition-all group">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase tracking-wide text-sm">{d.donor.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(d.date).toLocaleDateString()} • {d.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-lg">{settings.currency} {formatValue(d.amount)}</p>
                    {d.reference && <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Ref: {d.reference}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {donors.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                  <HeartHandshake className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No donors registered in the registry</p>
              </div>
            ) : (
              donors.map((donor) => (
                <div key={donor.id} className="p-6 flex justify-between items-center hover:bg-slate-50/30 transition-all">
                  <div className="flex gap-4 items-center">
                    <div className={`w-12 h-12 ${donor.type === 'INTERNAL' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'} rounded-full flex items-center justify-center font-black text-lg`}>
                      {donor.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 uppercase tracking-wide text-sm">{donor.name}</h4>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border ${donor.type === 'INTERNAL' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {donor.type}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{donor.phone || donor.email || "No contact info"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Support</p>
                     <p className="font-black text-slate-900 text-sm">Active Contributor</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showAddDonation && (
        <DonationModal 
          committeeId={committeeId} 
          termId={currentTerm?.id}
          settings={settings}
          onClose={() => setShowAddDonation(false)} 
        />
      )}
    </div>
  );
}

function DonationModal({ committeeId, termId, settings, onClose }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [masterResults, setMasterResults] = useState<any[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Advanced Registration States
  const [showRegistration, setShowRegistration] = useState(false);
  const [regType, setRegType] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  const [memberQuery, setMemberQuery] = useState("");
  const [memberResults, setMemberResults] = useState<any[]>([]);
  const [externalData, setExternalData] = useState({ name: "", phone: "", email: "" });

  // Master Search Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        const results = await searchAllDonors(searchQuery);
        setMasterResults(results);
        setIsSearching(false);
      } else {
        setMasterResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Internal Member Search Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (memberQuery.length > 2) {
        setIsSearching(true);
        const results = await searchInternalMembers(memberQuery);
        setMemberResults(results);
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [memberQuery]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    let donorId = selectedDonor?.id;

    // Handle New Registration if no donor selected from master
    if (!donorId) {
      if (regType === 'EXTERNAL') {
        const res = await createDonor({
          type: 'EXTERNAL',
          name: externalData.name,
          phone: externalData.phone,
          email: externalData.email
        });
        if (res.success) donorId = res.donor.id;
        else { alert(res.error); setIsSubmitting(false); return; }
      } else {
        // Internal
        const member = memberResults.find(m => m.isSelected); // Or handle selection state
        if (!member) { alert("Please select a donor"); setIsSubmitting(false); return; }
        const res = await createDonor({
          type: 'INTERNAL',
          name: member.name,
          familyMemberId: member.id
        });
        if (res.success) donorId = res.donor.id;
        else { alert(res.error); setIsSubmitting(false); return; }
      }
    }

    const donationRes = await recordDonation({
      amount: formData.get("amount"),
      date: formData.get("date"),
      paymentMethod: formData.get("paymentMethod"),
      reference: formData.get("reference"),
      donorId,
      committeeId,
      committeeTermId: termId
    });

    setIsSubmitting(false);
    if (donationRes.success) {
      onClose();
    } else {
      alert(donationRes.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[48px] max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 rounded-[24px] flex items-center justify-center shadow-xl shadow-slate-200">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Record Contribution</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Financial Inflow Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white text-slate-400 rounded-2xl hover:text-rose-600 transition-all border border-slate-100 hover:border-rose-100 shadow-sm">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          
          {/* Master Search Section */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Find Existing Donor (Master Registry)</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by Name or Phone..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedDonor(null); setShowRegistration(false); }}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold text-xs"
              />
            </div>

            {isSearching && <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest px-1"><Loader2 className="w-3 h-3 animate-spin" /> Searching Masters...</div>}

            <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
              {masterResults.map((d) => (
                <button 
                  key={d.id}
                  type="button"
                  onClick={() => { setSelectedDonor(d); setMasterResults([]); setSearchQuery(d.name); setShowRegistration(false); }}
                  className={`w-full p-4 rounded-2xl border transition-all text-left flex justify-between items-center ${selectedDonor?.id === d.id ? 'bg-emerald-50 border-emerald-600' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                >
                  <div className="flex gap-3 items-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${d.type === 'INTERNAL' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-xs uppercase tracking-wide">{d.name}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{d.type} • {d.phone || "No Phone"}</p>
                    </div>
                  </div>
                  {selectedDonor?.id === d.id && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                </button>
              ))}

              {!selectedDonor && searchQuery.length > 2 && masterResults.length === 0 && !isSearching && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">No master record found</p>
                  <button 
                    type="button"
                    onClick={() => setShowRegistration(true)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all"
                  >
                    Register New Donor
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* New Donor Registration (Hidden by default) */}
          {showRegistration && (
            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-200 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="grid grid-cols-2 gap-4 p-2 bg-white rounded-[20px] shadow-sm">
                <button 
                  type="button"
                  onClick={() => setRegType('INTERNAL')}
                  className={`py-2.5 rounded-[14px] text-[9px] font-black uppercase tracking-widest transition-all ${regType === 'INTERNAL' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}
                >
                  From Registry
                </button>
                <button 
                  type="button"
                  onClick={() => setRegType('EXTERNAL')}
                  className={`py-2.5 rounded-[14px] text-[9px] font-black uppercase tracking-widest transition-all ${regType === 'EXTERNAL' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}
                >
                  New External
                </button>
              </div>

              {regType === 'INTERNAL' ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Search Family Member NIC/Name..."
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-xs"
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-2 custom-scrollbar">
                    {memberResults.map((m) => (
                      <button 
                        key={m.id}
                        type="button"
                        onClick={() => { 
                          setMemberResults(memberResults.map(x => ({...x, isSelected: x.id === m.id})));
                          setSearchQuery(m.name);
                        }}
                        className={`w-full p-3 rounded-xl border transition-all text-left flex justify-between items-center ${m.isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                      >
                        <div className="text-[10px] font-bold uppercase tracking-widest">{m.name}</div>
                        {m.isSelected && <ShieldCheck className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <input 
                      placeholder="Full Name / Entity Name"
                      value={externalData.name}
                      onChange={(e) => setExternalData({...externalData, name: e.target.value})}
                      className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-black text-slate-900 text-xs uppercase tracking-widest" 
                    />
                  </div>
                  <input 
                    placeholder="Phone"
                    value={externalData.phone}
                    onChange={(e) => setExternalData({...externalData, phone: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs" 
                  />
                  <input 
                    placeholder="Email"
                    value={externalData.email}
                    onChange={(e) => setExternalData({...externalData, email: e.target.value})}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs" 
                  />
                </div>
              )}
            </div>
          )}

          <div className="h-px bg-slate-100 w-full" />

          {/* Donation Details (Only show if donor is selected or reg is open) */}
          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-2 lg:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1 text-left">Contribution Amount ({settings.currency})</label>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg transition-colors group-focus-within:text-blue-600">{settings.currency}</span>
                <input 
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  className="w-full pl-20 pr-6 py-6 bg-white border border-slate-200 rounded-[28px] outline-none focus:ring-[6px] focus:ring-blue-600/10 focus:border-blue-600 transition-all font-black text-slate-900 text-xl"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="col-span-2 lg:col-span-1 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 text-left">Collection Date</label>
                <input 
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 text-left">Payment Method</label>
                <select name="paymentMethod" className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-black text-slate-900 text-[10px] uppercase tracking-widest">
                  <option value="CASH">CASH</option>
                  <option value="BANK">BANK TRANSFER</option>
                  <option value="CHEQUE">CHEQUE</option>
                  <option value="PDC">PDC</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 text-left">Reference (Optional)</label>
                <input 
                  name="reference"
                  placeholder="Cheque No / Bank Ref"
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs" 
                />
              </div>
            </div>
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all flex justify-center items-center gap-3 shadow-2xl shadow-slate-200 active:scale-95"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><HeartHandshake className="w-5 h-5" /> Record Contribution</>}
          </button>
        </form>
      </div>
    </div>
  );
}
