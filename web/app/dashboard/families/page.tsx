import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, FileText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { FamilyCardForm } from "./FamilyCardForm";

export default async function FamiliesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  let subMahallas: any[] = [];
  let families: any[] = [];

  if (session.user.role === "MAIN_ADMIN") {
    subMahallas = await prisma.subMahalla.findMany({
      where: { mainMahallaId: session.user.mainMahallaId as string },
      orderBy: { name: "asc" },
    });
    families = await prisma.familyCard.findMany({
      where: { subMahalla: { mainMahallaId: session.user.mainMahallaId as string } },
      include: { subMahalla: true, _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
    });
  } else {
    families = await prisma.familyCard.findMany({
      where: { subMahallaId: session.user.subMahallaId as string },
      include: { subMahalla: true, _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
    });
    const sm = await prisma.subMahalla.findUnique({ where: { id: session.user.subMahallaId as string } });
    if (sm) subMahallas = [sm];
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Family Management</h2>
          <p className="text-slate-600">Register and manage family records within mahallas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FamilyCardForm subMahallas={subMahallas} userRole={session.user.role} />
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search by Card No or Family Head..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {families.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No family cards found.</p>
                <p className="text-sm text-slate-400">Start by creating the first family card for this mahalla.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="font-medium p-4">Card Numbers</th>
                    <th className="font-medium p-4">Mahalla</th>
                    <th className="font-medium p-4 text-center">Members</th>
                    <th className="font-medium p-4">Type</th>
                    <th className="font-medium p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {families.map((f) => (
                    <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-slate-900 font-bold text-sm">M: {f.mainMahallaCardNo || "N/A"}</span>
                          <span className="text-slate-500 text-xs font-medium">S: {f.subMahallaCardNo || "N/A"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 text-sm font-medium">{f.subMahalla.name}</td>
                      <td className="p-4 text-center">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-100">
                          {f._count.members}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {f.livingType.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/dashboard/families/${f.id}`} className="text-blue-600 hover:text-blue-800 font-bold text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 inline-flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" /> Manage Members
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
