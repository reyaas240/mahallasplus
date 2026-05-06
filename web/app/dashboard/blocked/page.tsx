import { LogOut, ShieldAlert } from "lucide-react";
import LogoutButton from "../LogoutButton";

export default function BlockedPage() {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-6">
      <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 blur-[120px]" />
      
      <div className="bg-white rounded-[40px] max-w-lg w-full p-12 text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-100 ring-4 ring-rose-50/50">
          <ShieldAlert className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Account Restricted</h1>
        <p className="text-slate-500 font-bold uppercase text-xs tracking-widest leading-loose mb-8">
          Your Mahalla has been deactivated by the platform administration. Access to all operational modules is currently suspended.
        </p>
        
        <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Next Steps</p>
          <p className="text-sm font-bold text-slate-700 leading-relaxed">
            Please contact the Platform Administrator to resolve this restriction and restore your mahalla's operational status.
          </p>
        </div>

        <div className="flex gap-4">
          <LogoutButton className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3">
             <LogOut className="w-4 h-4" /> Sign Out
          </LogoutButton>
        </div>
      </div>
    </div>
  );
}
