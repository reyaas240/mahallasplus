"use client";
import { useState, useEffect } from "react";
import {
  Search, Plus, Loader2, X, Calendar, ArrowDownRight, ShieldCheck,
  FileText, Users, ClipboardList, CheckCircle2, XCircle, Banknote,
  Eye, Trash2, Edit3, User, Building2, Paperclip, Clock
} from "lucide-react";
import {
  createFundRequest, getFundRequests, deleteFundRequest,
  searchFamilyMembers, getFundDistributionStats
} from "@/app/actions/fundRequests";
import { getFinancialSettings } from "@/app/actions/committee";
import { FundRequestDetailModal } from "./FundRequestDetailModal";
import { QRCallButton } from "@/components/QRCallButton";
import { getRequestCategories, getProjectMasters } from "@/app/actions/masters";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  RECEIVED: { label: "Received", color: "bg-slate-100 text-slate-700" },
  UNDER_VERIFICATION: { label: "Verifying", color: "bg-amber-100 text-amber-700" },
  UNDER_DISCUSSION: { label: "Discussion", color: "bg-blue-100 text-blue-700" },
  UNDER_INVESTIGATION: { label: "Investigating", color: "bg-purple-100 text-purple-700" },
  INQUIRY_SCHEDULED: { label: "Inquiry", color: "bg-indigo-100 text-indigo-700" },
  APPROVED: { label: "Approved", color: "bg-emerald-100 text-emerald-700" },
  REJECTED: { label: "Rejected", color: "bg-rose-100 text-rose-700" },
  ON_GOING: { label: "On-Going", color: "bg-blue-600 text-white shadow-sm" },
  DISBURSED: { label: "Disbursed", color: "bg-teal-100 text-teal-700" },
};

export function FundDistributionManager({ committeeId, terms }: { committeeId: string; terms: any[] }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [distStats, setDistStats] = useState({ totalDisbursed: 0, activeRequests: 0, approvedPending: 0 });
  const [settings, setSettings] = useState({ currency: "LKR", decimals: 2 });
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [viewFilter, setViewFilter] = useState<"active" | "ongoing" | "completed" | "hold" | "rejected">("active");
  const [searchQuery, setSearchQuery] = useState("");

  const currentTerm = terms.find((t) => t.status === "ACTIVE") || terms[0];

  const formatValue = (val: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: settings.decimals, maximumFractionDigits: settings.decimals }).format(val);

  useEffect(() => {
    async function load() {
      const [reqs, s, ds] = await Promise.all([
        getFundRequests(committeeId, currentTerm?.id),
        getFinancialSettings(),
        getFundDistributionStats(committeeId, currentTerm?.id),
      ]);
      setRequests(reqs);
      setSettings(s);
      setDistStats(ds);
    }
    load();
  }, [committeeId, currentTerm?.id, showNewRequest, selectedRequest]);

  const filtered = requests.filter((r) => {
    // Status Filter
    let statusMatch = true;
    if (viewFilter === "active") statusMatch = !["DISBURSED", "REJECTED", "ON_HOLD", "ON_GOING"].includes(r.status);
    else if (viewFilter === "ongoing") statusMatch = r.status === "ON_GOING";
    else if (viewFilter === "completed") statusMatch = r.status === "DISBURSED";
    else if (viewFilter === "hold") statusMatch = r.status === "ON_HOLD";
    else if (viewFilter === "rejected") statusMatch = r.status === "REJECTED";

    if (!statusMatch) return false;

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = r.beneficiaryType === "INTERNAL" ? r.familyMember?.fullName || "" : r.externalName || "";
      const nic = r.familyMember?.nic || "";
      const ref = r.letterRefNo || "";
      
      return (
        name.toLowerCase().includes(q) ||
        nic.toLowerCase().includes(q) ||
        ref.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setViewFilter("active")}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewFilter === "active" ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}
            >
              <ClipboardList className="w-3.5 h-3.5 inline mr-2" />Active
            </button>
            <button
              onClick={() => setViewFilter("ongoing")}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewFilter === "ongoing" ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}
            >
              <Clock className="w-3.5 h-3.5 inline mr-2" />On-Going
            </button>
            <button
              onClick={() => setViewFilter("hold")}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewFilter === "hold" ? "bg-amber-500 text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}
            >
              <Clock className="w-3.5 h-3.5 inline mr-2" />On Hold
            </button>
            <button
              onClick={() => setViewFilter("completed")}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewFilter === "completed" ? "bg-teal-600 text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-2" />Completed
            </button>
            <button
              onClick={() => setViewFilter("rejected")}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewFilter === "rejected" ? "bg-rose-500 text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}
            >
              <XCircle className="w-3.5 h-3.5 inline mr-2" />Rejected
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Disbursed</p>
              <p className="text-sm font-black text-slate-900">{settings.currency} {formatValue(distStats.totalDisbursed)}</p>
            </div>
            <button
              onClick={() => setShowNewRequest(true)}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Request
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Letter Ref No, Beneficiary Name, or NIC/ID..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              No {viewFilter} fund requests
            </p>
          </div>
        ) : (
          filtered.map((r) => {
            const st = STATUS_MAP[r.status] || STATUS_MAP.RECEIVED;
            const name = r.beneficiaryType === "INTERNAL" ? r.familyMember?.fullName || "Member" : r.externalName || "External";
            return (
              <div key={r.id} className="p-6 flex justify-between items-center hover:bg-slate-50/30 transition-all group border-b border-slate-100 last:border-0">
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${r.beneficiaryType === "INTERNAL" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                    {r.beneficiaryType === "INTERNAL" ? <User className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 uppercase tracking-wide text-sm">{name}</h4>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${st.color}`}>{st.label}</span>
                      <QRCallButton 
                        phone={r.beneficiaryType === "INTERNAL" ? r.familyMember?.phone : r.externalPhone} 
                        name={name} 
                      />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1 flex-wrap">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(r.createdAt).toLocaleDateString()}
                      {r.letterRefNo && (
                        <span className="flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2 py-1 rounded-xl border border-slate-200 text-xs font-black shadow-sm">
                          <FileText className="w-3.5 h-3.5" /> {r.letterRefNo}
                        </span>
                      )}
                      <span className="text-slate-300 mx-1">•</span> {r.purpose}
                      {r.projectName && <span className="text-blue-500">• {r.projectName}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    {r.grantedAmount ? (
                      <div className="flex flex-col items-end">
                        <p className="font-black text-emerald-700 text-lg leading-tight">{settings.currency} {formatValue(r.grantedAmount)}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {r.totalDisbursed > 0 && (
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                              Paid: {settings.currency} {formatValue(r.totalDisbursed)}
                            </span>
                          )}
                          <p className="text-[8px] font-black text-emerald-500 uppercase">{r.paymentType === "MONTHLY" ? "Per Month" : "Granted"}</p>
                        </div>
                      </div>
                    ) : r.requestedAmount ? (
                      <div className="flex flex-col items-end">
                        <p className="font-black text-slate-500 text-sm">{settings.currency} {formatValue(r.requestedAmount)}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase">Requested</p>
                      </div>
                    ) : (
                      <p className="text-[9px] font-black text-slate-300 uppercase">No amount</p>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => setSelectedRequest(r)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
                    {r.status !== "DISBURSED" && (
                      <button
                        onClick={async () => {
                          if (confirm("Delete this fund request? This cannot be undone.")) {
                            await deleteFundRequest(r.id);
                            setRequests((prev) => prev.filter((x) => x.id !== r.id));
                          }
                        }}
                        className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showNewRequest && (
        <NewFundRequestModal
          committeeId={committeeId}
          termId={currentTerm?.id}
          settings={settings}
          onClose={() => setShowNewRequest(false)}
        />
      )}
      {selectedRequest && (
        <FundRequestDetailModal
          requestId={selectedRequest.id}
          settings={settings}
          members={currentTerm?.members || []}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}

// ────────────────── New Request Modal ──────────────────

function NewFundRequestModal({ committeeId, termId, settings, onClose }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [benType, setBenType] = useState<"INTERNAL" | "EXTERNAL">("INTERNAL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [amountDisplay, setAmountDisplay] = useState("");
  const [purpose, setPurpose] = useState("");
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    getRequestCategories(committeeId).then(setCategories);
    getProjectMasters(committeeId).then(setProjects);
  }, [committeeId]);

  useEffect(() => {
    if (benType !== "INTERNAL" || searchQuery.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      const res = await searchFamilyMembers(searchQuery);
      setSearchResults(res);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, benType]);

  const handleAddFiles = (files: FileList | null) => {
    if (!files) return;
    setAttachments(prev => [...prev, ...Array.from(files)]);
  };

  const removeFile = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    
    let filePaths: string[] = [];
    if (attachments.length > 0) {
      const { uploadFundRequestAttachments } = await import("@/app/actions/upload");
      const fd = new FormData();
      attachments.forEach(f => fd.append("files", f));
      const uploadRes = await uploadFundRequestAttachments(fd);
      if (uploadRes.success) {
        filePaths = uploadRes.paths || [];
      }
    }

    const fd = new FormData(form);
    const res = await createFundRequest({
      committeeId,
      committeeTermId: termId,
      beneficiaryType: benType,
      familyMemberId: selectedMember?.id || null,
      externalName: fd.get("externalName"),
      externalPhone: fd.get("externalPhone"),
      externalAddress: fd.get("externalAddress"),
      purpose: purpose,
      description: fd.get("description"),
      requestedAmount: fd.get("requestedAmount"),
      projectName: projectName,
      letterRefNo: fd.get("letterRefNo"),
      attachments: filePaths,
    });
    setIsSubmitting(false);
    if (res.success) onClose();
    else alert(res.error);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[98vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
              <ArrowDownRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">New Fund Request</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Distribution Intake</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 rounded-xl hover:text-rose-600 transition-all border border-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* Beneficiary Type Toggle */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
            {(["INTERNAL", "EXTERNAL"] as const).map((t) => (
              <button key={t} type="button" onClick={() => { setBenType(t); setSelectedMember(null); setSearchQuery(""); }}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${benType === t ? "bg-white text-slate-900 shadow-md" : "text-slate-400"}`}>
                {t === "INTERNAL" ? <User className="w-3.5 h-3.5 inline mr-1" /> : <Building2 className="w-3.5 h-3.5 inline mr-1" />}
                {t === "INTERNAL" ? "Mahalla Member" : "External"}
              </button>
            ))}
          </div>

          {/* Internal: Member Search */}
          {benType === "INTERNAL" && (
            <div>
              {selectedMember ? (
                <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black">{selectedMember.fullName.charAt(0)}</div>
                    <div>
                      <p className="font-black text-slate-900 text-xs uppercase">{selectedMember.fullName}</p>
                      <p className="text-[9px] text-slate-500 font-bold">Card: {selectedMember.familyCard?.mainMahallaCardNo || "N/A"} • {selectedMember.familyCard?.subMahalla?.name}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setSelectedMember(null); setSearchQuery(""); }} className="text-rose-500 hover:text-rose-700"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search member by name or NIC..."
                    className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-slate-300 rounded-2xl font-bold text-slate-900 text-xs placeholder-slate-500" />
                  {searchResults.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border-2 border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                      {searchResults.map((m) => (
                        <button key={m.id} type="button" onClick={() => { setSelectedMember(m); setSearchResults([]); setSearchQuery(""); }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 border-b border-slate-100 last:border-0">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-black text-xs">{m.fullName.charAt(0)}</div>
                          <div>
                            <p className="font-black text-slate-900 text-[11px] uppercase">{m.fullName}</p>
                            <p className="text-[9px] text-slate-500">{m.familyCard?.subMahalla?.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* External: Name / Phone / Address */}
          {benType === "EXTERNAL" && (
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-6">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Name</label>
                <input name="externalName" required className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs" />
              </div>
              <div className="col-span-6">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Phone</label>
                <input name="externalPhone" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs" />
              </div>
              <div className="col-span-12">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Address</label>
                <input name="externalAddress" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs" />
              </div>
            </div>
          )}

          {/* Purpose / Project / Amount / Letter Ref */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-6">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Purpose</label>
              <select name="purpose" required value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 text-[10px] uppercase">
                <option value="">-- Select Category --</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-6">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Project (Optional)</label>
              <select name="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 text-[10px] uppercase">
                <option value="">-- Select Project --</option>
                {projects.map((p: any) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-4">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Requested Amount ({settings.currency})</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-[10px]">{settings.currency}</span>
                <input
                  value={amountDisplay}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9.]/g, "");
                    setAmountDisplay(raw ? Number(raw).toLocaleString("en-US") : "");
                  }}
                  className="w-full pl-14 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 text-xs"
                />
                <input type="hidden" name="requestedAmount" value={amountDisplay.replace(/,/g, "")} />
              </div>
            </div>
            <div className="col-span-4">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Letter Ref No</label>
              <input name="letterRefNo" placeholder="REF-001" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs placeholder-slate-400" />
            </div>
            <div className="col-span-4">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Attachments</label>
              <div className="relative group cursor-pointer">
                <input type="file" multiple onChange={(e) => handleAddFiles(e.target.files)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className={`w-full px-4 py-3 border-2 border-dashed rounded-xl flex items-center gap-2 transition-all ${attachments.length > 0 ? "bg-emerald-50 border-emerald-500" : "bg-slate-50 border-slate-300 group-hover:border-blue-400"}`}>
                  {attachments.length > 0 ? <FileText className="w-3 h-3 text-emerald-600" /> : <Paperclip className="w-3 h-3 text-slate-400" />}
                  <span className={`text-[9px] font-black uppercase truncate ${attachments.length > 0 ? "text-emerald-700" : "text-slate-400"}`}>
                    {attachments.length > 0 ? `${attachments.length} file(s)` : "Add Files"}
                  </span>
                </div>
              </div>
            </div>

            {/* Attached files list */}
            {attachments.length > 0 && (
              <div className="col-span-12 flex flex-wrap gap-2">
                {attachments.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                    <FileText className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="text-[9px] font-bold text-emerald-800 truncate max-w-[120px]">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-rose-400 hover:text-rose-600"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="col-span-12">
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Description</label>
              <textarea name="description" rows={2} placeholder="Brief details about the request..."
                className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs placeholder-slate-400 resize-none" />
            </div>
          </div>

          <button disabled={isSubmitting || (benType === "INTERNAL" && !selectedMember)}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all flex justify-center items-center gap-2 shadow-xl active:scale-95 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ArrowDownRight className="w-4 h-4" /> Submit Request</>}
          </button>
        </form>
      </div>
    </div>
  );
}

