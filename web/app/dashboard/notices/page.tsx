import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNotices } from "@/app/actions/notices";
import Link from "next/link";
import { Plus, Bell, Clock, CheckCircle2, User, Globe, MapPin } from "lucide-react";
import { NoticeStatus } from "@prisma/client";
import { getProxiedImageUrl, stripHtml } from "@/lib/utils";
import { Edit3 } from "lucide-react";

export default async function NoticesPage() {
  const session = await getServerSession(authOptions);
  const notices = await getNotices();
  const isAdmin = ["MAIN_ADMIN", "MAIN_STAFF", "SUB_ADMIN"].includes(session?.user?.role as string);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Mahalla Notices</h2>
          <p className="text-slate-500 font-medium mt-1">Manage and view community announcements.</p>
        </div>
        {isAdmin && (
          <Link 
            href="/dashboard/notices/new" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
          >
            <Plus className="w-4 h-4" /> Create Notice
          </Link>
        )}
      </div>

      {notices.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Bell className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-2">No Notices Yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto">When admins publish announcements, they will appear here for the community.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {notices.map((notice) => (
            <div key={notice.id} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all duration-500 flex flex-col">
              {/* Cover Image */}
              <div className="aspect-video relative overflow-hidden bg-slate-100">
                {notice.coverImage ? (
                  <img 
                    src={getProxiedImageUrl(notice.coverImage)} 
                    alt={notice.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Bell className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                    notice.status === NoticeStatus.PUBLISHED 
                      ? "bg-emerald-500 text-white" 
                      : "bg-amber-500 text-white"
                  }`}>
                    {notice.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                  <span className="mx-1">•</span>
                  <User className="w-3 h-3" />
                  <span>{notice.author?.name || "Admin"}</span>
                </div>

                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {notice.title}
                </h3>

                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">
                  {stripHtml(notice.content)}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {notice.targetAllSub ? (
                      <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">
                        <Globe className="w-3 h-3" /> All Sub Mahallas
                      </div>
                    ) : notice.targetSubMahallaIds.length > 0 ? (
                      <div className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">
                        <MapPin className="w-3 h-3" /> {notice.targetSubMahallaIds.length} Targeted
                      </div>
                    ) : notice.subMahalla ? (
                      <div className="flex items-center gap-1 text-slate-600 bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">
                        <MapPin className="w-3 h-3" /> {notice.subMahalla.name}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">
                        <MapPin className="w-3 h-3" /> Local Only
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {isAdmin && notice.status !== NoticeStatus.PUBLISHED && (
                      <Link 
                        href={`/dashboard/notices/edit/${notice.id}`}
                        className="text-slate-400 hover:text-slate-900 transition-colors"
                        title="Edit Notice"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    )}
                    <Link 
                      href={`/dashboard/notices/${notice.id}`}
                      className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
