import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Building, Users, FileText, MapPin, User } from "lucide-react";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  let stats = {
    mainMahallas: 0,
    subMahallas: 0,
    totalMembers: 0,
    maleMembers: 0,
    femaleMembers: 0,
    pendingRequests: 0,
    mainMahallaName: "",
  };

  let chartData: { name: string; total: number; males: number; females: number }[] = [];

  if (role === "PLATFORM_ADMIN") {
    stats.mainMahallas = await prisma.mainMahalla.count();
    stats.subMahallas = await prisma.subMahalla.count();
    stats.totalMembers = await prisma.familyMember.count();
    stats.maleMembers = await prisma.familyMember.count({ where: { gender: { equals: "Male", mode: "insensitive" } } });
    stats.femaleMembers = await prisma.familyMember.count({ where: { gender: { equals: "Female", mode: "insensitive" } } });
    stats.pendingRequests = await prisma.registrationRequest.count({ where: { status: "PENDING" } });

    const subMahallasData = await prisma.subMahalla.findMany({
      include: {
        familyCards: {
          include: {
            members: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    chartData = subMahallasData.map((sm) => {
      const allMembers = sm.familyCards.flatMap((fc) => fc.members);
      return {
        name: sm.name,
        total: allMembers.length,
        males: allMembers.filter((m) => m.gender?.toLowerCase() === "male").length,
        females: allMembers.filter((m) => m.gender?.toLowerCase() === "female").length,
      };
    });
  } else if ((role === "MAIN_ADMIN" || role === "MAIN_STAFF") && session?.user?.mainMahallaId) {
    const mainMahalla = await prisma.mainMahalla.findUnique({
      where: { id: session.user.mainMahallaId },
      select: { name: true },
    });
    stats.mainMahallaName = mainMahalla?.name || "";
    stats.subMahallas = await prisma.subMahalla.count({ where: { mainMahallaId: session.user.mainMahallaId } });
    stats.totalMembers = await prisma.familyMember.count({
      where: {
        familyCard: {
          subMahalla: {
            mainMahallaId: session.user.mainMahallaId,
          },
        },
      },
    });
    stats.maleMembers = await prisma.familyMember.count({
      where: {
        gender: { equals: "Male", mode: "insensitive" },
        familyCard: {
          subMahalla: {
            mainMahallaId: session.user.mainMahallaId,
          },
        },
      },
    });
    stats.femaleMembers = await prisma.familyMember.count({
      where: {
        gender: { equals: "Female", mode: "insensitive" },
        familyCard: {
          subMahalla: {
            mainMahallaId: session.user.mainMahallaId,
          },
        },
      },
    });

    const subMahallasData = await prisma.subMahalla.findMany({
      where: { mainMahallaId: session.user.mainMahallaId },
      include: {
        familyCards: {
          include: {
            members: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    chartData = subMahallasData.map((sm) => {
      const allMembers = sm.familyCards.flatMap((fc) => fc.members);
      return {
        name: sm.name,
        total: allMembers.length,
        males: allMembers.filter((m) => m.gender?.toLowerCase() === "male").length,
        females: allMembers.filter((m) => m.gender?.toLowerCase() === "female").length,
      };
    });
  } else if (role === "SUB_ADMIN" && session?.user?.subMahallaId) {
    const subMahalla = await prisma.subMahalla.findUnique({
      where: { id: session.user.subMahallaId },
      select: { name: true },
    });
    stats.mainMahallaName = subMahalla?.name || "";
    stats.totalMembers = await prisma.familyMember.count({
      where: {
        familyCard: {
          subMahallaId: session.user.subMahallaId,
        },
      },
    });
    stats.maleMembers = await prisma.familyMember.count({
      where: {
        gender: { equals: "Male", mode: "insensitive" },
        familyCard: {
          subMahallaId: session.user.subMahallaId,
        },
      },
    });
    stats.femaleMembers = await prisma.familyMember.count({
      where: {
        gender: { equals: "Female", mode: "insensitive" },
        familyCard: {
          subMahallaId: session.user.subMahallaId,
        },
      },
    });

    const sm = await prisma.subMahalla.findUnique({
      where: { id: session.user.subMahallaId },
      include: {
        familyCards: {
          include: {
            members: true,
          },
        },
      },
    });
    if (sm) {
      const allMembers = sm.familyCards.flatMap((fc) => fc.members);
      chartData = [
        {
          name: sm.name,
          total: allMembers.length,
          males: allMembers.filter((m) => m.gender?.toLowerCase() === "male").length,
          females: allMembers.filter((m) => m.gender?.toLowerCase() === "female").length,
        },
      ];
    }
  }

  // Calculate maximum value to scale the Y-axis correctly
  const maxVal = Math.max(...chartData.flatMap((d) => [d.total, d.males, d.females]), 5);

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

        {(role === "PLATFORM_ADMIN" || role === "MAIN_ADMIN" || role === "MAIN_STAFF" || role === "SUB_ADMIN") && (
          <StatCard
            title="Male Members"
            value={stats.maleMembers.toString()}
            icon={<User className="w-6 h-6 text-blue-500" />}
            trend={
              (role === "MAIN_ADMIN" || role === "MAIN_STAFF") ? "From All Sub Mahallas" :
                role === "SUB_ADMIN" ? `In ${stats.mainMahallaName}` :
                  "Global Male Count"
            }
          />
        )}

        {(role === "PLATFORM_ADMIN" || role === "MAIN_ADMIN" || role === "MAIN_STAFF" || role === "SUB_ADMIN") && (
          <StatCard
            title="Female Members"
            value={stats.femaleMembers.toString()}
            icon={<User className="w-6 h-6 text-pink-500" />}
            trend={
              (role === "MAIN_ADMIN" || role === "MAIN_STAFF") ? "From All Sub Mahallas" :
                role === "SUB_ADMIN" ? `In ${stats.mainMahallaName}` :
                  "Global Female Count"
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

      {/* Demographic Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Demographic Distribution</h3>
            <p className="text-xs text-slate-500 font-medium">Comparison of Total, Male, and Female members across sub-mahallas</p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-md shadow-sm border border-indigo-100" />
              <span>Total Members</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-gradient-to-t from-blue-600 to-blue-500 rounded-md shadow-sm border border-blue-100" />
              <span>Male</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-gradient-to-t from-pink-600 to-pink-500 rounded-md shadow-sm border border-pink-100" />
              <span>Female</span>
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="relative pt-8 pb-4">
          {/* Y-Axis Grid Lines */}
          <div className="absolute inset-x-0 top-8 bottom-12 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 w-8 text-right">
                  {Math.round(maxVal - (maxVal * i) / 4)}
                </span>
                <div className="flex-1 border-b border-dashed border-slate-100" />
              </div>
            ))}
          </div>

          {/* Bar Groups Container */}
          <div className="relative z-10 pl-12 h-64 flex items-end justify-around gap-6 overflow-x-auto min-w-[300px]">
            {chartData.map((data, index) => {
              const totalHeight = (data.total / maxVal) * 82;
              const maleHeight = (data.males / maxVal) * 82;
              const femaleHeight = (data.females / maxVal) * 82;

              return (
                <div key={index} className="flex flex-col items-center flex-1 max-w-[200px] h-full justify-end group">
                  {/* Bars Group */}
                  <div className="flex items-end gap-2.5 h-full w-full justify-center px-2">
                    {/* Total Bar */}
                    <div className="flex flex-col items-center justify-end group/bar relative w-8 sm:w-10 h-full">
                      {/* Permanent label on top */}
                      <span className="text-[14px] font-extrabold text-indigo-700 mb-1 z-10">
                        {data.total}
                      </span>
                      <div
                        style={{ height: `${totalHeight}%` }}
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl shadow-md group-hover/bar:brightness-110 transition-all relative overflow-hidden min-h-[4px]"
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[pulse_3s_infinite]" />
                      </div>
                    </div>

                    {/* Male Bar */}
                    <div className="flex flex-col items-center justify-end group/bar relative w-8 sm:w-10 h-full">
                      {/* Permanent label on top */}
                      <span className="text-[14px] font-extrabold text-blue-700 mb-1 z-10">
                        {data.males}
                      </span>
                      <div
                        style={{ height: `${maleHeight}%` }}
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-xl shadow-md group-hover/bar:brightness-110 transition-all relative overflow-hidden min-h-[4px]"
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[pulse_3s_infinite]" />
                      </div>
                    </div>

                    {/* Female Bar */}
                    <div className="flex flex-col items-center justify-end group/bar relative w-8 sm:w-10 h-full">
                      {/* Permanent label on top */}
                      <span className="text-[14px] font-extrabold text-pink-700 mb-1 z-10">
                        {data.females}
                      </span>
                      <div
                        style={{ height: `${femaleHeight}%` }}
                        className="w-full bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-xl shadow-md group-hover/bar:brightness-110 transition-all relative overflow-hidden min-h-[4px]"
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[pulse_3s_infinite]" />
                      </div>
                    </div>
                  </div>

                  {/* Sub Mahalla Label */}
                  <div className="text-center mt-3 max-w-full">
                    <span className="block text-xs font-black text-slate-700 uppercase truncate px-1">
                      {data.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  alert,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  alert?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">{icon}</div>
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
        <p className={`text-sm mt-2 font-medium ${alert ? "text-amber-600" : "text-emerald-600"}`}>{trend}</p>
      </div>
    </div>
  );
}
