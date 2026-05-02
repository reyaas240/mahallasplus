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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">MahallasPlus</span>
          </div>
        </div>
        
        <div className="px-4 py-6 flex-1 flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </Link>
          
          {role === "PLATFORM_ADMIN" && (
            <>
              <div className="mt-4 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Admin</div>
              <Link href="/dashboard/main-mahallas" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                <Globe className="w-5 h-5" />
                <span className="font-medium">Main Mahallas</span>
              </Link>
              <Link href="/dashboard/master-data" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Master Data</span>
              </Link>
              <Link href="/dashboard/requests" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                <FileText className="w-5 h-5" />
                <span className="font-medium">Pending Requests</span>
              </Link>
            </>
          )}

          {role === "MAIN_ADMIN" && (
            <>
              <div className="mt-4 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Mahalla</div>
              <Link href="/dashboard/sub-mahallas" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                <Building className="w-5 h-5" />
                <span className="font-medium">Sub Mahallas</span>
              </Link>
              <Link href="/dashboard/sub-admins" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Sub Admins</span>
              </Link>
              <Link href="/dashboard/families" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                <Users className="w-5 h-5" />
                <span className="font-medium">Families</span>
              </Link>
              <Link href="/dashboard/committees" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                <Shield className="w-5 h-5" />
                <span className="font-medium">Committees</span>
              </Link>
            </>
          )}

          {role === "SUB_ADMIN" && (
            <>
              <div className="mt-4 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sub Mahalla</div>
              <Link href="/dashboard/families" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                <Users className="w-5 h-5" />
                <span className="font-medium">Families</span>
              </Link>
            </>
          )}

          {role === "COMMITTEE_ADMIN" && (
            <>
              <div className="mt-4 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Committee Portal</div>
              <Link href="/dashboard/committee-portal" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                <Shield className="w-5 h-5" />
                <span className="font-medium">My Committee</span>
              </Link>
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <div className="mb-4 px-3 flex flex-col">
            <span className="text-sm font-medium text-white truncate">{session.user?.name || "Admin User"}</span>
            <span className="text-xs text-slate-400 truncate">{session.user?.email}</span>
            <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-800 w-fit">
              {role}
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
        </header>
        <div className="p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
