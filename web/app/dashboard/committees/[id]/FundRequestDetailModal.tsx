"use client";
import { useState, useEffect } from "react";
import { X, Loader2, ShieldCheck, Users, Calendar, FileText, Banknote, CheckCircle2, XCircle, Clock, Plus, Paperclip, User, Building2 } from "lucide-react";
import { getFundRequestDetail, verifyBeneficiary, addInvestigation, scheduleAppointment, updateAppointmentOutcome, addQuotation, approveFundRequest, rejectFundRequest, disburseFunds } from "@/app/actions/fundRequests";

export function FundRequestDetailModal({ requestId, settings, members, onClose }: any) {
  const [req, setReq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  const load = async () => { setLoading(true); const d = await getFundRequestDetail(requestId); setReq(d); setLoading(false); };
  useEffect(() => { load(); }, [requestId]);

  const fmt = (v: number) => new Intl.NumberFormat("en-US", { minimumFractionDigits: settings.decimals, maximumFractionDigits: settings.decimals }).format(v);

  if (loading || !req) return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>
  );

  const name = req.beneficiaryType === "INTERNAL" ? req.familyMember?.fullName || "Member" : req.externalName || "External";
  const tabs = ["overview", "investigation", "appointments", "quotations", "decision"];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-[1100px] max-w-[95vw] shadow-2xl flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-[40px]">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${req.beneficiaryType === "INTERNAL" ? "bg-blue-600 text-white" : "bg-amber-500 text-white"}`}>{name.charAt(0)}</div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{name}</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">{req.purpose} {req.projectName ? `• ${req.projectName}` : ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 rounded-xl hover:text-rose-600 transition-all border border-slate-100"><X className="w-5 h-5" /></button>
        </div>

        {/* Two-column body */}
        <div className="flex flex-1 overflow-hidden rounded-b-[40px]">
          {/* Left: Tabs + Content */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-slate-100">
            {/* Tabs */}
            <div className="flex gap-1 p-2 border-b border-slate-100 shrink-0">
              {tabs.map(t => (
                <button key={t} onClick={() => setActiveSection(t)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeSection === t ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-900"}`}>{t}</button>
              ))}
            </div>

            {/* Tab Content — fixed height, scrolls internally */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {activeSection === "overview" && <OverviewSection req={req} settings={settings} fmt={fmt} onRefresh={load} />}
              {activeSection === "investigation" && <InvestigationSection req={req} members={members} onRefresh={load} />}
              {activeSection === "appointments" && <AppointmentSection req={req} onRefresh={load} />}
              {activeSection === "quotations" && <QuotationSection req={req} onRefresh={load} />}
              {activeSection === "decision" && <DecisionSection req={req} settings={settings} fmt={fmt} onRefresh={load} />}
            </div>
          </div>

          {/* Right: Persistent Timeline */}
          <div className="w-[300px] shrink-0 flex flex-col bg-slate-50/50 rounded-br-[40px]">
            <div className="p-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Trail</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {req.events.length === 0 ? (
                <p className="text-[9px] text-slate-300 font-bold uppercase text-center pt-8">No events yet</p>
              ) : (
                req.events.map((ev: any, i: number) => (
                  <div key={ev.id} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? "bg-blue-500" : "bg-slate-300"}`} />
                      {i < req.events.length - 1 && <div className="w-px h-full bg-slate-200 min-h-[20px]" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-[11px] font-black text-slate-800 leading-tight">{ev.action}</p>
                      <p className="text-[8px] text-slate-400 font-bold mt-0.5">{ev.performedBy} • {new Date(ev.createdAt).toLocaleString()}</p>
                      {ev.note && <p className="text-[9px] text-slate-500 font-medium mt-0.5 leading-snug">{ev.note}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──── Overview ──── */
function OverviewSection({ req, settings, fmt, onRefresh }: any) {
  const [verifying, setVerifying] = useState(false);
  const handleVerify = async () => { setVerifying(true); await verifyBeneficiary(req.id); await onRefresh(); setVerifying(false); };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InfoCard label="Status" value={req.status.replace(/_/g, " ")} />
        <InfoCard label="Type" value={req.beneficiaryType} />
        <InfoCard label="Requested" value={req.requestedAmount ? `${settings.currency} ${fmt(req.requestedAmount)}` : "—"} />
        <InfoCard label="Granted" value={req.grantedAmount ? `${settings.currency} ${fmt(req.grantedAmount)}` : "—"} />
        {req.description && <div className="col-span-2"><InfoCard label="Description" value={req.description} /></div>}
      </div>
      {req.beneficiaryType === "INTERNAL" && !req.verified && (
        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex justify-between items-center">
          <div>
            <p className="font-black text-amber-800 text-xs uppercase">Verification Required</p>
            <p className="text-[9px] text-amber-600 font-bold mt-1">Family Card: {req.familyMember?.familyCard?.mainMahallaCardNo || "N/A"} • {req.familyMember?.familyCard?.subMahalla?.name}</p>
          </div>
          <button onClick={handleVerify} disabled={verifying} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2">
            {verifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />} Verify
          </button>
        </div>
      )}
      {req.verified && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Verified on {new Date(req.verifiedAt).toLocaleDateString()} by {req.verifiedBy}</span>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xs font-black text-slate-900 uppercase mt-1">{value}</p>
    </div>
  );
}

/* ──── Investigation ──── */
function InvestigationSection({ req, members, onRefresh }: any) {
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const toggleMember = (name: string) => {
    setSelectedMembers(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedMembers.length === 0) { alert("Select at least one investigator"); return; }
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await addInvestigation({ fundRequestId: req.id, investigators: selectedMembers.join(", "), visitDate: fd.get("visitDate"), findings: fd.get("findings") });
    await onRefresh(); setSubmitting(false); setShow(false); setSelectedMembers([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Investigations ({req.investigations.length})</p>
        <button onClick={() => setShow(!show)} className="px-4 py-2 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-700 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
      </div>
      {show && (
        <form onSubmit={handleAdd} className="p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl space-y-3">
          <div>
            <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-2">Select Investigators</p>
            <div className="flex flex-wrap gap-2">
              {(members || []).map((m: any) => {
                const name = m.familyMember?.fullName || "Member";
                const isSelected = selectedMembers.includes(name);
                return (
                  <button key={m.id} type="button" onClick={() => toggleMember(name)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border-2 ${
                      isSelected ? "bg-purple-600 text-white border-purple-600 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-purple-400"
                    }`}>
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}>{name.charAt(0)}</div>
                    {name}
                    {isSelected && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
            {selectedMembers.length > 0 && (
              <p className="text-[8px] font-bold text-purple-500 mt-2 uppercase tracking-widest">{selectedMembers.length} selected: {selectedMembers.join(", ")}</p>
            )}
          </div>
          <input name="visitDate" type="date" required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs" />
          <textarea name="findings" required placeholder="Findings & report..." rows={3} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs resize-none" />
          <button disabled={submitting || selectedMembers.length === 0} className="w-full py-3 bg-purple-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50">
            {submitting ? "Saving..." : "Save Investigation"}
          </button>
        </form>
      )}
      {req.investigations.map((inv: any) => (
        <div key={inv.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex flex-wrap gap-1">
              {inv.investigators.split(", ").map((name: string, i: number) => (
                <span key={i} className="bg-purple-100 text-purple-700 text-[8px] font-black px-2 py-0.5 rounded-lg uppercase">{name}</span>
              ))}
            </div>
            <span className="text-[9px] font-bold text-slate-400 shrink-0 ml-2">{new Date(inv.visitDate).toLocaleDateString()}</span>
          </div>
          <p className="text-xs text-slate-700 font-medium">{inv.findings}</p>
        </div>
      ))}
    </div>
  );
}

/* ──── Appointments ──── */
function AppointmentSection({ req, onRefresh }: any) {
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [outcomeId, setOutcomeId] = useState<string | null>(null);

  const handleSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await scheduleAppointment({ fundRequestId: req.id, scheduledDate: fd.get("scheduledDate"), location: fd.get("location"), purpose: fd.get("purpose") });
    await onRefresh(); setSubmitting(false); setShow(false);
  };

  const handleOutcome = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault(); setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await updateAppointmentOutcome(id, { outcome: fd.get("outcome"), attended: fd.get("attended") === "true" });
    await onRefresh(); setSubmitting(false); setOutcomeId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Appointments ({req.appointments.length})</p>
        <button onClick={() => setShow(!show)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 flex items-center gap-1"><Plus className="w-3 h-3" /> Schedule</button>
      </div>
      {show && (
        <form onSubmit={handleSchedule} className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input name="scheduledDate" type="date" required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs" />
            <input name="location" placeholder="Location (Office)" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs" />
          </div>
          <input name="purpose" placeholder="Purpose (e.g. Initial Inquiry)" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs" />
          <button disabled={submitting} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50">{submitting ? "Saving..." : "Schedule Appointment"}</button>
        </form>
      )}
      {req.appointments.map((a: any) => (
        <div key={a.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[10px] font-black text-slate-900 uppercase">{new Date(a.scheduledDate).toLocaleDateString()}</span>
              {a.location && <span className="text-[9px] text-slate-400 font-bold">• {a.location}</span>}
            </div>
            <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase ${a.attended ? "bg-emerald-100 text-emerald-700" : a.outcome ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
              {a.attended ? "Attended" : a.outcome ? "Missed" : "Pending"}
            </span>
          </div>
          {a.purpose && <p className="text-[10px] text-slate-500 font-bold">{a.purpose}</p>}
          {a.outcome && <p className="text-xs text-slate-700 font-medium">{a.outcome}</p>}
          {!a.outcome && (
            outcomeId === a.id ? (
              <form onSubmit={(e) => handleOutcome(e, a.id)} className="space-y-2 pt-2 border-t border-slate-100">
                <textarea name="outcome" required placeholder="Meeting outcome..." rows={2} className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs resize-none" />
                <div className="flex gap-2">
                  <select name="attended" className="px-3 py-2 bg-white border-2 border-slate-300 rounded-xl font-black text-xs"><option value="true">Attended</option><option value="false">Missed</option></select>
                  <button disabled={submitting} className="flex-1 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase disabled:opacity-50">{submitting ? "..." : "Save"}</button>
                  <button type="button" onClick={() => setOutcomeId(null)} className="px-3 py-2 text-slate-400 border border-slate-200 rounded-xl text-[10px] font-black">Cancel</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setOutcomeId(a.id)} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800">Record Outcome →</button>
            )
          )}
        </div>
      ))}
    </div>
  );
}

/* ──── Quotations ──── */
function QuotationSection({ req, onRefresh }: any) {
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await addQuotation({ fundRequestId: req.id, vendor: fd.get("vendor"), amount: fd.get("amount"), description: fd.get("description"), fileUrl: file?.name || "quotation.pdf" });
    await onRefresh(); setSubmitting(false); setShow(false); setFile(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quotations ({req.quotations.length})</p>
        <button onClick={() => setShow(!show)} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-700 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
      </div>
      {show && (
        <form onSubmit={handleAdd} className="p-4 bg-teal-50 border-2 border-teal-200 rounded-2xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input name="vendor" required placeholder="Vendor name" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs" />
            <input name="amount" type="number" step="0.01" required placeholder="Amount" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs" />
          </div>
          <input name="description" placeholder="Description" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs" />
          <div className="relative group cursor-pointer">
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <div className={`w-full px-4 py-3 border-2 border-dashed rounded-xl flex items-center gap-2 ${file ? "bg-emerald-50 border-emerald-500" : "bg-slate-50 border-slate-300"}`}>
              {file ? <FileText className="w-3 h-3 text-emerald-600" /> : <Paperclip className="w-3 h-3 text-slate-400" />}
              <span className={`text-[9px] font-black uppercase truncate ${file ? "text-emerald-700" : "text-slate-400"}`}>{file ? file.name : "Attach file"}</span>
            </div>
          </div>
          <button disabled={submitting} className="w-full py-3 bg-teal-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50">{submitting ? "Saving..." : "Save Quotation"}</button>
        </form>
      )}
      {req.quotations.map((q: any) => (
        <div key={q.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center">
          <div>
            <p className="font-black text-slate-900 text-xs uppercase">{q.vendor}</p>
            {q.description && <p className="text-[9px] text-slate-500 font-bold mt-1">{q.description}</p>}
          </div>
          <p className="font-black text-slate-900 text-sm">{q.amount.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}

/* ──── Decision ──── */
function DecisionSection({ req, settings, fmt, onRefresh }: any) {
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await approveFundRequest(req.id, { grantedAmount: fd.get("grantedAmount"), decisionNotes: fd.get("decisionNotes") });
    await onRefresh(); setSubmitting(false);
  };

  const handleReject = async () => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    setSubmitting(true);
    await rejectFundRequest(req.id, reason);
    await onRefresh(); setSubmitting(false);
  };

  const handleDisburse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await disburseFunds(req.id, { disbursementMethod: fd.get("disbursementMethod"), chequeNumber: fd.get("chequeNumber"), bankReference: fd.get("bankReference") });
    await onRefresh(); setSubmitting(false);
  };

  if (req.status === "DISBURSED") {
    return (
      <div className="p-6 bg-teal-50 border-2 border-teal-200 rounded-2xl text-center space-y-2">
        <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
        <p className="font-black text-teal-800 text-lg uppercase">Funds Disbursed</p>
        <p className="text-xs font-bold text-teal-600">{settings.currency} {fmt(req.grantedAmount)} via {req.disbursementMethod?.replace("_", " ")}</p>
        {req.chequeNumber && <p className="text-[10px] text-teal-500 font-bold">Cheque #{req.chequeNumber}</p>}
        {req.bankReference && <p className="text-[10px] text-teal-500 font-bold">Ref: {req.bankReference}</p>}
        <p className="text-[9px] text-teal-400 font-bold">{new Date(req.disbursedAt).toLocaleDateString()}</p>
      </div>
    );
  }

  if (req.status === "REJECTED") {
    return (
      <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-2xl text-center space-y-2">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <p className="font-black text-rose-800 text-lg uppercase">Request Rejected</p>
        {req.decisionNotes && <p className="text-xs font-medium text-rose-600">{req.decisionNotes}</p>}
      </div>
    );
  }

  if (req.status === "APPROVED") {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-center">
          <p className="font-black text-emerald-800 uppercase text-sm">Approved: {settings.currency} {fmt(req.grantedAmount)}</p>
          {req.decisionNotes && <p className="text-[10px] text-emerald-600 font-bold mt-1">{req.decisionNotes}</p>}
        </div>
        <form onSubmit={handleDisburse} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Release Payment</p>
          <select name="disbursementMethod" required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 text-[10px] uppercase">
            <option value="CASH">Cash</option>
            <option value="CHEQUE">Cheque</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input name="chequeNumber" placeholder="Cheque No (if applicable)" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs" />
            <input name="bankReference" placeholder="Bank Ref (if applicable)" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs" />
          </div>
          <button disabled={submitting} className="w-full py-3 bg-teal-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Banknote className="w-4 h-4" />} Release Funds
          </button>
        </form>
      </div>
    );
  }

  // Default: Approve/Reject form
  return (
    <div className="space-y-4">
      <form onSubmit={handleApprove} className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Approve & Grant Amount</p>
        <input name="grantedAmount" type="number" step="0.01" required placeholder="Amount to grant" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 text-lg" />
        <textarea name="decisionNotes" placeholder="Decision notes..." rows={2} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs resize-none" />
        <button disabled={submitting} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve
        </button>
      </form>
      <button onClick={handleReject} disabled={submitting} className="w-full py-3 bg-white text-rose-600 border-2 border-rose-200 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-50 disabled:opacity-50 flex items-center justify-center gap-2">
        <XCircle className="w-4 h-4" /> Reject Request
      </button>
    </div>
  );
}

/* ──── Timeline ──── */
function TimelineSection({ req }: any) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Trail ({req.events.length})</p>
      {req.events.map((ev: any) => (
        <div key={ev.id} className="flex gap-3 items-start">
          <div className="w-2 h-2 bg-slate-300 rounded-full mt-1.5 shrink-0" />
          <div>
            <p className="text-xs font-black text-slate-900">{ev.action}</p>
            <p className="text-[9px] text-slate-400 font-bold">{ev.performedBy} • {new Date(ev.createdAt).toLocaleString()}</p>
            {ev.note && <p className="text-[10px] text-slate-500 font-medium mt-0.5">{ev.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
