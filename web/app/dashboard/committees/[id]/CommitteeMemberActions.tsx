"use client";
import { useState } from "react";
import { Shield, ShieldOff, Trash2, Loader2 } from "lucide-react";
import { removeCommitteeMember, toggleMemberAccess } from "@/app/actions/committee";

export function CommitteeMemberActions({ member }: { member: any }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Remove ${member.familyMember.fullName} from this committee?`)) {
      setIsDeleting(true);
      await removeCommitteeMember(member.id);
      setIsDeleting(false);
    }
  };

  const handleToggleAccess = async () => {
    setIsToggling(true);
    await toggleMemberAccess(member.id);
    setIsToggling(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleToggleAccess}
        disabled={isToggling}
        title={member.hasDashboardAccess ? "Revoke Access" : "Grant Dashboard Access"}
        className={`p-2.5 rounded-xl transition-all border ${
          member.hasDashboardAccess 
            ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
            : "bg-slate-50 text-slate-400 border-slate-100 hover:text-blue-600 hover:bg-blue-50"
        }`}
      >
        {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : member.hasDashboardAccess ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
      </button>
      
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
