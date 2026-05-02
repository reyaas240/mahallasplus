import { prisma } from "@/lib/prisma";
import { ChevronLeft, Database } from "lucide-react";
import Link from "next/link";
import { MasterDataForm } from "./MasterDataForm";
import { notFound } from "next/navigation";

const config: any = {
  provinces: { model: "masterProvince", title: "Provinces", singular: "Province", parentModel: "masterCountry", parentKey: "countryId", parentName: "Country" },
  districts: { model: "masterDistrict", title: "Districts", singular: "District", parentModel: "masterProvince", parentKey: "provinceId", parentName: "Province" },
  areas: { model: "masterArea", title: "Areas", singular: "Area", parentModel: "masterDistrict", parentKey: "districtId", parentName: "District" },
  schools: { model: "masterSchool", title: "Schools", singular: "School" },
  grades: { model: "masterGrade", title: "Grades", singular: "Grade" },
  occupations: { model: "masterOccupation", title: "Occupations", singular: "Occupation" },
};

export default async function GenericMasterDataPage(props: { params: Promise<{ type: string }> }) {
  const params = await props.params;
  const typeConfig = config[params.type as keyof typeof config];
  
  if (!typeConfig) return notFound();

  // @ts-ignore - dynamic prisma call
  const items = await prisma[typeConfig.model].findMany({ orderBy: { name: 'asc' }, include: typeConfig.parentKey ? { [typeConfig.parentModel.replace("master", "").toLowerCase()]: true } : undefined });
  
  let parentRecords = [];
  if (typeConfig.parentModel) {
    // @ts-ignore
    parentRecords = await prisma[typeConfig.parentModel].findMany({ orderBy: { name: 'asc' } });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard/master-data" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 mb-2 font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Master Data
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">{typeConfig.title}</h2>
          <p className="text-slate-600">Manage {typeConfig.title.toLowerCase()} available in the system.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <MasterDataForm type={params.type} singularName={typeConfig.singular} parentKey={typeConfig.parentKey} parentName={typeConfig.parentName} parents={parentRecords} />
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {items.length === 0 ? (
              <div className="p-8 text-center">
                <Database className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No {typeConfig.title.toLowerCase()} added yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="font-medium p-4">Name</th>
                    {typeConfig.parentName && <th className="font-medium p-4">{typeConfig.parentName}</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-900">{item.name}</td>
                      {typeConfig.parentName && <td className="p-4 text-slate-600">{item[typeConfig.parentModel.replace("master", "").toLowerCase()]?.name}</td>}
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
