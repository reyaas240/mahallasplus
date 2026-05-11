"use client";

import { useState } from "react";
import { Check, X, Loader2, ShieldCheck, Eye, ShieldAlert, XCircle } from "lucide-react";
import { getProxiedImageUrl } from "@/lib/utils";
import { approveRequest, rejectRequest, verifyRequest } from "@/app/actions/requests";
import { Lightbox } from "../components/Lightbox";

export function RequestActions({ request }: { request: any }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [lightbox, setLightbox] = useState<{ open: boolean; initialIndex: number }>({ open: false, initialIndex: 0 });

  const documentImages = [
    request.governmentIdUrl ? getProxiedImageUrl(request.governmentIdUrl) : null,
    request.selfieUrl ? getProxiedImageUrl(request.selfieUrl) : null
  ].filter(Boolean) as string[];

  const handleVerify = async () => {
    setIsProcessing(true);
    const res = await verifyRequest(request.id);
    if (res.success) {
      setShowVerifyModal(false);
    } else {
      alert(res.error);
    }
    setIsProcessing(false);
  };

  const handleApprove = async () => {
    if (!request.isVerified) {
      alert("Please verify the identity documents before approving.");
      setShowVerifyModal(true);
      return;
    }
    setIsProcessing(true);
    const res = await approveRequest(request.id);
    if (!res.success) {
      alert(res.error);
    }
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this request?")) return;
    setIsProcessing(true);
    const res = await rejectRequest(request.id);
    if (!res.success) {
      alert(res.error);
    }
    setIsProcessing(false);
  };

  if (isProcessing) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-slate-500 font-medium text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Processing...
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Always show View Documents if they exist */}
        {(request.governmentIdUrl || request.selfieUrl) && (
          <button 
            onClick={() => setShowVerifyModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm border shadow-sm group ${
              request.isVerified 
                ? "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-blue-600" 
                : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
            }`}
          >
            <Eye className={`w-4 h-4 transition-transform ${!request.isVerified ? 'animate-pulse' : 'group-hover:scale-110'}`} />
            {request.isVerified ? "View Identity" : "Verify Identity"}
          </button>
        )}

        {request.status === "PENDING" && (
          <>
            {request.isVerified && (
              <button 
                onClick={handleApprove}
                className="flex items-center gap-2 px-4 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors font-bold text-sm shadow-sm"
              >
                <Check className="w-4 h-4" /> Approve
              </button>
            )}

            <button 
              onClick={handleReject}
              className="flex items-center gap-2 px-4 py-2 border border-rose-200 bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-100 transition-colors font-bold text-sm shadow-sm"
            >
              <X className="w-4 h-4" /> Reject
            </button>
          </>
        )}

        {request.status !== "PENDING" && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border ${
            request.status === 'APPROVED' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
            {request.status === 'APPROVED' ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {request.status}
          </div>
        )}
      </div>

      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Identity Verification</h3>
                  <p className="text-sm text-slate-500 font-medium">{request.mahallaName} Registration Request</p>
                </div>
              </div>
              <button onClick={() => setShowVerifyModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-slate-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Government ID</h4>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-200 group relative">
                    {request.governmentIdUrl ? (
                      <>
                        <img 
                          src={getProxiedImageUrl(request.governmentIdUrl)} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          alt="Government ID" 
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button" 
                            onClick={() => setLightbox({ open: true, initialIndex: 0 })}
                            className="p-4 bg-white rounded-2xl shadow-xl hover:scale-110 transition-transform flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-900"
                          >
                            <Eye className="w-5 h-5 text-blue-600" /> View Large
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ShieldAlert className="w-12 h-12 mb-2" />
                        <p className="font-bold">No ID Uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Applicant Selfie</h4>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-200 group relative">
                    {request.selfieUrl ? (
                      <>
                        <img 
                          src={getProxiedImageUrl(request.selfieUrl)} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          alt="Selfie" 
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            type="button" 
                            onClick={() => setLightbox({ open: true, initialIndex: request.governmentIdUrl ? 1 : 0 })}
                            className="p-4 bg-white rounded-2xl shadow-xl hover:scale-110 transition-transform flex items-center gap-2 font-black text-xs uppercase tracking-widest text-slate-900"
                          >
                            <Eye className="w-5 h-5 text-blue-600" /> View Large
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ShieldAlert className="w-12 h-12 mb-2" />
                        <p className="font-bold">No Selfie Uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                <h4 className="font-black text-blue-900 mb-2 flex items-center gap-2">
                   <ShieldCheck className="w-5 h-5" /> Applicant Declaration
                </h4>
                <p className="text-sm text-blue-800 leading-relaxed font-medium">
                  I, <span className="font-bold underline decoration-blue-300 decoration-2 underline-offset-2">{request.fullName}</span>, hereby certify that the information provided is accurate and I am authorized to represent <span className="font-bold underline decoration-blue-300 decoration-2 underline-offset-2">{request.mahallaName}</span>.
                </p>
              </div>
            </div>

            {request.status === "PENDING" && (
              <div className="p-6 bg-white border-t border-slate-100 flex gap-4">
                <button 
                  onClick={handleVerify}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <ShieldCheck className="w-6 h-6" /> Mark as Verified
                </button>
                <button 
                  onClick={handleReject}
                  className="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black hover:bg-rose-100 transition-all border border-rose-100 active:scale-[0.98]"
                >
                  Reject Request
                </button>
              </div>
            )}
            {request.status !== "PENDING" && (
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest ${request.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
                  {request.status === 'APPROVED' ? <Check className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  This request was {request.status.toLowerCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {lightbox.open && (
        <Lightbox 
          images={documentImages}
          initialIndex={lightbox.initialIndex}
          isOpen={lightbox.open}
          onClose={() => setLightbox({ ...lightbox, open: false })}
        />
      )}
    </>
  );
}
