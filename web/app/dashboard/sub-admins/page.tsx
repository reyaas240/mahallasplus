import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { SubAdminForm } from "./SubAdminForm";
import { UserTableActions } from "./UserTableActions";

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

  // Fetch existing users (Sub Admins & Mahalla Staff)
  const users = await prisma.user.findMany({
    where: { 
      role: { in: ["SUB_ADMIN", "MAIN_STAFF"] },
      mainMahallaId: session.user.mainMahallaId
    },
    include: { subMahalla: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">User Management</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Assign and manage administrators for your Mahalla and Sub Mahallas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <SubAdminForm subMahallas={subMahallas} />
        </div>
        
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Administrator Registry</h3>
            </div>
            {users.length === 0 ? (
              <div className="p-16 text-center">
                <ShieldCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No administrators created yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                      <th className="p-6">Administrator</th>
                      <th className="p-6">Role / Type</th>
                      <th className="p-6">Assignment</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((admin) => (
                      <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs uppercase">
                              {admin.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 uppercase text-xs tracking-wide">{admin.name || "N/A"}</p>
                              <p className="text-[10px] font-bold text-slate-500 lowercase mt-0.5">{admin.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${admin.role === 'MAIN_STAFF' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                            {admin.role === 'MAIN_STAFF' ? 'Mahalla Staff' : 'Sub Admin'}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${admin.role === 'MAIN_STAFF' ? 'bg-indigo-400' : 'bg-blue-400'}`} />
                             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                {admin.role === 'MAIN_STAFF' ? 'Main Mahalla' : (admin.subMahalla?.name || "Unassigned")}
                             </span>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                           <UserTableActions user={admin} subMahallas={subMahallas} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
