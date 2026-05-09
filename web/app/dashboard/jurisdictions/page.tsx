import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MapPin, Globe, ShieldAlert } from "lucide-react";
import { SubAreaManager } from "../components/SubAreaManager";

export default async function JurisdictionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.mainMahallaId) redirect("/dashboard");

  const mainMahalla = await prisma.mainMahalla.findUnique({
    where: { id: session.user.mainMahallaId },
    select: { name: true, area: true }
  });

  if (!mainMahalla?.area) {
    return (
      <div className="p-12 text-center bg-white rounded-[40px] border border-slate-200">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Geographic Context Missing</h2>
        <p className="text-slate-500 text-sm mt-2">Your Mahalla profile does not have a City/Area assigned. Please update your profile first.</p>
      </div>
    );
  }

  // Find the MasterArea (City)
  const masterArea = await prisma.masterArea.findFirst({
    where: { name: { equals: mainMahalla.area, mode: 'insensitive' } },
    include: { subAreas: { orderBy: { name: 'asc' } } }
  });

  if (!masterArea) {
    return (
      <div className="p-12 text-center bg-white rounded-[40px] border border-slate-200">
        <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">City Registry Not Found</h2>
        <p className="text-slate-500 text-sm mt-2">The city "{mainMahalla.area}" is not registered in the system master data. Please contact platform support.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Local Jurisdictions</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage sub-areas and neighborhood boundaries for {mainMahalla.area}.</p>
        </div>
        <div className="bg-blue-600/5 px-4 py-2 rounded-2xl border border-blue-600/10 flex items-center gap-2">
           <Globe className="w-4 h-4 text-blue-600" />
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{mainMahalla.area} City Core</span>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden p-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">
             <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-wide">Manage Sub-Areas</h3>
            <p className="text-xs text-slate-500 font-medium">Add or edit localized zones where your sub-mahallas operate.</p>
          </div>
        </div>

        <div className="bg-slate-50/50 rounded-3xl p-8 border border-slate-100">
          <SubAreaManager areaId={masterArea.id} initialSubAreas={masterArea.subAreas} />
        </div>

        <div className="mt-8 p-6 bg-blue-50/30 rounded-2xl border border-blue-100 flex items-start gap-4">
           <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-blue-600" />
           </div>
           <div>
              <p className="text-[10px] font-black text-blue-900 uppercase tracking-[0.1em] mb-1">Regional Notice</p>
              <p className="text-xs text-blue-700/80 font-medium leading-relaxed">
                Sub-areas added here will be immediately available for selection when creating or editing Sub-Mahallas. These entries are specific to the <strong>{mainMahalla.area}</strong> city registry.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
