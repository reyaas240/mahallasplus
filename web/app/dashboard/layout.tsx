import { getServerSession } from "next-auth";
import { getProxiedImageUrl } from "@/lib/utils";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, LayoutDashboard, Settings, LogOut, FileText, Globe, Building, Shield, ShieldAlert, UserCircle2, Bell } from "lucide-react";
import LogoutButton from "./LogoutButton";
import { PlatformLogo } from "./PlatformLogo";

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
  const mainMahalla = session.user.mainMahallaId
    ? await prisma.mainMahalla.findUnique({ where: { id: session.user.mainMahallaId } })
    : null;

  const subMahalla = session.user.subMahallaId
    ? await prisma.subMahalla.findUnique({ where: { id: session.user.subMahallaId } })
    : null;

  const activeBranding = role === "SUB_ADMIN" ? subMahalla : mainMahalla;

  // Access blocking logic
  if (role !== "PLATFORM_ADMIN") {
    const isMainBlocked = mainMahalla && mainMahalla.status === "INACTIVE";
    const isSubBlocked = subMahalla && subMahalla.status === "INACTIVE";
    
    if (isMainBlocked || isSubBlocked) {
      return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-6">
          <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 blur-[120px]" />
          <div className="bg-white rounded-[40px] max-w-lg w-full p-12 text-center shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-100 ring-4 ring-rose-50/50">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Account Restricted</h1>
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest leading-loose mb-8">
              {isMainBlocked ? "Your Main Mahalla has been deactivated by the platform administration." : "Your Sub-Mahalla has been deactivated."} Access to all operational modules is currently suspended.
            </p>
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Next Steps</p>
              <p className="text-sm font-bold text-slate-700 leading-relaxed">
                Please contact the Platform Administrator to resolve this restriction and restore your operational status.
              </p>
            </div>
            <LogoutButton className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3">
               <LogOut className="w-4 h-4" /> Sign Out
            </LogoutButton>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="h-screen bg-[#F8FAFC] flex overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col flex-shrink-0 h-full relative z-50 border-r border-white/5">
        {/* Subtle Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-32 bg-blue-600/10 blur-[100px] pointer-events-none" />

        <div className="h-20 flex items-center px-8 flex-shrink-0 relative">
          <div className="flex items-center gap-3">
            <PlatformLogo />
            <div className="flex flex-col">
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
              <Link href="/dashboard/licenses" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Shield className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide">License Plans</span>
              </Link>
              <Link href="/dashboard/invoices" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <FileText className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide">Invoices</span>
              </Link>
              <Link href="/dashboard/settings" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Settings className="w-5 h-5 transition-transform group-hover:rotate-90" />
                <span className="font-bold text-sm tracking-wide">System Settings</span>
              </Link>
            </>
          )}

          {(role === "MAIN_ADMIN" || role === "SUB_ADMIN") && (
            <>
              <div className="mt-8 mb-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Core Operations</div>
              {role === "MAIN_ADMIN" && (
                <>
                  <Link href="/dashboard/sub-mahallas" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <Building className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-wide">Sub Mahallas</span>
                  </Link>
                  <Link href="/dashboard/jurisdictions" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <Globe className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    <span className="font-bold text-sm tracking-wide">Jurisdictions</span>
                  </Link>
                </>
              )}
              <Link href="/dashboard/families" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Users className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide">Families</span>
              </Link>
              <Link href="/dashboard/committees" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Shield className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide">Committees</span>
              </Link>
              {role === "MAIN_ADMIN" && (
                <Link href="/dashboard/sub-admins" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                  <Settings className="w-5 h-5" />
                  <span className="font-bold text-sm tracking-wide">Sub Admins</span>
                </Link>
              )}
              <Link href="/dashboard/notices" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <Bell className="w-5 h-5" />
                <span className="font-bold text-sm tracking-wide">Notices</span>
              </Link>
            </>
          )}

          <div className="mt-8 mb-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">System & Account</div>
          
          {role === "MAIN_ADMIN" && (
            <Link href="/dashboard/mahalla-profile" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Building className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-bold text-sm tracking-wide">Mahalla Profile</span>
            </Link>
          )}

          <Link href="/dashboard/profile" className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <UserCircle2 className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="font-bold text-sm tracking-wide">My Account</span>
          </Link>
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
            {activeBranding ? (
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                {activeBranding.logo ? (
                  <img 
                    src={getProxiedImageUrl(activeBranding.logo)} 
                    className="w-8 h-8 rounded-lg object-cover shadow-sm" 
                    alt="Logo" 
                  />
                ) : (
                  <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xs uppercase">
                    {activeBranding.name.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none">{activeBranding.name}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{role === "SUB_ADMIN" ? "Sub Admin Console" : "Admin Console"}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Online</span>
              </div>
            )}
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
