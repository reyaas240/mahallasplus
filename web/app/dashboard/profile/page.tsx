import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, Lock, Mail, Shield, UserCircle2, Calendar, Key } from "lucide-react";
import { UserProfileForm } from "./UserProfileForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      mainMahalla: true,
      subMahalla: true
    }
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Account Settings</h2>
        <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-wider">Manage your personal identity & security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-8 space-y-10">
          <UserProfileForm user={user} />
          <ChangePasswordForm />
        </div>

        <div className="md:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-[60px] -mr-16 -mt-16 opacity-50" />
            <div className="relative text-center">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-4 font-black text-2xl shadow-xl shadow-slate-200">
                {user.name?.charAt(0) || "U"}
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight">{user.name}</h3>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{user.role?.replace('_', ' ')}</p>
            </div>

            <div className="mt-8 space-y-4 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-500">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Identity Verified</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-8 rounded-[32px] text-white shadow-2xl shadow-blue-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[60px] -mr-16 -mt-16" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Building className="w-4 h-4" /> Organization Context
            </h4>
            <div className="space-y-4 relative">
              <div>
                <p className="text-[8px] font-black text-blue-200 uppercase tracking-widest mb-1">Main Mahalla</p>
                <p className="text-sm font-black uppercase tracking-tight">{user.mainMahalla?.name || "Global Platform"}</p>
              </div>
              {user.subMahalla && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[8px] font-black text-blue-200 uppercase tracking-widest mb-1">Sub Mahalla</p>
                  <p className="text-sm font-black uppercase tracking-tight">{user.subMahalla.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Building({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>
  );
}
