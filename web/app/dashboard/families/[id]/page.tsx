import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { ChevronLeft, UserPlus, Trash2, Edit3, Calendar, CreditCard, MapPin, Users, Phone, Map, Image as ImageIcon, FileText } from "lucide-react";
import Link from "next/link";
import { FamilyMemberForm } from "./FamilyMemberForm";
import { FamilyMemberActions } from "./FamilyMemberActions";
import { FamilyCardEditShortcut } from "./FamilyCardEditShortcut";

export default async function FamilyDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !["MAIN_ADMIN", "SUB_ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const family = await prisma.familyCard.findUnique({
    where: { id: params.id },
    include: {
      subMahalla: true,
      members: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const [occupations, grades, schools] = await Promise.all([
    prisma.masterOccupation.findMany({ orderBy: { name: "asc" } }),
    prisma.masterGrade.findMany({ orderBy: { name: "asc" } }),
    prisma.masterSchool.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!family) return notFound();

  // Security check: Ensure admin belongs to the right Mahalla
  if (session.user.role === "MAIN_ADMIN" && family.subMahalla.mainMahallaId !== session.user.mainMahallaId) {
    redirect("/dashboard/families");
  }
  if (session.user.role === "SUB_ADMIN" && family.subMahallaId !== session.user.subMahallaId) {
    redirect("/dashboard/families");
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard/families" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-2">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Families
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Family Record <span className="text-blue-600">#{family.subMahallaCardNo}</span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Members List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Family Members ({family.members.length})
              </h3>
              <FamilyMemberForm cardId={family.id} occupations={occupations} grades={grades} schools={schools} />
            </div>
            
            <div className="divide-y divide-slate-100">
              {family.members.length === 0 ? (
                <div className="p-12 text-center text-slate-400 font-medium italic">
                  No members registered yet.
                </div>
              ) : (
                family.members.map((member) => (
                  <div key={member.id} className="p-6 flex justify-between items-start hover:bg-slate-50/50 transition-colors group">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                        {member.fullName.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">{member.title} {member.fullName}</h4>
                          {member.isBreadwinner && (
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-black px-2 py-0.5 rounded-md border border-emerald-200 tracking-wider">Breadwinner</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> NIC: {member.nic || "N/A"}</span>
                          {member.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {member.phone}</span>}
                          <span className="flex items-center gap-1 uppercase text-[11px] font-black text-slate-400">{member.relationship}</span>
                          <span className="flex items-center gap-1 italic">{new Date().getFullYear() - new Date(member.dob).getFullYear()} Years Old</span>
                        </div>
                        <div className="text-sm text-slate-500 font-medium mt-1">
                          Status: <span className="text-slate-700">{member.maritalStatus}</span> {member.occupation && <span className="text-slate-400 mx-2">•</span>} <span className="text-slate-700">{member.occupation}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FamilyMemberActions member={member} occupations={occupations} grades={grades} schools={schools} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Summary Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Users className="w-24 h-24" />
            </div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" /> Mahalla Details
              </h3>
              <FamilyCardEditShortcut family={family} subMahallas={[family.subMahalla]} />
            </div>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 text-sm font-medium">Sub Mahalla</span>
                <span className="font-bold">{family.subMahalla.name}</span>
              </div>
              <div className="flex flex-col border-b border-slate-800 pb-2">
                <span className="text-slate-400 text-sm font-medium mb-1">Residential Address</span>
                <span className="font-bold text-sm leading-relaxed">{family.address || "No address registered"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 text-sm font-medium">Living Type</span>
                <span className="font-bold">{family.livingType.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 text-sm font-medium">Main Card No</span>
                <span className="font-bold text-blue-400">{family.mainMahallaCardNo}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-400 text-sm font-medium">Sub Card No</span>
                <span className="font-bold text-emerald-400">{family.subMahallaCardNo}</span>
              </div>
            </div>
          </div>

          {family.attachments.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" /> Documents & Images
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {family.attachments.map((path: string, i: number) => (
                  <a 
                    key={i} 
                    href={path} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group relative aspect-square bg-slate-50 rounded-xl border border-slate-100 overflow-hidden hover:border-blue-200 transition-all"
                  >
                    {path.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img src={path} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Attachment ${i+1}`} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                        <FileText className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors" />
                        <span className="text-[8px] font-black uppercase text-slate-400 mt-1">View Document</span>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
