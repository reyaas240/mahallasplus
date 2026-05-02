import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Building } from "lucide-react";
import { SubMahallaForm } from "./SubMahallaForm";

export default async function SubMahallasPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "MAIN_ADMIN" || !session?.user?.mainMahallaId) {
    redirect("/dashboard");
  }

  const subMahallas = await prisma.subMahalla.findMany({
    where: { mainMahallaId: session.user.mainMahallaId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sub Mahallas</h2>
          <p className="text-slate-600">Manage all sub-mahallas under your jurisdiction.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SubMahallaForm />
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {subMahallas.length === 0 ? (
              <div className="p-8 text-center">
                <Building className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No Sub Mahallas created yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="font-medium p-4">Name</th>
                    <th className="font-medium p-4">Area</th>
                    <th className="font-medium p-4">Email</th>
                    <th className="font-medium p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subMahallas.map((sm) => (
                    <tr key={sm.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-900">{sm.name}</td>
                      <td className="p-4 text-slate-600">{sm.area || "-"}</td>
                      <td className="p-4 text-slate-600">{sm.email || "-"}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          sm.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {sm.status}
                        </span>
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
