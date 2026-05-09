"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, AlertCircle, ChevronLeft, Lock, Mail, Loader2 } from "lucide-react";
import { getPublicSettings } from "@/app/actions/systemSettings";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const settings = await getPublicSettings();
      if (settings?.logoUrl) setLogoUrl(settings.logoUrl);
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden selection:bg-blue-100">
      {/* Background Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/auth-bg.png')" }}
      />
      <div className="absolute inset-0 z-0 bg-slate-900/10 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-sm font-medium transition-all group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[32px] p-8 md:p-10">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              {logoUrl ? (
                <img src={logoUrl.includes('blob.vercel-storage.com') ? `/api/files/proxy?url=${encodeURIComponent(logoUrl)}` : logoUrl} alt="Logo" className="h-12 object-contain" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Users className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-slate-600 mt-2 font-medium">Access your community management platform</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-semibold text-slate-900 placeholder:text-slate-400" 
                  placeholder="admin@mahallasplus.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                <Link href="/login/forgot-password" className="text-[11px] text-blue-600 hover:text-blue-700 font-black uppercase tracking-widest">Forgot?</Link>
              </div>
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

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-3"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              New to MahallasPlus?{" "}
              <Link href="/register" className="text-blue-600 font-bold hover:underline">
                Register Now
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} MahallasPlus &bull; Secured Enterprise Platform
        </div>
      </div>
    </div>
  );
}
