"use client";
import { useState } from "react";
import { MoreVertical, CheckCircle2, XCircle, Trash2, Mail, Loader2 } from "lucide-react";
import { updateInvoiceStatus, deleteInvoice } from "@/app/actions/invoices";

export function InvoiceActions({ invoice }: { invoice: any }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusUpdate = async (status: string) => {
    setIsProcessing(true);
    await updateInvoiceStatus(invoice.id, status);
    setIsProcessing(false);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    setIsProcessing(true);
    await deleteInvoice(invoice.id);
    setIsProcessing(false);
    setShowMenu(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
            {invoice.status !== 'PAID' && (
              <button 
                onClick={() => handleStatusUpdate('PAID')}
                disabled={isProcessing}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 transition-all"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Mark as Paid
              </button>
            )}
            {invoice.status !== 'CANCELLED' && (
              <button 
                onClick={() => handleStatusUpdate('CANCELLED')}
                disabled={isProcessing}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                <XCircle className="w-4 h-4" /> Cancel Invoice
              </button>
            )}
            <button 
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 transition-all"
            >
              <Mail className="w-4 h-4" /> Resend Email
            </button>
            <div className="h-px bg-slate-50 my-1" />
            <button 
              onClick={handleDelete}
              disabled={isProcessing}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-rose-600 uppercase tracking-widest hover:bg-rose-50 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete Record
            </button>
          </div>
        </>
      )}
    </div>
  );
}
