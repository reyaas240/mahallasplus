"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-red-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 border border-transparent transition-colors font-medium text-sm"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}
