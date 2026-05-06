import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getInvoices } from "@/app/actions/invoices";
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, Search, Download, Filter } from "lucide-react";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { InvoiceActions } from "./InvoiceActions";

export default async function InvoicesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PLATFORM_ADMIN") {
    redirect("/dashboard");
  }

  const invoices = await getInvoices();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Billing & Invoices</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-[0.2em]">Track registration fees and subscription renewals</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Invoices</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{invoices.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Amount</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            LKR {invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Amount</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            LKR {invoices.filter(i => i.status === 'UNPAID').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overdue</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{invoices.filter(i => i.status === 'OVERDUE').length}</p>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              placeholder="Search by Invoice # or Entity..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-600 font-bold text-xs"
            />
          </div>
          <div className="flex gap-3">
            <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-900 transition-all shadow-sm">
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-slate-900 transition-all shadow-sm">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Details</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan & Type</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 tracking-tight">{invoice.invoiceNo}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Created {new Date(invoice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{invoice.licensePlan.name}</span>
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-[0.1em] mt-0.5">{invoice.licensePlan.type}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-black text-slate-900">LKR {invoice.amount.toLocaleString()}</span>
                </td>
                <td className="px-8 py-6">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td className="px-8 py-6">
                  <span className={`text-[11px] font-bold ${new Date(invoice.dueDate) < new Date() && invoice.status === 'UNPAID' ? 'text-rose-600' : 'text-slate-500'}`}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <InvoiceActions invoice={invoice} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {invoices.length === 0 && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FileText className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">No Invoices Found</h3>
          </div>
        )}
      </div>
    </div>
  );
}
