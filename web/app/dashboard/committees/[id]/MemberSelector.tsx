"use client";
import { useState } from "react";
import { Search, UserPlus, Loader2, MapPin, X } from "lucide-react";
import { addCommitteeMember } from "@/app/actions/committee";

export function MemberSelector({ committeeId, allMembers }: { committeeId: string, allMembers: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [role, setRole] = useState("Member");

  const filteredMembers = allMembers.filter(m => 
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.familyCard.subMahalla.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const handleAdd = async () => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    const res = await addCommitteeMember(committeeId, selectedMember.id, role);
    setIsSubmitting(false);
    
    if (res.success) {
      setSelectedMember(null);
      setSearchTerm("");
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
          <UserPlus className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Assign Member</h3>
      </div>

      <div className="space-y-6">
        {!selectedMember ? (
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Search Family Member</label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name or Sub Mahalla..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all font-bold text-slate-900 text-sm"
              />
            </div>

            {searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-50">
                {filteredMembers.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No results</div>
                ) : (
                  filteredMembers.map(m => (
                    <button 
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className="w-full p-4 flex items-center gap-3 hover:bg-emerald-50 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 group-hover:bg-white transition-colors">
                        {m.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{m.fullName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {m.familyCard.subMahalla.name}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl relative group">
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-3 right-3 text-emerald-400 hover:text-emerald-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-black text-emerald-600 shadow-sm">
                {selectedMember.fullName.charAt(0)}
              </div>
              <div>
                <p className="font-black text-slate-900 uppercase tracking-wide">{selectedMember.fullName}</p>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{selectedMember.familyCard.subMahalla.name}</p>
              </div>
            </div>
            
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Committee Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all font-black text-slate-900 text-xs uppercase tracking-widest"
                >
                  <option value="President">President</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Organizer">Organizer</option>
                  <option value="Member">Member</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </div>

              <button 
                onClick={handleAdd}
                disabled={isSubmitting}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all flex justify-center items-center gap-3 active:scale-95 shadow-lg shadow-emerald-100"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Assignment"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
