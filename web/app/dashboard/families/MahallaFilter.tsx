"use client";
import { useRouter, useSearchParams } from "next/navigation";

export function MahallaFilter({ subMahallas, defaultId = "" }: { subMahallas: any[], defaultId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("mahallaId") || defaultId;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set("mahallaId", id);
    } else {
      params.delete("mahallaId");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <label className="text-sm font-bold text-slate-700">Filter by Sub Mahalla:</label>
      <select 
        value={selectedId} 
        onChange={handleChange}
        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 font-bold text-slate-900"
      >
        <option value="">-- All Active Mahallas --</option>
        {subMahallas.filter(m => m.status === 'ACTIVE').map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
    </div>
  );
}
