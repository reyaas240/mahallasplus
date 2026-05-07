import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";
import { RequestActions } from "./RequestActions";

export default async function RequestsPage() {
  const requests = await prisma.registrationRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { licensePlan: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pending Requests</h2>
          <p className="text-slate-600">Review and approve new Mahalla registration requests.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">All Caught Up</h3>
            <p className="text-slate-500">There are no pending registration requests.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((req) => (
              <div key={req.id} className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{req.mahallaName}</h3>
                    <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                      {req.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {req.licensePlan?.name} Plan
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                    <div>
                      <p className="font-medium text-slate-400 text-xs uppercase mb-0.5">Applicant</p>
                      <p>{req.fullName}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-400 text-xs uppercase mb-0.5">Email</p>
                      <p>{req.email}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-400 text-xs uppercase mb-0.5">Phone</p>
                      <p>{req.phone}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-400 text-xs uppercase mb-0.5">Date</p>
                      <p>{req.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <RequestActions request={req} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
