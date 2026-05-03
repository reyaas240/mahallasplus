import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, LayoutDashboard, Settings, LogOut, FileText, Globe, Building, Shield } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = session.user?.role;

  return (
    <div className="h-screen bg-[#F8FAFC] flex overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col flex-shrink-0 h-full relative z-50 border-r border-white/5">
        {/* Subtle Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-32 bg-blue-600/10 blur-[100px] pointer-events-none" />
        
        <div className="h-20 flex items-center px-8 flex-shrink-0 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white leading-none">MAHALLAS<span className="text-blue-500">+</span></span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Platform</span>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-8 flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar relative">
          <Link href="/dashboard" className="group flex items-center justify-between px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-bold text-sm tracking-wide">Overview</span>
            </div>
          </Link>
          
          {role === "PLATFORM_ADMIN" && (
            <>
              <div className="mt-8 mb-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">System Governance</div>
              <Link href="/dashboard/main-mahallas" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Globe className="w-5 h-5 transition-transform group-hover:rotate-12" />
                <span className="font-bold text-sm tracking-wide">Main Mahallas</span>
              </Link>
              <Link href="/dashboard/master-data" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
                <span className="font-bold text-sm tracking-wide">Master Data</span>
              </Link>
              <Link href="/dashboard/requests" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <FileText className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide">Pending Requests</span>
              </Link>
            </>
          )}

          {role === "MAIN_ADMIN" && (
            <>
              <div className="mt-8 mb-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Core Operations</div>
              <Link href="/dashboard/sub-mahallas" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Building className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide">Sub Mahallas</span>
              </Link>
              <Link href="/dashboard/families" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Users className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide">Families</span>
              </Link>
              <Link href="/dashboard/committees" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Shield className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide">Committees</span>
              </Link>
              <Link href="/dashboard/sub-admins" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Settings className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide">Sub Admins</span>
              </Link>
            </>
          )}
        </div>
        
        <div className="p-6 border-t border-white/5 bg-black/20 flex-shrink-0">
          <div className="mb-6 px-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center font-black text-blue-500 border border-blue-500/20">
              {session.user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black text-white truncate">{session.user?.name || "Admin User"}</span>
              <span className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-wider">{role?.replace('_', ' ')}</span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-10 flex-shrink-0 z-40 sticky top-0">
          <div className="flex items-center gap-4">
             <div className="lg:hidden w-10 h-10 bg-slate-100 rounded-xl" />
             <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Management Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          {/* Page Ambient Background */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
