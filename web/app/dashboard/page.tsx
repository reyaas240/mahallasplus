import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Building, Users, Activity, FileText, MapPin } from "lucide-react";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  let stats = {
    mainMahallas: 0,
    subMahallas: 0,
    totalMembers: 0,
    pendingRequests: 0,
    mainMahallaName: "",
  };

  if (role === "PLATFORM_ADMIN") {
    stats.mainMahallas = await prisma.mainMahalla.count();
    stats.subMahallas = await prisma.subMahalla.count();
    stats.totalMembers = await prisma.familyMember.count();
    stats.pendingRequests = await prisma.registrationRequest.count({ where: { status: "PENDING" } });
  } else if ((role === "MAIN_ADMIN" || role === "MAIN_STAFF") && session?.user?.mainMahallaId) {
    const mainMahalla = await prisma.mainMahalla.findUnique({
      where: { id: session.user.mainMahallaId },
      select: { name: true }
    });
    stats.mainMahallaName = mainMahalla?.name || "";
    stats.subMahallas = await prisma.subMahalla.count({ where: { mainMahallaId: session.user.mainMahallaId } });
    stats.totalMembers = await prisma.familyMember.count({ 
      where: { 
        familyCard: { 
          subMahalla: { 
            mainMahallaId: session.user.mainMahallaId 
          } 
        } 
      } 
    });
  } else if (role === "SUB_ADMIN" && session?.user?.subMahallaId) {
    const subMahalla = await prisma.subMahalla.findUnique({
      where: { id: session.user.subMahallaId },
      select: { name: true }
    });
    stats.mainMahallaName = subMahalla?.name || ""; // Using this field for the label
    stats.totalMembers = await prisma.familyMember.count({
      where: {
        familyCard: {
          subMahallaId: session.user.subMahallaId
        }
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, {session?.user?.name || "Admin"}</h2>
          <p className="text-slate-600">Here is what's happening across your platform today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {role === "PLATFORM_ADMIN" && (
          <StatCard 
            title="Main Mahallas" 
            value={stats.mainMahallas.toString()} 
            icon={<Building className="w-6 h-6 text-blue-600" />} 
            trend="+2 this month"
          />
        )}
        
        {(role === "PLATFORM_ADMIN" || role === "MAIN_ADMIN" || role === "MAIN_STAFF") && (
          <StatCard 
            title="Sub Mahallas" 
            value={stats.subMahallas.toString()} 
            icon={<MapPin className="w-6 h-6 text-emerald-600" />} 
            trend={(role === "MAIN_ADMIN" || role === "MAIN_STAFF") ? `Under ${stats.mainMahallaName}` : "Platform Jurisdictions"}
          />
        )}

        {(role === "PLATFORM_ADMIN" || role === "MAIN_ADMIN" || role === "MAIN_STAFF" || role === "SUB_ADMIN") && (
          <StatCard 
            title="Total Members" 
            value={stats.totalMembers.toString()} 
            icon={<Users className="w-6 h-6 text-indigo-600" />} 
            trend={
              (role === "MAIN_ADMIN" || role === "MAIN_STAFF") ? "From All Sub Mahallas" : 
              role === "SUB_ADMIN" ? `In ${stats.mainMahallaName}` : 
              "Global Community"
            }
          />
        )}

        {role === "PLATFORM_ADMIN" && (
          <StatCard 
            title="Pending Registrations" 
            value={stats.pendingRequests.toString()} 
            icon={<FileText className="w-6 h-6 text-amber-600" />} 
            trend="Requires action"
            alert
          />
        )}
      </div>
      
      {/* Activity Feed Placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Recent Activity</h3>
        </div>
        <div className="p-6 flex flex-col items-center justify-center text-slate-500 py-12">
          <Activity className="w-12 h-12 text-slate-300 mb-3" />
          <p>No recent activity to show.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, alert }: { title: string, value: string, icon: React.ReactNode, trend: string, alert?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
          {icon}
        </div>
        {alert && (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h4 className="text-3xl font-bold text-slate-900 mt-1">{value}</h4>
        <p className={`text-sm mt-2 font-medium ${alert ? 'text-amber-600' : 'text-emerald-600'}`}>
          {trend}
        </p>
      </div>
    </div>
  );
}
