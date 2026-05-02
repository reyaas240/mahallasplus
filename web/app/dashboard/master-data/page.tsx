import { Settings, MapPin, Map, GraduationCap, Briefcase } from "lucide-react";
import Link from "next/link";

export default function MasterDataPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Master Data Management</h2>
          <p className="text-slate-600">Manage global definitions for locations, schools, and occupations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DataCard href="/dashboard/master-data/countries" title="Countries" description="Manage countries, currencies and codes." icon={<MapPin className="w-6 h-6 text-blue-600" />} />
        <DataCard href="/dashboard/master-data/provinces" title="Provinces" description="Manage regional provinces and states." icon={<Map className="w-6 h-6 text-indigo-600" />} />
        <DataCard href="/dashboard/master-data/districts" title="Districts" description="Manage sub-regional districts." icon={<Map className="w-6 h-6 text-emerald-600" />} />
        <DataCard href="/dashboard/master-data/areas" title="Areas" description="Manage local areas and territories." icon={<MapPin className="w-6 h-6 text-amber-600" />} />
        <DataCard href="/dashboard/master-data/schools" title="Schools" description="Manage educational institutions." icon={<GraduationCap className="w-6 h-6 text-purple-600" />} />
        <DataCard href="/dashboard/master-data/grades" title="Grades" description="Manage education grade levels." icon={<GraduationCap className="w-6 h-6 text-purple-500" />} />
        <DataCard href="/dashboard/master-data/occupations" title="Occupations" description="Manage job titles and professions." icon={<Briefcase className="w-6 h-6 text-rose-600" />} />
      </div>
    </div>
  );
}

function DataCard({ title, description, icon, href }: { title: string, description: string, icon: React.ReactNode, href: string }) {
  return (
    <Link href={href} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group block">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-slate-600 mt-1">{description}</p>
    </Link>
  );
}
