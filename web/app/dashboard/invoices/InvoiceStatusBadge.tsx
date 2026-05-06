"use client";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

export function InvoiceStatusBadge({ status }: { status: string }) {
  const configs: Record<string, any> = {
    UNPAID: {
      bg: "bg-amber-50 text-amber-600 border-amber-100",
      icon: <Clock className="w-3 h-3" />,
      label: "Pending"
    },
    PAID: {
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: "Cleared"
    },
    OVERDUE: {
      bg: "bg-rose-50 text-rose-600 border-rose-100",
      icon: <AlertCircle className="w-3 h-3" />,
      label: "Overdue"
    },
    CANCELLED: {
      bg: "bg-slate-50 text-slate-400 border-slate-100",
      icon: <XCircle className="w-3 h-3" />,
      label: "Cancelled"
    }
  };

  const config = configs[status] || configs.UNPAID;

  return (
    <div className={`px-3 py-1 rounded-full border ${config.bg} flex items-center gap-1.5 w-fit`}>
      {config.icon}
      <span className="text-[9px] font-black uppercase tracking-widest">{config.label}</span>
    </div>
  );
}
