import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { SubAdminForm } from "./SubAdminForm";

export default async function SubAdminsPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "MAIN_ADMIN" || !session?.user?.mainMahallaId) {
    redirect("/dashboard");
  }

  // Fetch available sub mahallas for the dropdown
  const subMahallas = await prisma.subMahalla.findMany({
    where: { mainMahallaId: session.user.mainMahallaId },
    orderBy: { name: 'asc' }
  });

  // Fetch existing sub admins
  const subAdmins = await prisma.user.findMany({
    where: { 
      role: "SUB_ADMIN",
      mainMahallaId: session.user.mainMahallaId
    },
    include: { subMahalla: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sub Admins</h2>
          <p className="text-slate-600">Assign and manage administrators for your Sub Mahallas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SubAdminForm subMahallas={subMahallas} />
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {subAdmins.length === 0 ? (
              <div className="p-8 text-center">
                <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No Sub Admins created yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="font-medium p-4">Name</th>
                    <th className="font-medium p-4">Email</th>
                    <th className="font-medium p-4">Assigned To</th>
                  </tr>
                </thead>
                <tbody>
                  {subAdmins.map((admin) => (
                    <tr key={admin.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-900">{admin.name || "N/A"}</td>
                      <td className="p-4 text-slate-600">{admin.email}</td>
                      <td className="p-4 text-slate-600 font-medium">
                        {admin.subMahalla?.name || "Unassigned"}
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
