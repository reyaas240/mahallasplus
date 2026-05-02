"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { approveRequest, rejectRequest } from "@/app/actions/requests";

export function RequestActions({ requestId }: { requestId: string }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    const res = await approveRequest(requestId);
    if (!res.success) {
      alert(res.error);
    }
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this request?")) return;
    setIsProcessing(true);
    const res = await rejectRequest(requestId);
    if (!res.success) {
      alert(res.error);
    }
    setIsProcessing(false);
  };

  if (isProcessing) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Processing...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={handleApprove}
        className="flex items-center gap-2 px-4 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-sm"
      >
        <Check className="w-4 h-4" /> Approve
      </button>
      <button 
        onClick={handleReject}
        className="flex items-center gap-2 px-4 py-2 border border-red-200 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
      >
        <X className="w-4 h-4" /> Reject
      </button>
    </div>
  );
}
