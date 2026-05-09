"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users, AlertCircle, ChevronLeft, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { resetPassword } from "@/app/actions/passwordReset";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await resetPassword(token as string, password);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Failed to reset password");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900">Password Reset Successful</h2>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Your password has been updated. You can now sign in with your new credentials.
          </p>
        </div>
        <Link 
          href="/login"
          className="block w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.98]"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm font-bold text-red-700">{error}</p>
        </div>
      )}

      {!token ? (
        <Link 
          href="/login/forgot-password"
          className="block w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.98] text-center"
        >
          Request New Link
        </Link>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-3"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden selection:bg-blue-100">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/auth-bg.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-slate-900/10 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
        <div className="mb-8 flex justify-center">
          <Link href="/login" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-sm font-medium transition-all group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>
        </div>

        <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[32px] p-8 md:p-10">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Set New Password</h1>
            <p className="text-slate-600 mt-2 font-medium">Choose a strong password to secure your account</p>
          </div>

          <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              Need more help?{" "}
              <Link href="/contact" className="text-blue-600 font-bold hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} MahallasPlus &bull; Secured Enterprise Platform
        </div>
      </div>
    </div>
  );
}
