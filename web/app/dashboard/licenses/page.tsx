import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLicensePlans } from "@/app/actions/licensePlans";
import { Plus, Tag, Calendar, Shield, MoreVertical, Edit2, Trash2, Power, CheckCircle2, AlertCircle } from "lucide-react";
import { CreateLicenseButton } from "./CreateLicenseButton";
import { LicenseActions } from "./LicenseActions";

export default async function LicensesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PLATFORM_ADMIN") {
    redirect("/dashboard");
  }

  const plans = await getLicensePlans();

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">License Plans</h2>
          <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-[0.2em]">Manage dynamic subscription models and sale pricing</p>
        </div>
        <CreateLicenseButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden group hover:border-blue-200 transition-all">
            <div className={`p-8 ${plan.status === 'ACTIVE' ? 'bg-gradient-to-br from-slate-50 to-white' : 'bg-slate-50 opacity-60'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${plan.status === 'ACTIVE' ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-500'}`}>
                  <Shield className="w-6 h-6" />
                </div>
                <LicenseActions plan={plan} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{plan.name}</h3>
                  {plan.isDefault && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-blue-100">Default</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{plan.type} BILLING</span>
                </div>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                {plan.isSaleActive && plan.salePrice ? (
                  <>
                    <span className="text-3xl font-black text-slate-900 leading-none">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(plan.salePrice)}
                    </span>
                    <span className="text-sm font-bold text-slate-400 line-through">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(plan.basePrice)}
                    </span>
                    <span className="ml-auto px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-tighter">SALE ACTIVE</span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-slate-900 leading-none">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(plan.basePrice)}
                  </span>
                )}
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Included Features</p>
                <div className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs font-bold">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {plan.description && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic line-clamp-2">
                    "{plan.description}"
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">No License Plans Configured</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Establish your first billing model to start registrations</p>
          </div>
        )}
      </div>
    </div>
  );
}
