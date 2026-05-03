"use client";
import { useState, useEffect } from "react";
import { Search, UserPlus, HeartHandshake, History, Plus, Loader2, X, Wallet, ArrowUpRight, DollarSign, Calendar, Landmark, CreditCard, Banknote, ShieldCheck, Phone, MessageCircle, Mail, Pencil, Paperclip, FileText, Trash2, Edit3 } from "lucide-react";
import { searchInternalMembers, createDonor, updateDonor, recordDonation, getCommitteeDonations, getDonors, searchAllDonors, updateDonation, deleteDonation } from "@/app/actions/donors";
import { getFinancialSettings } from "@/app/actions/committee";

export function DonorDonationManager({ committeeId, terms }: { committeeId: string, terms: any[] }) {
  const [activeTab, setActiveTab] = useState<'donors' | 'donations'>('donations');
  const [showAddDonation, setShowAddDonation] = useState(false);
  const [showEditDonor, setShowEditDonor] = useState<any | null>(null);
  const [showEditDonation, setShowEditDonation] = useState<any | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [settings, setSettings] = useState({ currency: "LKR", decimals: 2 });
  const [isLoading, setIsLoading] = useState(true);

  const currentTerm = terms.find(t => t.status === 'ACTIVE') || terms[0];

  const fetchData = async () => {
    setIsLoading(true);
    const [donationsList, donorsList, finSettings] = await Promise.all([
      getCommitteeDonations(committeeId, currentTerm?.id),
      getDonors(),
      getFinancialSettings()
    ]);
    setDonations(donationsList);
    setDonors(donorsList);
    setSettings(finSettings);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [committeeId, currentTerm, showAddDonation, showEditDonor]);

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
                <div key={d.id} className="p-6 flex justify-between items-center hover:bg-slate-50/30 transition-all group border-b border-slate-100 last:border-0 relative">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase tracking-wide text-sm">{d.donor.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(d.date).toLocaleDateString()} • {d.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-black text-slate-900 text-lg">{settings.currency} {formatValue(d.amount)}</p>
                      {d.reference && <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight">Ref: {d.reference}</p>}
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                       <button 
                         onClick={() => setShowEditDonation(d)}
                         className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                         title="Edit Donation"
                       >
                         <Edit3 className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={async () => {
                           if (confirm("Are you sure you want to delete this donation record? This action cannot be undone.")) {
                             await deleteDonation(d.id);
                           }
                         }}
                         className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                         title="Delete Donation"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
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
              donors.map((d) => (
                <div key={d.id} className="p-8 flex justify-between items-start hover:bg-slate-50/50 transition-all group">
                   <div className="flex gap-5 items-start">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${d.type === 'INTERNAL' ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-amber-500 text-white shadow-amber-100'}`}>
                         {d.name.charAt(0)}
                      </div>
                      <div className="space-y-3">
                         <div>
                           <div className="flex items-center gap-3">
                             <h4 className="font-black text-slate-900 uppercase tracking-wide text-sm">{d.name}</h4>
                             <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-[0.1em] ${d.type === 'INTERNAL' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{d.type}</span>
                           </div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                             {d.phone || "No primary contact"}
                           </p>
                         </div>

                         {/* Contacts Display */}
                         {d.contacts && d.contacts.length > 0 && (
                           <div className="flex flex-wrap gap-2">
                             {d.contacts.map((c: any, idx: number) => (
                               <div key={idx} className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-3 group/contact">
                                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider">{c.name}</span>
                                  <div className="flex gap-1.5 opacity-40 group-hover/contact:opacity-100 transition-opacity">
                                     {c.phone && <Phone className="w-3 h-3 text-slate-400" />}
                                     {c.whatsapp && <MessageCircle className="w-3 h-3 text-emerald-500" />}
                                     {c.email && <Mail className="w-3 h-3 text-blue-400" />}
                                  </div>
                               </div>
                             ))}
                           </div>
                         )}
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className="text-right">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Support</p>
                       <p className="font-black text-slate-900 text-sm">Active Contributor</p>
                     </div>
                     <button 
                       onClick={() => setShowEditDonor(d)}
                       className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm group-hover:shadow-md"
                     >
                       <Pencil className="w-4 h-4" />
                     </button>
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
      {showEditDonor && <EditDonorModal donor={showEditDonor} onClose={() => setShowEditDonor(null)} />}
      {showEditDonation && <EditDonationModal donation={showEditDonation} settings={settings} onClose={() => setShowEditDonation(null)} />}
    </div>
  );
}

function EditDonationModal({ donation, settings, onClose }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await updateDonation(donation.id, {
      amount: formData.get("amount"),
      date: formData.get("date"),
      paymentMethod: formData.get("paymentMethod"),
      reference: formData.get("reference"),
      attachmentUrl: attachment ? attachment.name : donation.attachmentUrl
    });

    setIsSubmitting(false);
    if (res.success) onClose();
    else alert(res.error);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] max-w-xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[98vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Edit Contribution</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Record ID: {donation.id.slice(-6)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 rounded-xl hover:text-rose-600 transition-all border border-slate-100 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Donor Entity</p>
                <p className="text-xs font-black text-slate-900 uppercase tracking-wide mt-1">{donation.donor.name}</p>
             </div>
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${donation.donor.type === 'INTERNAL' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
               {donation.donor.name.charAt(0)}
             </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
             <div className="col-span-12">
               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Amount ({settings.currency})</label>
               <div className="relative">
                 <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-base">{settings.currency}</span>
                 <input 
                   name="amount" 
                   type="number" 
                   step="0.01" 
                   required 
                   defaultValue={donation.amount}
                   className="w-full pl-16 pr-5 py-4 bg-white border-2 border-slate-300 rounded-2xl outline-none focus:border-blue-600 font-black text-slate-900 text-2xl" 
                 />
               </div>
             </div>
             
             <div className="col-span-6">
               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Date</label>
               <input 
                 name="date" 
                 type="date" 
                 required 
                 defaultValue={new Date(donation.date).toISOString().split('T')[0]} 
                 className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-[11px]" 
               />
             </div>

             <div className="col-span-6">
               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Method</label>
               <select 
                 name="paymentMethod" 
                 defaultValue={donation.paymentMethod}
                 className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 text-[10px] uppercase"
               >
                 <option value="CASH">CASH</option>
                 <option value="BANK">BANK</option>
                 <option value="CHEQUE">CHEQUE</option>
                 <option value="PDC">PDC</option>
               </select>
             </div>

             <div className="col-span-12">
                <div className="flex gap-4">
                   <div className="flex-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Reference</label>
                      <input 
                        name="reference" 
                        defaultValue={donation.reference || ""}
                        placeholder="Ref No / Cheque No" 
                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-[11px]" 
                      />
                   </div>
                   <div className="w-1/2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Attachment</label>
                      <div className="relative group cursor-pointer">
                        <input 
                          type="file" 
                          onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        />
                        <div className={`w-full px-4 py-3 border-2 border-dashed rounded-xl flex items-center gap-2 transition-all ${attachment || donation.attachmentUrl ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-300 group-hover:border-blue-400'}`}>
                           {(attachment || donation.attachmentUrl) ? <FileText className="w-3 h-3 text-emerald-600" /> : <Paperclip className="w-3 h-3 text-slate-400" />}
                           <span className={`text-[9px] font-black uppercase truncate ${(attachment || donation.attachmentUrl) ? 'text-emerald-700' : 'text-slate-400'}`}>
                             {attachment ? attachment.name : (donation.attachmentUrl ? donation.attachmentUrl : "Add File")}
                           </span>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all flex justify-center items-center gap-2 shadow-xl active:scale-95"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowUpRight className="w-4 h-4" /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditDonorModal({ donor, onClose }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({ 
    name: donor.name, 
    phone: donor.phone || "", 
    email: donor.email || "" 
  });
  const [contacts, setContacts] = useState<any[]>(donor.contacts || []);
  const [newContact, setNewContact] = useState({ name: "", phone: "", whatsapp: "", email: "" });

  const addContact = () => {
    if (!newContact.name) return;
    setContacts([...contacts, newContact]);
    setNewContact({ name: "", phone: "", whatsapp: "", email: "" });
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await updateDonor(donor.id, {
      ...data,
      contacts: contacts.map(({ id, ...rest }: any) => rest) // Strip IDs for recreation
    });
    setIsSubmitting(false);
    if (res.success) onClose();
    else alert(res.error);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[48px] max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-[20px] flex items-center justify-center shadow-xl shadow-blue-200">
              <Pencil className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Edit Donor Registry</h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Master Record Modification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white text-slate-400 rounded-xl hover:text-rose-600 transition-all border border-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
             <div className="col-span-2">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Donor / Entity Name</label>
               <input 
                 value={data.name}
                 onChange={(e) => setData({...data, name: e.target.value})}
                 className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-900 text-xs uppercase tracking-widest" 
               />
             </div>
             <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Primary Phone</label>
               <input 
                 value={data.phone}
                 onChange={(e) => setData({...data, phone: e.target.value})}
                 className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs" 
               />
             </div>
             <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Primary Email</label>
               <input 
                 value={data.email}
                 onChange={(e) => setData({...data, email: e.target.value})}
                 className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-900 text-xs" 
               />
             </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Manage Contacts */}
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Manage Authorized Contacts</label>
            <div className="grid grid-cols-2 gap-3 bg-slate-100/50 p-6 rounded-3xl border border-slate-200 shadow-inner">
               <input 
                 placeholder="Contact Name"
                 value={newContact.name}
                 onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                 className="col-span-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none font-bold text-[11px] text-slate-900 placeholder:text-slate-400 focus:border-blue-600 transition-all" 
               />
               <input 
                 placeholder="Phone"
                 value={newContact.phone}
                 onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                 className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none font-bold text-[11px] text-slate-900 placeholder:text-slate-400 focus:border-blue-600 transition-all" 
               />
               <input 
                 placeholder="WhatsApp"
                 value={newContact.whatsapp}
                 onChange={(e) => setNewContact({...newContact, whatsapp: e.target.value})}
                 className="px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none font-bold text-[11px] text-slate-900 placeholder:text-slate-400 focus:border-blue-600 transition-all" 
               />
               <input 
                 placeholder="Email"
                 value={newContact.email}
                 onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                 className="col-span-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none font-bold text-[11px] text-slate-900 placeholder:text-slate-400 focus:border-blue-600 transition-all" 
               />
               <button 
                 type="button"
                 onClick={addContact}
                 className="col-span-2 py-3 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
               >
                 Add New Contact Person
               </button>
            </div>

            <div className="space-y-3">
               {contacts.map((c: any, i: number) => (
                 <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm group">
                    <div className="flex gap-4 items-center">
                       <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-[10px] text-slate-600">
                          {c.name.charAt(0)}
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-slate-900 uppercase tracking-wide">{c.name}</p>
                          <div className="flex gap-3 mt-1">
                             {c.phone && <span className="text-[8px] font-bold text-slate-400 uppercase flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {c.phone}</span>}
                             {c.whatsapp && <span className="text-[8px] font-black text-emerald-500 uppercase flex items-center gap-1"><MessageCircle className="w-2.5 h-2.5" /> {c.whatsapp}</span>}
                          </div>
                       </div>
                    </div>
                    <button type="button" onClick={() => removeContact(i)} className="text-slate-300 hover:text-rose-600 transition-colors">
                       <X className="w-4 h-4" />
                    </button>
                 </div>
               ))}
            </div>
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all flex justify-center items-center gap-3 shadow-xl"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Update Master Record</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function DonationModal({ committeeId, termId, settings, onClose }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [masterResults, setMasterResults] = useState<any[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showRegistration, setShowRegistration] = useState(false);
  const [regType, setRegType] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  const [memberQuery, setMemberQuery] = useState("");
  const [memberResults, setMemberResults] = useState<any[]>([]);
  const [externalData, setExternalData] = useState({ name: "", phone: "", email: "" });
  const [contacts, setContacts] = useState<any[]>([]);
  const [newContact, setNewContact] = useState({ name: "", phone: "", whatsapp: "", email: "" });
  const [attachment, setAttachment] = useState<File | null>(null);

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

  const addContact = () => {
    if (!newContact.name) return;
    setContacts([...contacts, newContact]);
    setNewContact({ name: "", phone: "", whatsapp: "", email: "" });
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    let donorId = selectedDonor?.id;

    if (!donorId) {
      if (regType === 'EXTERNAL') {
        const res = await createDonor({
          type: 'EXTERNAL',
          name: externalData.name,
          phone: externalData.phone,
          email: externalData.email,
          contacts: contacts
        });
        if (res.success) donorId = res.donor.id;
        else { alert(res.error); setIsSubmitting(false); return; }
      } else {
        const member = memberResults.find(m => m.isSelected);
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
      attachmentUrl: attachment ? attachment.name : null,
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] max-w-xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[98vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Record Contribution</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Financial Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 rounded-xl hover:text-rose-600 transition-all border border-slate-100 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          
          <div className="space-y-3">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Donor Registry</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text"
                placeholder="Search Name / Phone..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedDonor(null); setShowRegistration(false); }}
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl outline-none focus:border-blue-600 transition-all font-bold text-xs text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {masterResults.length > 0 && (
              <div className="max-h-24 overflow-y-auto space-y-1 custom-scrollbar">
                {masterResults.map((d) => (
                  <button 
                    key={d.id}
                    type="button"
                    onClick={() => { setSelectedDonor(d); setMasterResults([]); setSearchQuery(d.name); setShowRegistration(false); }}
                    className={`w-full p-2.5 rounded-xl border-2 transition-all text-left flex justify-between items-center ${selectedDonor?.id === d.id ? 'bg-emerald-50 border-emerald-500 shadow-inner' : 'bg-white border-slate-200 hover:border-blue-200'}`}
                  >
                    <div className="flex gap-2 items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${d.type === 'INTERNAL' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'}`}>
                        {d.name.charAt(0)}
                      </div>
                      <div className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[150px]">{d.name}</div>
                    </div>
                    {selectedDonor?.id === d.id && <ShieldCheck className="w-5 h-5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}

            {!selectedDonor && searchQuery.length > 2 && masterResults.length === 0 && !isSearching && (
              <div className="p-3 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 flex justify-between items-center">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">No record found</p>
                <button 
                  type="button"
                  onClick={() => setShowRegistration(true)}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-black"
                >
                  Register New
                </button>
              </div>
            )}
          </div>

          {showRegistration && (
            <div className="p-5 bg-slate-50 rounded-3xl border-2 border-slate-200 space-y-4 shadow-inner">
               <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-100">
                  <button type="button" onClick={() => setRegType('INTERNAL')} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${regType === 'INTERNAL' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Member</button>
                  <button type="button" onClick={() => setRegType('EXTERNAL')} className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${regType === 'EXTERNAL' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>External</button>
               </div>
               
               {regType === 'INTERNAL' ? (
                 <div className="space-y-2">
                    <input 
                      placeholder="Search Member..."
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl outline-none font-bold text-[11px] text-slate-900"
                    />
                    <div className="max-h-20 overflow-y-auto space-y-1">
                       {memberResults.map(m => (
                         <button key={m.id} type="button" onClick={() => { setMemberResults(memberResults.map(x => ({...x, isSelected: x.id === m.id}))); setSearchQuery(m.name); }} className={`w-full p-2 rounded-lg border-2 text-[10px] font-black uppercase text-left ${m.isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200'}`}>
                           {m.name}
                         </button>
                       ))}
                    </div>
                 </div>
               ) : (
                 <div className="grid grid-cols-2 gap-2">
                    <input value={externalData.name} onChange={e => setExternalData({...externalData, name: e.target.value})} placeholder="Org Name" className="col-span-2 px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 text-[10px] uppercase" />
                    <input value={externalData.phone} onChange={e => setExternalData({...externalData, phone: e.target.value})} placeholder="Phone" className="px-4 py-2 bg-white border-2 border-slate-300 rounded-xl font-bold text-[10px]" />
                    <input value={externalData.email} onChange={e => setExternalData({...externalData, email: e.target.value})} placeholder="Email" className="px-4 py-2 bg-white border-2 border-slate-300 rounded-xl font-bold text-[10px]" />
                 </div>
               )}
            </div>
          )}

          <div className="h-px bg-slate-100" />

          <div className="grid grid-cols-12 gap-3">
             <div className="col-span-12 lg:col-span-12">
               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Amount ({settings.currency})</label>
               <div className="relative">
                 <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-base">{settings.currency}</span>
                 <input name="amount" type="number" step="0.01" required className="w-full pl-16 pr-5 py-3.5 bg-white border-2 border-slate-300 rounded-2xl outline-none focus:border-blue-600 font-black text-slate-900 text-xl" placeholder="0.00" />
               </div>
             </div>
             
             <div className="col-span-6">
               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Date</label>
               <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-[11px]" />
             </div>

             <div className="col-span-6">
               <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Method</label>
               <select name="paymentMethod" className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 text-[10px] uppercase cursor-pointer">
                 <option value="CASH">CASH</option>
                 <option value="BANK">BANK</option>
                 <option value="CHEQUE">CHEQUE</option>
                 <option value="PDC">PDC</option>
               </select>
             </div>

             <div className="col-span-12">
                <div className="flex gap-3">
                   <div className="flex-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Reference (Ref No)</label>
                      <input name="reference" placeholder="Ref No / Cheque No" className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-[11px] placeholder:text-slate-300" />
                   </div>
                   <div className="w-1/2">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Attachment</label>
                      <div className="relative group cursor-pointer">
                        <input 
                          type="file" 
                          onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        />
                        <div className={`w-full px-4 py-2.5 border-2 border-dashed rounded-xl flex items-center gap-2 transition-all ${attachment ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-slate-300 group-hover:border-blue-400'}`}>
                           {attachment ? <FileText className="w-3 h-3 text-emerald-600" /> : <Paperclip className="w-3 h-3 text-slate-400" />}
                           <span className={`text-[9px] font-black uppercase truncate ${attachment ? 'text-emerald-700' : 'text-slate-400'}`}>
                             {attachment ? attachment.name : "Add File"}
                           </span>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <button 
            disabled={isSubmitting}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all flex justify-center items-center gap-2 shadow-xl active:scale-95"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><HeartHandshake className="w-4 h-4" /> Record Contribution</>}
          </button>
        </form>
      </div>
    </div>
  );
}
