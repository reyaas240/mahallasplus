import { prisma } from "@/lib/prisma";
import { Plus, Search, Building } from "lucide-react";

export default async function MainMahallasPage() {
  const mahallas = await prisma.mainMahalla.findMany();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Main Mahallas</h2>
          <p className="text-slate-600">Manage all registered Main Mahallas on the platform.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" /> Add New
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search mahallas..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
            />
          </div>
        </div>

        {mahallas.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <Building className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No Main Mahallas Found</h3>
            <p className="text-slate-500">You haven't created any Main Mahallas yet.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="font-medium p-4">Name</th>
                <th className="font-medium p-4">Country</th>
                <th className="font-medium p-4">Status</th>
                <th className="font-medium p-4">Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {mahallas.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-900">{m.name}</td>
                  <td className="p-4 text-slate-600">{m.country || "Not set"}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${m.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{m.registeredDate.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
