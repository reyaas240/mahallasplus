import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ChevronLeft, Calendar, User, Download, FileText, Globe, MapPin, Edit3 } from "lucide-react";
import { getProxiedImageUrl } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import NoticeAttachments from "@/components/notices/NoticeAttachments";

export default async function NoticeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const notice = await prisma.notice.findUnique({
    where: { id },
    include: {
      author: true,
      attachments: true,
      subMahalla: true,
      mainMahalla: true,
    }
  });

  if (!notice) notFound();

  const targetedSubMahallas = notice.targetSubMahallaIds.length > 0
    ? await prisma.subMahalla.findMany({
        where: { id: { in: notice.targetSubMahallaIds } },
        select: { name: true }
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <Link 
          href="/dashboard/notices" 
          className="flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-colors group"
        >
          <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center group-hover:border-slate-900 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Feed</span>
        </Link>

        {(session.user.role === "MAIN_ADMIN" || notice.authorId === session.user.id) && notice.status !== "PUBLISHED" && (
          <Link 
            href={`/dashboard/notices/edit/${notice.id}`}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-lg"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Notice
          </Link>
        )}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
        {/* Header Section */}
        {notice.coverImage && (
          <div className="aspect-[21/9] w-full overflow-hidden">
            <img src={getProxiedImageUrl(notice.coverImage)} className="w-full h-full object-cover" alt={notice.title} />
          </div>
        )}

        <div className="p-12 md:p-16 space-y-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                notice.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}>
                {notice.status}
              </span>
              
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {new Date(notice.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <User className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{notice.author?.name}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight uppercase tracking-tight">
              {notice.title}
            </h1>

            <div className="flex flex-wrap gap-2">
              {notice.targetAllSub ? (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                  <Globe className="w-3.5 h-3.5" /> Broadcast: All Sub Mahallas
                </div>
              ) : targetedSubMahallas.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {targetedSubMahallas.map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
                      <MapPin className="w-3.5 h-3.5" /> {sub.name}
                    </div>
                  ))}
                </div>
              ) : notice.subMahalla ? (
                <div className="flex items-center gap-2 bg-slate-50 text-slate-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
                  <MapPin className="w-3.5 h-3.5" /> Context: {notice.subMahalla.name}
                </div>
              ) : null}
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <div 
              className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />
          </div>

          {/* Attachments */}
          {notice.attachments.length > 0 && (
            <NoticeAttachments attachments={notice.attachments} />
          )}
        </div>
      </div>
    </div>
  );
}
