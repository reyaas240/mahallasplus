import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NoticeEditor from "@/components/notices/NoticeEditor";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditNoticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;

  const role = session.user.role;
  const mainMahallaId = session.user.mainMahallaId;

  const notice = await prisma.notice.findUnique({
    where: { id },
    include: { attachments: true }
  });

  if (!notice) return notFound();

  // Redirect if already published
  if (notice.status === "PUBLISHED") {
    redirect(`/dashboard/notices/${id}`);
  }

  // Authorization check
  if (notice.authorId !== session.user.id && !["MAIN_ADMIN", "MAIN_STAFF"].includes(role as string)) {
    return notFound();
  }

  // Fetch sub-mahallas for targeting if Main Admin
  const subMahallas = (role === "MAIN_ADMIN" || role === "MAIN_STAFF") 
    ? await prisma.subMahalla.findMany({
        where: { mainMahallaId: mainMahallaId! },
        select: { id: true, name: true },
        orderBy: { name: "asc" }
      })
    : [];

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/notices" 
          className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Editing Announcement</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Edit Notice</h2>
        </div>
      </div>

      <NoticeEditor 
        role={role} 
        subMahallas={subMahallas} 
        initialData={notice}
      />
    </div>
  );
}
