import { prisma } from "@/lib/prisma";
import { MapPin, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { CountryForm } from "./CountryForm";

export default async function CountriesPage() {
  const countries = await prisma.masterCountry.findMany();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard/master-data" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 mb-2 font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Master Data
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">Countries</h2>
          <p className="text-slate-600">Manage countries available in the system.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CountryForm />
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {countries.length === 0 ? (
              <div className="p-8 text-center">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No countries added yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                    <th className="font-medium p-4">Name</th>
                    <th className="font-medium p-4">Code</th>
                    <th className="font-medium p-4">Currency</th>
                    <th className="font-medium p-4 text-center">Decimals</th>
                  </tr>
                </thead>
                <tbody>
                  {countries.map(c => (
                    <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-900">{c.name}</td>
                      <td className="p-4 text-slate-600">{c.code}</td>
                      <td className="p-4 text-slate-600">{c.currency}</td>
                      <td className="p-4 text-slate-600 text-center">{c.currencyDecimalPlaces}</td>
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
