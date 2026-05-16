"use client";
import { useState, useEffect } from "react";
import { getProxiedImageUrl } from "@/lib/utils";
import { X, Loader2, ShieldCheck, Users, Calendar, FileText, Banknote, CheckCircle2, XCircle, Clock, Plus, Paperclip, User, Building2, ChevronDown, Search, Trash2, Edit3, Image as ImageIcon, Eye } from "lucide-react";
import { getFundRequestDetail, verifyBeneficiary, addInvestigation, updateInvestigation, deleteInvestigation, scheduleAppointment, updateAppointmentOutcome, addQuotation, approveFundRequest, rejectFundRequest, disburseFunds } from "@/app/actions/fundRequests";
import { uploadInvestigationImages } from "@/app/actions/upload";
import { resizeImage } from "@/lib/imageResize";
import { QRCallButton } from "@/components/QRCallButton";
import { getRequestCategories, getProjectMasters } from "@/app/actions/masters";

export function FundRequestDetailModal({ requestId, settings, members, onClose, isReadOnly }: any) {
  const [req, setReq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const load = async () => { setLoading(true); const d = await getFundRequestDetail(requestId); setReq(d); setLoading(false); };
  useEffect(() => { load(); }, [requestId]);

  const fmt = (v: number) => new Intl.NumberFormat("en-US", { minimumFractionDigits: settings.decimals, maximumFractionDigits: settings.decimals }).format(v);

  if (loading || !req) return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>
  );

  const name = req.beneficiaryType === "INTERNAL" ? req.familyMember?.fullName || "Member" : req.externalName || "External";
  const tabs = ["overview", "investigation", "appointments", "quotations", "decision"];
  const isLocked = isReadOnly || ["DISBURSED", "APPROVED", "REJECTED", "ON_HOLD", "ON_GOING"].includes(req.status);
  
  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    RECEIVED: { label: "Received", color: "bg-slate-100 text-slate-700" },
    UNDER_VERIFICATION: { label: "Verifying", color: "bg-amber-100 text-amber-700" },
    UNDER_DISCUSSION: { label: "Discussion", color: "bg-blue-100 text-blue-700" },
    UNDER_INVESTIGATION: { label: "Investigating", color: "bg-purple-100 text-purple-700" },
    INQUIRY_SCHEDULED: { label: "Inquiry", color: "bg-indigo-100 text-indigo-700" },
    APPROVED: { label: "Approved", color: "bg-emerald-100 text-emerald-700" },
    REJECTED: { label: "Rejected", color: "bg-rose-100 text-rose-700" },
    ON_GOING: { label: "On-Going", color: "bg-blue-600 text-white" },
    DISBURSED: { label: "Disbursed", color: "bg-teal-100 text-teal-700" },
    ON_HOLD: { label: "On Hold", color: "bg-amber-500 text-white" },
  };

  const currentStatus = STATUS_MAP[req.status] || { label: req.status, color: "bg-slate-100 text-slate-700" };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-[1100px] max-w-[95vw] shadow-2xl flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0 rounded-t-[40px]">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${req.beneficiaryType === "INTERNAL" ? "bg-blue-600 text-white" : "bg-amber-500 text-white"}`}>{name.charAt(0)}</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{name}</h3>
                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${currentStatus.color}`}>
                  {currentStatus.label}
                </span>
                <QRCallButton 
                  phone={req.beneficiaryType === "INTERNAL" ? req.familyMember?.phone : req.externalPhone} 
                  name={name} 
                />
              </div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">{req.purpose} {req.project?.name ? `• ${req.project.name}` : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isReadOnly && !isLocked && (
              <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 rounded-xl hover:text-blue-600 transition-all border border-slate-100 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3">
                <Edit3 className="w-4 h-4" /> Edit
              </button>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 rounded-xl hover:text-rose-600 transition-all border border-slate-100"><X className="w-5 h-5" /></button>
          </div>
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
              {activeSection === "overview" && <OverviewSection req={req} settings={settings} fmt={fmt} onRefresh={load} setLightbox={setLightbox} isLocked={isLocked} />}
              {activeSection === "investigation" && <InvestigationSection req={req} members={members} onRefresh={load} setLightbox={setLightbox} isLocked={isLocked} />}
              {activeSection === "appointments" && <AppointmentSection req={req} onRefresh={load} isLocked={isLocked} />}
              {activeSection === "quotations" && <QuotationSection req={req} onRefresh={load} setLightbox={setLightbox} isLocked={isLocked} />}
              {activeSection === "decision" && <DecisionSection req={req} settings={settings} members={members} fmt={fmt} onRefresh={load} setLightbox={setLightbox} isReadOnly={isReadOnly} />}
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

      {isEditing && <EditRequestModal req={req} settings={settings} onRefresh={load} onClose={() => setIsEditing(false)} />}
      
      {/* Shared Lightbox Modal */}
      {lightbox && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all">
            <X className="w-6 h-6" />
          </button>
          <img src={getProxiedImageUrl(lightbox)} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

function EditRequestModal({ req, settings, onRefresh, onClose }: any) {
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [attachments, setAttachments] = useState<string[]>(req.attachments || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [purpose, setPurpose] = useState(req.purpose || "");
  const [projectId, setProjectId] = useState(req.projectId || "");
  const [amountDisplay, setAmountDisplay] = useState(req.requestedAmount ? Number(req.requestedAmount).toLocaleString("en-US") : "");

  useEffect(() => {
    getRequestCategories(req.committeeId).then(setCategories);
    getProjectMasters(req.committeeId).then(setProjects);
  }, [req.committeeId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitting(true);
    
    let finalAttachments = [...attachments];

    // Upload new files if any
    if (newFiles.length > 0) {
      const { uploadFundRequestAttachments } = await import("@/app/actions/upload");
      const fd = new FormData();
      newFiles.forEach(f => fd.append("files", f));
      const uploadRes = await uploadFundRequestAttachments(fd);
      if (uploadRes.success) {
        finalAttachments = [...finalAttachments, ...(uploadRes.paths || [])];
      }
    }

    const fd = new FormData(form);
    const payload = {
      purpose: purpose,
      projectId: projectId,
      description: fd.get("description"),
      requestedAmount: fd.get("requestedAmount"),
      externalName: fd.get("externalName"),
      externalPhone: fd.get("externalPhone"),
      externalAddress: fd.get("externalAddress"),
      letterRefNo: fd.get("letterRefNo"),
      attachments: finalAttachments,
    };

    const { updateFundRequest } = await import("@/app/actions/fundRequests");
    const res = await updateFundRequest(req.id, payload);
    if (res.success) {
      await onRefresh();
      onClose();
    } else {
      alert(res.error);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this fund request? This cannot be undone.")) return;
    setDeleting(true);
    const { deleteFundRequest } = await import("@/app/actions/fundRequests");
    const res = await deleteFundRequest(req.id);
    if (res.success) {
      window.location.reload(); // Hard refresh to clear modal and update list
    } else {
      alert(res.error);
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] w-[600px] max-w-full shadow-2xl p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Edit Fund Request</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Purpose / Category</p>
              <select name="purpose" required value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 text-[10px] uppercase focus:border-blue-500 outline-none transition-all">
                <option value="">-- Select --</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                {req.purpose && !categories.find((c: any) => c.name === req.purpose) && (
                  <option value={req.purpose}>{req.purpose}</option>
                )}
              </select>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Project (Optional)</p>
              <select name="projectId" value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 text-[10px] uppercase focus:border-blue-500 outline-none transition-all">
                <option value="">-- Select --</option>
                {projects.filter(p => p.isActive || p.id === req.projectId).map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Description</p>
            <textarea name="description" rows={3} defaultValue={req.description} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 text-xs focus:border-blue-500 outline-none transition-all resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Requested Amount ({settings.currency})</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-[10px]">{settings.currency}</span>
                <input
                  value={amountDisplay}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9.]/g, "");
                    setAmountDisplay(raw ? Number(raw).toLocaleString("en-US") : "");
                  }}
                  className="w-full pl-14 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-slate-900 text-xs focus:border-blue-500 outline-none transition-all"
                />
                <input type="hidden" name="requestedAmount" value={amountDisplay.replace(/,/g, "")} />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Letter Ref No</p>
              <input name="letterRefNo" defaultValue={req.letterRefNo} placeholder="REF-001" className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 text-xs focus:border-blue-500 outline-none transition-all placeholder-slate-400" />
            </div>
          </div>

          {req.beneficiaryType === "EXTERNAL" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">External Name</p>
                <input name="externalName" defaultValue={req.externalName} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 text-xs focus:border-blue-500 outline-none transition-all" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">External Phone</p>
                <input name="externalPhone" defaultValue={req.externalPhone} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 text-xs focus:border-blue-500 outline-none transition-all" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">External Address</p>
                <input name="externalAddress" defaultValue={req.externalAddress} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 text-xs focus:border-blue-500 outline-none transition-all" />
              </div>
            </div>
          )}

          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Manage Attachments</p>
            <div className="flex flex-wrap gap-2">
              {attachments.map((path, i) => (
                <div key={i} className="relative group">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                    {/\.(jpg|jpeg|png|webp|gif)$/i.test(path) ? <img src={getProxiedImageUrl(path)} className="w-full h-full object-cover" /> : <FileText className="w-5 h-5 text-slate-400" />}
                  </div>
                  <button type="button" onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {newFiles.map((file, i) => (
                <div key={i} className="relative group">
                  <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center overflow-hidden italic text-[8px] text-blue-600 font-bold p-1 text-center">
                    New File
                  </div>
                  <button type="button" onClick={() => setNewFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center cursor-pointer">
                <input type="file" multiple className="hidden" onChange={e => setNewFiles(prev => [...prev, ...Array.from(e.target.files || [])])} />
                <Plus className="w-5 h-5 text-slate-300" />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleDelete} disabled={deleting} className="px-6 py-4 bg-rose-50 text-rose-600 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete Request
            </button>
            <div className="flex-1 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
              <button type="submit" disabled={submitting} className="flex-[2] py-4 bg-blue-600 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all disabled:opacity-50">
                {submitting ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ──── Overview ──── */
function OverviewSection({ req, settings, fmt, onRefresh, setLightbox }: any) {
  const [verifying, setVerifying] = useState(false);
  const handleVerify = async () => { setVerifying(true); await verifyBeneficiary(req.id); await onRefresh(); setVerifying(false); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <InfoCard label="Status" value={req.status.replace(/_/g, " ")} />
        <InfoCard label="Type" value={req.beneficiaryType} />
        {req.letterRefNo && <InfoCard label="Letter Ref No" value={req.letterRefNo} />}
        <InfoCard label="Purpose" value={req.purpose} />
        {req.project?.name && <InfoCard label="Project" value={req.project.name} />}
        <InfoCard label="Requested" value={req.requestedAmount ? `${settings.currency} ${fmt(req.requestedAmount)}` : "—"} />
        <InfoCard label="Granted" value={req.grantedAmount ? `${settings.currency} ${fmt(req.grantedAmount)}` : "—"} />
        {req.totalDisbursed > 0 && <InfoCard label="Total Disbursed" value={`${settings.currency} ${fmt(req.totalDisbursed)}`} />}
        {req.description && <div className="col-span-2"><InfoCard label="Description" value={req.description} /></div>}
      </div>

      {req.attachments && req.attachments.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Original Attachments</p>
          <div className="grid grid-cols-2 gap-3">
            {req.attachments.map((path: string, i: number) => {
              const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(path);
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 transition-all group shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      {isImg ? <ImageIcon className="w-4 h-4 text-blue-500" /> : <Paperclip className="w-4 h-4 text-slate-400" />}
                    </div>
                    <span className="text-[10px] font-black text-slate-600 truncate uppercase tracking-tight">{path.split('/').pop()}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => isImg ? setLightbox(path) : window.open(path, '_blank')} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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

/* ──── Reusable Member Select ──── */
function MemberSelect({ label, members, selected, onToggle, placeholder = "Select members..." }: any) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = (members || []).filter((m: any) => {
    const name = m.familyMember?.fullName || "Member";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="relative">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">{label}</p>
      <div 
        onClick={() => setOpen(!open)}
        className="w-full min-h-[48px] px-4 py-2 bg-white border-2 border-slate-300 rounded-xl cursor-pointer flex flex-wrap gap-2 items-center justify-between transition-all hover:border-purple-400 shadow-sm"
      >
        <div className="flex flex-wrap gap-1.5 items-center">
          {selected.length === 0 && <span className="text-slate-400 font-bold text-xs px-1">{placeholder}</span>}
          {selected.map((name: string) => (
            <div key={name} className="bg-slate-900 text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 shadow-sm">
              {name}
              <X onClick={(e) => { e.stopPropagation(); onToggle(name); }} className="w-2.5 h-2.5 cursor-pointer hover:text-white/70" />
            </div>
          ))}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute z-[100] left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input autoFocus placeholder="Search..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-900 outline-none focus:border-purple-400"
                  value={search} onChange={(e) => setSearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
              </div>
            </div>
            <div className="max-h-[160px] overflow-y-auto custom-scrollbar">
              {filtered.map((m: any) => {
                const name = m.familyMember?.fullName || "Member";
                const isSelected = selected.includes(name);
                return (
                  <button key={m.id} type="button" onClick={(e) => { e.stopPropagation(); onToggle(name); }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors ${isSelected ? "bg-purple-50/40" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${isSelected ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-500"}`}>{name.charAt(0)}</div>
                      <span className={`text-[10px] font-black uppercase tracking-tight ${isSelected ? "text-purple-700" : "text-slate-600"}`}>{name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ──── Investigation ──── */
function InvestigationSection({ req, members, onRefresh, setLightbox, isLocked }: any) {
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [investigators, setInvestigators] = useState<string[]>([]);
  const [attended, setAttended] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<File[]>([]);

  const toggleInv = (name: string) => setInvestigators(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  const toggleAtt = (name: string) => setAttended(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  const handleEdit = (inv: any) => {
    setEditId(inv.id);
    setInvestigators(inv.investigators.split(", "));
    setAttended(inv.attendedMembers ? inv.attendedMembers.split(", ") : []);
    setAttachments(inv.attachments || []);
    setPreviewImages([]);
    setShow(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setUploading(true);
    try {
      const resizedFiles = await Promise.all(files.map(f => resizeImage(f, 1)));
      setPreviewImages(prev => [...prev, ...resizedFiles]);
    } catch (err) {
      console.error("Resize error:", err);
      alert("Failed to process some images");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (investigators.length === 0) { alert("Select at least one investigator"); return; }
    setSubmitting(true);

    try {
      // 1. Upload new images if any
      let finalAttachments = [...attachments];
      if (previewImages.length > 0) {
        const fd = new FormData();
        previewImages.forEach(f => fd.append("images", f));
        const res = await uploadInvestigationImages(fd);
        if (res.success) finalAttachments = [...finalAttachments, ...(res.paths || [])];
      }

      const fd = new FormData(form);
      const payload = {
        fundRequestId: req.id,
        investigators: investigators.join(", "),
        visitDate: fd.get("visitDate")?.toString(),
        findings: fd.get("findings")?.toString(),
        actualVisitDate: fd.get("actualVisitDate")?.toString() || null,
        attendedMembers: attended.length > 0 ? attended.join(", ") : null,
        attachments: finalAttachments,
      };

      if (editId) await updateInvestigation(editId, payload);
      else await addInvestigation(payload);

      await onRefresh();
      setSubmitting(false); setShow(false); setEditId(null); setInvestigators([]); setAttended([]); setAttachments([]); setPreviewImages([]);
    } catch (err) {
      console.error(err);
      alert("Failed to save investigation");
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this investigation record?")) {
      await deleteInvestigation(id);
      await onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Investigations ({req.investigations.length})</p>
        {!isLocked && (
          <button onClick={() => { setShow(!show); setEditId(null); setInvestigators([]); setAttended([]); setAttachments([]); setPreviewImages([]); }} 
            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-700 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add Investigation
          </button>
        )}
      </div>

      {show && (
        <form onSubmit={handleAdd} className="p-6 bg-purple-50 border-2 border-purple-200 rounded-[32px] space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <MemberSelect label="Assigned Investigators" members={members} selected={investigators} onToggle={toggleInv} />
            <MemberSelect label="Actually Attended" members={members} selected={attended} onToggle={toggleAtt} placeholder="Optional..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Planned Date</p>
              <input name="visitDate" type="date" required 
                defaultValue={editId ? (new Date(req.investigations.find((i:any)=>i.id===editId)?.visitDate)).toISOString().split('T')[0] : ""} 
                className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs shadow-sm" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Actual Visit Date</p>
              <input name="actualVisitDate" type="date" 
                defaultValue={(() => {
                  const inv = req.investigations.find((i:any)=>i.id===editId);
                  return inv?.actualVisitDate ? new Date(inv.actualVisitDate).toISOString().split('T')[0] : "";
                })()}
                className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs shadow-sm" />
            </div>
          </div>

          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Findings & Report</p>
            <textarea name="findings" required placeholder="Describe the findings..." rows={3} 
              defaultValue={editId ? req.investigations.find((i:any)=>i.id===editId)?.findings : ""}
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs resize-none shadow-sm" />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Capture / Upload Images</p>
            <div className="flex flex-wrap gap-2">
              {/* Existing Images */}
              {attachments.map((path, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group border-2 border-white shadow-sm">
                  <img src={getProxiedImageUrl(path)} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} 
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {/* Previews of new files */}
              {previewImages.map((file, i) => {
                const isHeic = file.name.toLowerCase().endsWith(".heic") || file.type === "image/heic";
                return (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group border-2 border-purple-400 shadow-sm animate-in zoom-in-95 bg-slate-50">
                    {isHeic ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-purple-600">
                        <ImageIcon className="w-6 h-6 mb-1" />
                        <span className="text-[8px] font-black uppercase">HEIC File</span>
                      </div>
                    ) : (
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-purple-600/20" />
                    <button type="button" onClick={() => setPreviewImages(prev => prev.filter((_, idx) => idx !== i))} 
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                <input type="file" multiple accept="image/*,.heic,.HEIC" className="hidden" onChange={handleFileChange} disabled={uploading} />
                {uploading ? <Loader2 className="w-5 h-5 text-purple-600 animate-spin" /> : <ImageIcon className="w-5 h-5 text-slate-400" />}
                <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Add Image</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => { setShow(false); setEditId(null); }} className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-300 transition-all">Cancel</button>
            <button disabled={submitting || investigators.length === 0 || uploading} className="flex-[2] py-3 bg-purple-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 shadow-lg shadow-purple-200 transition-all active:scale-[0.98]">
              {submitting ? "Processing..." : editId ? "Update Investigation" : "Save Investigation"}
            </button>
          </div>
        </form>
      )}

      {req.investigations.map((inv: any) => (
        <div key={inv.id} className="p-5 bg-white border border-slate-200 rounded-[32px] space-y-3 group hover:border-purple-200 transition-all shadow-sm hover:shadow-md">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Assigned Group</p>
                <div className="flex flex-wrap gap-1">
                  {inv.investigators.split(", ").map((name: string) => (
                    <span key={name} className="bg-slate-100 text-slate-600 text-[8px] font-black px-2 py-0.5 rounded-lg uppercase">{name}</span>
                  ))}
                </div>
              </div>
              {inv.attendedMembers && (
                <div>
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Attended By
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {inv.attendedMembers.split(", ").map((name: string) => (
                      <span key={name} className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded-lg uppercase">{name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(inv.visitDate).toLocaleDateString()}</p>
              {!isLocked && (
                <div className="flex gap-1 justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(inv)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(inv.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <p className="text-[11px] text-slate-700 font-medium leading-relaxed italic">"{inv.findings}"</p>
          </div>

          {/* Image Gallery */}
          {inv.attachments && inv.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {inv.attachments.map((path: string, i: number) => (
                <div key={i} onClick={() => setLightbox(path)} className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:border-purple-400 transition-all">
                  <img src={getProxiedImageUrl(path)} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-1">
            <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{inv.attachments?.length || 0} Images attached</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──── Appointments ──── */
function AppointmentSection({ req, onRefresh, isLocked }: any) {
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
        {!isLocked && (
          <button onClick={() => setShow(!show)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 flex items-center gap-1"><Plus className="w-3 h-3" /> Schedule</button>
        )}
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
          {!isLocked && !a.outcome && (
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
function QuotationSection({ req, onRefresh, setLightbox, isLocked }: any) {
  const [show, setShow] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [attachments, setAttachments] = useState<string[]>([]);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [isGranted, setIsGranted] = useState(false);

  const handleEdit = (q: any) => {
    setEditId(q.id);
    setAttachments(q.attachments || []);
    setIsGranted(q.isGranted || false);
    setPreviewFiles([]);
    setShow(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPreviewFiles(prev => [...prev, ...files]);
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitting(true);

    let finalAttachments = [...attachments];
    if (previewFiles.length > 0) {
      setUploading(true);
      const { uploadFundRequestAttachments } = await import("@/app/actions/upload");
      const fd = new FormData();
      previewFiles.forEach(f => fd.append("files", f));
      const res = await uploadFundRequestAttachments(fd);
      if (res.success) finalAttachments = [...finalAttachments, ...(res.paths || [])];
      setUploading(false);
    }

    const fd = new FormData(form);
    const data = {
      fundRequestId: req.id,
      vendor: fd.get("vendor"),
      amount: fd.get("amount"),
      description: fd.get("description"),
      attachments: finalAttachments,
      isGranted: isGranted,
    };

    const { addQuotation, updateQuotation } = await import("@/app/actions/fundRequests");
    const res = editId ? await updateQuotation(editId, data) : await addQuotation(data);
    
    if (res.success) {
      setShow(false);
      setEditId(null);
      setPreviewFiles([]);
      await onRefresh();
    } else {
      alert(res.error);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const { deleteQuotation } = await import("@/app/actions/fundRequests");
    await deleteQuotation(id);
    await onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quotations ({req.quotations.length})</p>
        {!isLocked && (
          <button onClick={() => { setShow(!show); setEditId(null); setAttachments([]); setPreviewFiles([]); }} className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-100">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>

      {show && (
        <form onSubmit={handleAdd} className="p-6 bg-teal-50 border-2 border-teal-200 rounded-[32px] space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Vendor Name</p>
              <input name="vendor" required defaultValue={editId ? req.quotations.find((q:any)=>q.id===editId)?.vendor : ""} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs shadow-sm" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Total Amount</p>
              <input name="amount" type="number" step="0.01" required defaultValue={editId ? req.quotations.find((q:any)=>q.id===editId)?.amount : ""} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs shadow-sm" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-1">
            <input type="checkbox" id="isGranted" checked={isGranted} onChange={e => setIsGranted(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
            <label htmlFor="isGranted" className="text-[10px] font-black text-slate-600 uppercase tracking-tight cursor-pointer">Mark as Granted (Selected Quotation)</label>
          </div>

          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Description / Notes</p>
            <textarea name="description" rows={2} defaultValue={editId ? req.quotations.find((q:any)=>q.id===editId)?.description : ""} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs resize-none shadow-sm" />
          </div>

          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Attachments (Files/Images)</p>
            <div className="flex flex-wrap gap-2">
              {attachments.map((path, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden group border border-teal-200 bg-white shadow-sm">
                   {/\.(jpg|jpeg|png|webp|gif)$/i.test(path) ? <img src={getProxiedImageUrl(path)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-teal-600 font-bold text-[8px]">FILE</div>}
                  <button type="button" onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5" /></button>
                </div>
              ))}
              {previewFiles.map((file, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden bg-teal-100 border-2 border-teal-300 flex items-center justify-center italic text-[8px] text-teal-700 font-bold p-1 text-center shadow-sm">
                  New File
                  <button type="button" onClick={() => setPreviewFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg"><X className="w-2.5 h-2.5" /></button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-xl border-2 border-dashed border-teal-300 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all">
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                <Paperclip className="w-4 h-4 text-teal-400" />
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setShow(false)} className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-300 transition-all">Cancel</button>
            <button disabled={submitting || uploading} className="flex-[2] py-3 bg-teal-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 shadow-lg shadow-teal-200 transition-all active:scale-95">
              {submitting ? "Processing..." : editId ? "Update Quotation" : "Save Quotation"}
            </button>
          </div>
        </form>
      )}

      {req.quotations.map((q: any) => (
        <div key={q.id} className="p-5 bg-white border border-slate-200 rounded-[32px] group hover:border-teal-200 transition-all shadow-sm hover:shadow-md space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="pr-20">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-black text-slate-900 text-xs uppercase tracking-tight">{q.vendor}</p>
                {q.isGranted && (
                  <span className="bg-teal-100 text-teal-700 text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Selected</span>
                )}
              </div>
              {q.description && <p className="text-[9px] text-slate-500 font-bold leading-tight">{q.description}</p>}
            </div>
            <div className="text-right">
              <p className="font-black text-slate-900 text-sm tracking-tight">{q.amount.toLocaleString()}</p>
              {!isLocked && (
                <div className="flex gap-1 justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(q)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
          </div>
          {q.attachments && q.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-50 mt-1">
              {q.attachments.map((path: string, i: number) => {
                const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(path);
                return (
                  <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl group/item hover:bg-white transition-all">
                    <span className="text-[8px] font-black text-slate-400 truncate max-w-[80px] uppercase tracking-tighter">{path.split('/').pop()}</span>
                    <button onClick={() => isImg ? setLightbox(path) : window.open(path, '_blank')} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-all">
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ──── Decision ──── */
function DecisionSection({ req, settings, members, fmt, onRefresh, setLightbox, isReadOnly }: any) {
  const latestDisbursement = req.disbursements && req.disbursements.length > 0 
    ? req.disbursements[req.disbursements.length - 1] 
    : null;

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [assigned, setAssigned] = useState<string[]>(latestDisbursement?.assignedMembers ? latestDisbursement.assignedMembers.split(", ") : []);
  const [isEditingFollowUp, setIsEditingFollowUp] = useState(false);
  const [isEditingDecision, setIsEditingDecision] = useState(false);
  const [currentAttachments, setCurrentAttachments] = useState<string[]>(latestDisbursement?.attachments || []);
  const [paymentType, setPaymentType] = useState(req.paymentType || "ONE_TIME");
  
  // Monthly calculation state
  const [startMonth, setStartMonth] = useState(req.startMonth || "");
  const [endMonth, setEndMonth] = useState(req.endMonth || "");
  const [calcDuration, setCalcDuration] = useState(req.durationMonths || 0);
  const [displayAmount, setDisplayAmount] = useState(req.grantedAmount ? req.grantedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/,/g, "");
    if (!isNaN(Number(val)) || val === "" || val === ".") {
      const parts = val.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      setDisplayAmount(parts.join("."));
    }
  };

  useEffect(() => {
    if (paymentType === "MONTHLY" && startMonth && endMonth) {
      const start = new Date(startMonth);
      const end = new Date(endMonth);
      const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
      setCalcDuration(diffMonths > 0 ? diffMonths : 0);
    } else if (paymentType === "ONE_TIME") {
      setCalcDuration(0);
    }
  }, [startMonth, endMonth, paymentType]);

  const handleEditApproved = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const { updateApprovedDecision } = await import("@/app/actions/fundRequests");
    const res = await updateApprovedDecision(req.id, { 
      grantedAmount: fd.get("grantedAmount"), 
      paymentType,
      durationMonths: calcDuration,
      startMonth,
      endMonth,
      decisionNotes: fd.get("decisionNotes") 
    });
    if (res.success) {
      await onRefresh();
      setIsEditingDecision(false);
    } else {
      alert(res.error);
    }
    setSubmitting(false);
  };

  const toggleAssigned = (name: string) => {
    setAssigned(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPreviewFiles(prev => [...prev, ...files]);
  };

  const handleApprove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const { approveFundRequest } = await import("@/app/actions/fundRequests");
    const rawAmount = displayAmount.replace(/,/g, "");
    const res = await approveFundRequest(req.id, { 
      grantedAmount: rawAmount, 
      paymentType,
      durationMonths: calcDuration,
      startMonth,
      endMonth,
      decisionNotes: fd.get("decisionNotes") 
    });
    if (res.success) {
      await onRefresh();
    } else {
      alert(res.error);
    }
    setSubmitting(false);
  };

  const handleHold = async () => {
    const reason = prompt("Reason for putting on hold:");
    if (reason === null) return;
    setSubmitting(true);
    const { holdFundRequest } = await import("@/app/actions/fundRequests");
    await holdFundRequest(req.id, reason);
    await onRefresh(); setSubmitting(false);
  };

  const handleReject = async () => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    setSubmitting(true);
    const { rejectFundRequest } = await import("@/app/actions/fundRequests");
    await rejectFundRequest(req.id, reason);
    await onRefresh(); setSubmitting(false);
  };

  const handleDisburse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitting(true);

    let attachmentPaths: string[] = [];
    if (previewFiles.length > 0) {
      setUploading(true);
      const { uploadFundRequestAttachments } = await import("@/app/actions/upload");
      const fd = new FormData();
      previewFiles.forEach(f => fd.append("files", f));
      const res = await uploadFundRequestAttachments(fd);
      if (res.success) attachmentPaths = res.paths || [];
      setUploading(false);
    }

    const fd = new FormData(form);
    const { disburseFunds } = await import("@/app/actions/fundRequests");
    await disburseFunds(req.id, {
      amount: fd.get("amount"),
      disbursementMethod: fd.get("disbursementMethod"),
      chequeNumber: fd.get("chequeNumber"),
      bankReference: fd.get("bankReference"),
      handedOverDate: fd.get("handedOverDate"),
      assignedMembers: assigned.join(", "),
      attachments: attachmentPaths,
    });
    await onRefresh();
    setSubmitting(false);
  };

  const handleUpdateFollowUp = async () => {
    setSubmitting(true);
    let attachmentPaths = [...currentAttachments];
    
    if (previewFiles.length > 0) {
      setUploading(true);
      const { uploadFundRequestAttachments } = await import("@/app/actions/upload");
      const fd = new FormData();
      previewFiles.forEach(f => fd.append("files", f));
      const res = await uploadFundRequestAttachments(fd);
      if (res.success) attachmentPaths = [...attachmentPaths, ...(res.paths || [])];
      setUploading(false);
    }

    const { updateDisbursementFollowUp } = await import("@/app/actions/fundRequests");
    await updateDisbursementFollowUp(req.id, {
      assignedMembers: assigned.join(", "),
      attachments: attachmentPaths,
    });
    
    setIsEditingFollowUp(false);
    setPreviewFiles([]);
    await onRefresh();
    setSubmitting(false);
  };

  const [showResumeForm, setShowResumeForm] = useState(false);
  const [resumeReason, setResumeReason] = useState("");

  const handleResume = async () => {
    if (!resumeReason.trim()) { alert("Please provide a reason for reopening this request."); return; }
    setSubmitting(true);
    const { resumeFundRequest } = await import("@/app/actions/fundRequests");
    await resumeFundRequest(req.id, resumeReason);
    await onRefresh();
    setSubmitting(false);
    setShowResumeForm(false);
    setResumeReason("");
  };

  if (req.status === "ON_HOLD") {
    return (
      <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-[32px] text-center space-y-4">
        <Clock className="w-12 h-12 text-amber-500 mx-auto" />
        <div>
          <p className="font-black text-amber-800 text-lg uppercase tracking-tight">Request On Hold</p>
          {req.decisionNotes && <p className="text-xs font-bold text-amber-600 mt-1">{req.decisionNotes}</p>}
        </div>
        
        {showResumeForm ? (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <textarea 
              autoFocus
              value={resumeReason}
              onChange={(e) => setResumeReason(e.target.value)}
              placeholder="Reason for resuming review..."
              className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-2xl font-bold text-slate-900 text-xs resize-none outline-none focus:border-amber-400"
              rows={3}
            />
            <div className="flex gap-2">
              <button onClick={() => setShowResumeForm(false)} className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
              <button disabled={submitting} onClick={handleResume} className="flex-[2] py-3 bg-amber-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-amber-200">
                {submitting ? "Processing..." : "Confirm & Resume"}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowResumeForm(true)} className="w-full py-3 bg-white text-slate-600 border-2 border-slate-100 rounded-xl font-black uppercase text-[10px] tracking-widest hover:border-amber-200 transition-all">
            Resume Review
          </button>
        )}
      </div>
    );
  }

  if (req.status === "DISBURSED") {
    const totalPaid = req.disbursements?.reduce((sum: number, d: any) => sum + d.amount, 0) || req.totalDisbursed || req.grantedAmount;
    
    return (
      <div className="space-y-6">
        <div className="p-6 bg-teal-50 border-2 border-teal-200 rounded-[32px] text-center relative overflow-hidden group/card">
          <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
          <p className="font-black text-teal-800 text-lg uppercase">Funds Disbursed</p>
          <p className="text-sm font-bold text-teal-600">{settings.currency} {fmt(totalPaid)} Total Paid</p>
          
          {req.disbursements && req.disbursements.length > 0 && (
            <div className="mt-4 space-y-2 text-left">
              {req.disbursements.map((d: any, idx: number) => (
                <div key={d.id} className="p-2 bg-white rounded-xl border border-teal-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Tranche {idx + 1}: {settings.currency} {fmt(d.amount)} via {d.method?.replace("_", " ")}</p>
                    <div className="flex gap-2 mt-0.5">
                      {d.handedOverDate && <span className="text-[9px] font-bold text-slate-500">Handed Over: {new Date(d.handedOverDate).toLocaleDateString()}</span>}
                      {d.chequeNumber && <span className="text-[9px] font-bold text-slate-500">• Cheque #{d.chequeNumber}</span>}
                      {d.bankReference && <span className="text-[9px] font-bold text-slate-500">• Ref: {d.bankReference}</span>}
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                </div>
              ))}
            </div>
          )}
          {!isEditingFollowUp && (
            <button onClick={() => setIsEditingFollowUp(true)} className="absolute top-4 right-4 p-2 bg-white text-teal-600 rounded-xl shadow-sm border border-teal-100 opacity-0 group-hover/card:opacity-100 transition-all hover:bg-teal-600 hover:text-white">
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditingFollowUp ? (
          <div className="p-6 bg-white border-2 border-teal-200 rounded-[32px] space-y-6 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.2em]">Edit Follow-Up Details</p>
              <button onClick={() => { setIsEditingFollowUp(false); setPreviewFiles([]); }} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600">Cancel</button>
            </div>
            
            <MemberSelect label="Assigned Members" members={members} selected={assigned} onToggle={toggleAssigned} />
            
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {currentAttachments.map((path, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden group border border-teal-200 bg-white shadow-sm">
                    {/\.(jpg|jpeg|png|webp|gif)$/i.test(path) ? <img src={getProxiedImageUrl(path)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-teal-600 font-bold text-[8px]">FILE</div>}
                    <button type="button" onClick={() => setCurrentAttachments(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
                {previewFiles.map((file, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden bg-teal-50 border-2 border-teal-200 flex items-center justify-center italic text-[8px] text-teal-600 font-bold p-1 text-center">
                    NEW
                    <button type="button" onClick={() => setPreviewFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-teal-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all">
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                  <Plus className="w-4 h-4 text-teal-400" />
                </label>
              </div>
            </div>

            <button onClick={handleUpdateFollowUp} disabled={submitting || uploading} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-teal-100 transition-all active:scale-95">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-5 h-5" />} {uploading ? "Uploading..." : "Save Changes"}
            </button>
          </div>
        ) : (
          <>
            {latestDisbursement?.assignedMembers && (
              <div className="p-5 bg-white border border-slate-200 rounded-[32px] space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Follow-up Assigned To</p>
                <div className="flex flex-wrap gap-1">
                  {latestDisbursement.assignedMembers.split(", ").map((name: string) => (
                    <span key={name} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tight">{name}</span>
                  ))}
                </div>
              </div>
            )}

            {latestDisbursement?.attachments && latestDisbursement.attachments.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disbursement Attachments</p>
                <div className="grid grid-cols-2 gap-3">
                  {latestDisbursement.attachments.map((path: string, i: number) => {
                    const isImg = /\.(jpg|jpeg|png|webp|gif)$/i.test(path);
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl group hover:border-teal-300 transition-all shadow-sm">
                        <span className="text-[10px] font-black text-slate-500 truncate max-w-[150px] uppercase">{path.split('/').pop()}</span>
                        <button onClick={() => isImg ? setLightbox(path) : window.open(path, '_blank')} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (req.status === "REJECTED") {
    return (
      <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-[32px] text-center space-y-4">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <div>
          <p className="font-black text-rose-800 text-lg uppercase tracking-tight">Request Rejected</p>
          {req.decisionNotes && <p className="text-xs font-bold text-rose-600 mt-1">{req.decisionNotes}</p>}
        </div>

        {showResumeForm ? (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <textarea 
              autoFocus
              value={resumeReason}
              onChange={(e) => setResumeReason(e.target.value)}
              placeholder="Reason for reopening this request..."
              className="w-full px-4 py-3 bg-white border-2 border-rose-200 rounded-2xl font-bold text-slate-900 text-xs resize-none outline-none focus:border-rose-400"
              rows={3}
            />
            <div className="flex gap-2">
              <button onClick={() => setShowResumeForm(false)} className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
              <button disabled={submitting} onClick={handleResume} className="flex-[2] py-3 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-rose-200">
                {submitting ? "Processing..." : "Confirm & Re-open"}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowResumeForm(true)} className="w-full py-3 bg-white text-slate-600 border-2 border-slate-100 rounded-xl font-black uppercase text-[10px] tracking-widest hover:border-rose-200 transition-all">
            Re-open for Review
          </button>
        )}
      </div>
    );
  }

  if (req.status === "APPROVED" || req.status === "ON_GOING") {
    return (
      <div className="space-y-4">
        <div className="relative p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-center group/decision transition-all">
          {isEditingDecision ? (
            <form onSubmit={handleEditApproved} className="space-y-3 text-left">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">Edit Approved Details</p>
                <button type="button" onClick={() => setIsEditingDecision(false)} className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-all"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Payment Type</p>
                <div className="flex bg-emerald-100 p-1 rounded-xl">
                  <button type="button" onClick={() => setPaymentType("ONE_TIME")} className={`px-3 py-1 text-[8px] font-black uppercase rounded-lg transition-all ${paymentType === "ONE_TIME" ? "bg-white text-emerald-700 shadow-sm" : "text-emerald-600 hover:bg-emerald-50"}`}>One Time</button>
                  <button type="button" onClick={() => setPaymentType("MONTHLY")} className={`px-3 py-1 text-[8px] font-black uppercase rounded-lg transition-all ${paymentType === "MONTHLY" ? "bg-white text-emerald-700 shadow-sm" : "text-emerald-600 hover:bg-emerald-50"}`}>Monthly</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className={paymentType === "ONE_TIME" ? "col-span-2" : "col-span-1"}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">{paymentType === "MONTHLY" ? "Amount / Month" : "Amount"}</p>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">{settings.currency}</div>
                    <input name="grantedAmount" type="number" step="0.01" required defaultValue={req.grantedAmount} className="w-full pl-12 pr-4 py-3 bg-white border-2 border-emerald-200 rounded-xl font-black text-emerald-900 text-sm shadow-sm focus:border-emerald-500 outline-none transition-all" />
                  </div>
                </div>
                {paymentType === "MONTHLY" && (
                  <>
                    <div className="col-span-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Start Month</p>
                      <input type="month" required value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-emerald-200 rounded-xl font-black text-emerald-900 text-xs shadow-sm" />
                    </div>
                    <div className="col-span-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">End Month</p>
                      <input type="month" required value={endMonth} onChange={(e) => setEndMonth(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-emerald-200 rounded-xl font-black text-emerald-900 text-xs shadow-sm" />
                    </div>
                  </>
                )}
              </div>
              <textarea name="decisionNotes" defaultValue={req.decisionNotes} rows={2} className="w-full px-4 py-3 bg-white border-2 border-emerald-200 rounded-xl font-bold text-emerald-900 text-xs resize-none focus:border-emerald-500 outline-none transition-all shadow-sm" />
              <button disabled={submitting} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-100">
                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Changes
              </button>
            </form>
          ) : (
            <>
              <p className="font-black text-emerald-800 uppercase text-sm">Approved: {settings.currency} {fmt(req.grantedAmount)} {req.paymentType === "MONTHLY" ? `/ month (for ${req.durationMonths} months)` : ""}</p>
              {req.decisionNotes && <p className="text-[10px] text-emerald-600 font-bold mt-1">{req.decisionNotes}</p>}
              <button onClick={() => setIsEditingDecision(true)} className="absolute top-2 right-2 p-1.5 text-emerald-600 bg-white border border-emerald-100 rounded-xl opacity-0 group-hover/decision:opacity-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {req.disbursements && req.disbursements.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disbursement History</p>
            <div className="space-y-2">
              {req.disbursements.map((d: any, idx: number) => (
                <div key={d.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-900">Tranche {idx + 1}: {settings.currency} {fmt(d.amount)}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">Paid on {new Date(d.createdAt).toLocaleDateString()} via {d.method}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              ))}
            </div>
            {req.paymentType === "MONTHLY" && req.durationMonths && (
              <p className="text-[10px] font-bold text-emerald-600 text-center bg-emerald-50 py-1.5 rounded-lg border border-emerald-100">
                {req.durationMonths - req.disbursements.length} Tranche(s) Remaining
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleDisburse} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Release New Tranche</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">{settings.currency}</div>
              <input name="amount" type="number" step="0.01" required defaultValue={req.grantedAmount} className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 text-lg shadow-sm" />
            </div>
            <select name="disbursementMethod" required className="col-span-2 w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 text-[10px] uppercase">
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
            <div className="col-span-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Handed Over Date</p>
              <input name="handedOverDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs shadow-sm" />
            </div>
            <div className="col-span-2">
              <MemberSelect label="Assign Members to Look After Usage" members={members} selected={assigned} onToggle={toggleAssigned} />
            </div>
            <div className="col-span-2 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Attachments (Handover Photos/Receipts)</p>
              <div className="flex flex-wrap gap-2">
                {previewFiles.map((file, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden bg-teal-50 border-2 border-teal-200 flex items-center justify-center italic text-[8px] text-teal-600 font-bold p-1 text-center">
                    {file.name.split('.').pop()?.toUpperCase()}
                    <button type="button" onClick={() => setPreviewFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-teal-200 bg-white flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all">
                  <input type="file" multiple className="hidden" onChange={handleFileChange} />
                  <Plus className="w-4 h-4 text-teal-400" />
                </label>
              </div>
            </div>
            <input name="chequeNumber" placeholder="Cheque No (if applicable)" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs" />
            <input name="bankReference" placeholder="Bank Ref (if applicable)" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs" />
          </div>
          <button disabled={submitting || uploading} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-teal-100 transition-all active:scale-95 mt-4">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-5 h-5" />} {uploading ? "Uploading..." : "Release Funds"}
          </button>
        </form>
      </div>
    );
  }

  // Block decision for unverified internal requests
  if (req.beneficiaryType === "INTERNAL" && !req.verified) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-amber-600" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Verification Required</h4>
          <p className="text-[10px] text-slate-500 font-bold max-w-[240px] leading-relaxed uppercase">
            You must verify the beneficiary's family card in the <span className="text-blue-600">Overview</span> tab before taking a decision.
          </p>
        </div>
      </div>
    );
  }

  if (isReadOnly) return (
    <div className="flex flex-col items-center justify-center py-10 opacity-50">
      <ShieldCheck className="w-12 h-12 text-slate-300 mb-4" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
        Management actions are disabled in Oversight mode.
      </p>
    </div>
  );

  // Default: Approve/Reject form
  return (
    <div className="space-y-4">
      <form onSubmit={handleApprove} className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Approve & Grant Amount</p>
          <div className="flex bg-emerald-100 p-1 rounded-xl">
            <button type="button" onClick={() => setPaymentType("ONE_TIME")} className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${paymentType === "ONE_TIME" ? "bg-white text-emerald-700 shadow-sm" : "text-emerald-600 hover:bg-emerald-50"}`}>One Time</button>
            <button type="button" onClick={() => setPaymentType("MONTHLY")} className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${paymentType === "MONTHLY" ? "bg-white text-emerald-700 shadow-sm" : "text-emerald-600 hover:bg-emerald-50"}`}>Monthly</button>
          </div>
        </div>
        <input type="hidden" name="paymentType" value={paymentType} />
        
        <div className="grid grid-cols-2 gap-3">
          <div className={paymentType === "ONE_TIME" ? "col-span-2" : "col-span-1"}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">{paymentType === "MONTHLY" ? "Amount Per Month" : "Total Amount"}</p>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">{settings.currency}</div>
              <input 
                type="text" 
                required 
                value={displayAmount}
                onChange={handleAmountChange}
                placeholder="0.00" 
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 text-lg shadow-sm focus:border-emerald-500 outline-none transition-all" 
              />
            </div>
          </div>
          {paymentType === "MONTHLY" && (
            <>
              <div className="col-span-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Start Month</p>
                <input type="month" required value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 text-sm shadow-sm focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div className="col-span-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">End Month</p>
                <input type="month" required value={endMonth} onChange={(e) => setEndMonth(e.target.value)} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-900 text-sm shadow-sm focus:border-emerald-500 outline-none transition-all" />
              </div>
              <div className="col-span-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Calculated Duration</p>
                <div className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl font-black text-slate-500 text-lg flex items-center justify-center">
                  {calcDuration} Months
                </div>
              </div>
            </>
          )}
        </div>
        
        <textarea name="decisionNotes" placeholder="Decision notes..." rows={2} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 text-xs resize-none focus:border-emerald-500 outline-none transition-all shadow-sm" />
        <button disabled={submitting} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-100">
          {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Approve Request
        </button>
      </form>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleHold} disabled={submitting} className="py-3 bg-amber-50 text-amber-600 border-2 border-amber-100 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-100 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
          <Clock className="w-4 h-4" /> Put on Hold
        </button>
        <button onClick={handleReject} disabled={submitting} className="py-3 bg-rose-50 text-rose-600 border-2 border-rose-100 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-100 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
          <XCircle className="w-4 h-4" /> Reject Request
        </button>
      </div>
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
