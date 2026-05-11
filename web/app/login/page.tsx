"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, AlertCircle, ChevronLeft, Lock, Mail, Loader2, CheckCircle2, ShieldCheck, Zap, Globe, BarChart3, Database } from "lucide-react";
import { getPublicSettings } from "@/app/actions/systemSettings";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [instructionLang, setInstructionLang] = useState<'en' | 'ta'>('en');

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

  const content = {
    en: {
      welcome: "Welcome Back",
      subtitle: "Access your Mahalla's central management dashboard and stay connected with your community.",
      featuresTitle: "Platform Core Features",
      features: [
        { title: "Smart Family Records", desc: "Advanced member tracking with voice-driven data capture.", icon: Database },
        { title: "Financial Transparency", desc: "Real-time auditing and automated donation management.", icon: BarChart3 },
        { title: "Global Accessibility", desc: "Multi-language support for diverse community needs.", icon: Globe },
        { title: "Enterprise Security", desc: "Secured with bank-grade encryption and privacy controls.", icon: ShieldCheck }
      ],
      footer: "Trusted by Mahallas across the globe."
    },
    ta: {
      welcome: "மீண்டும் வருக",
      subtitle: "உங்கள் மஹல்லாவின் மைய மேலாண்மை டாஷ்போர்டை அணுகி உங்கள் சமூகத்துடன் இணைந்திருங்கள்.",
      featuresTitle: "தளத்தின் முக்கிய அம்சங்கள்",
      features: [
        { title: "ஸ்மார்ட் குடும்ப பதிவுகள்", desc: "குரல் வழியான தரவு சேகரிப்புடன் கூடிய மேம்பட்ட உறுப்பினர் கண்காணிப்பு.", icon: Database },
        { title: "நிதி வெளிப்படைத்தன்மை", desc: "நிகழ்நேர தணிக்கை மற்றும் தானியங்கி நன்கொடை மேலாண்மை.", icon: BarChart3 },
        { title: "உலகளாவிய அணுகல்", desc: "பல்வேறு சமூகத் தேவைகளுக்கான பன்மொழி ஆதரவு.", icon: Globe },
        { title: "நிறுவன பாதுகாப்பு", desc: "வங்கி தர குறியாக்கம் மற்றும் தனியுரிமை கட்டுப்பாடுகளுடன் பாதுகாக்கப்பட்டது.", icon: ShieldCheck }
      ],
      footer: "உலகெங்கிலும் உள்ள மஹல்லாக்களால் நம்பப்படுகிறது."
    }
  };

  const t = content[instructionLang];

  return (
    <div className="min-h-screen relative flex flex-col lg:flex-row overflow-x-hidden selection:bg-blue-100">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/auth-bg.png')" }} />
      <div className="fixed inset-0 z-0 bg-slate-900/10 backdrop-blur-[2px]" />

      {/* LEFT PANEL: Branding & Features */}
      <div className="relative z-10 w-full lg:w-[450px] xl:w-[500px] lg:h-screen flex flex-col p-8 lg:p-12 bg-white/40 backdrop-blur-3xl border-r border-white/40 overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-10">
              <Link href="/" className="inline-flex">
                <img src="/Logomahallasplus.png" alt="MahallasPlus" className="h-16 w-auto object-contain" />
              </Link>
              <Link href="/" className="p-2 bg-white/50 rounded-xl hover:bg-white transition-all group">
                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="flex items-center gap-2 mb-8 bg-white/50 p-1 rounded-xl w-fit border border-white/50">
              <button 
                onClick={() => setInstructionLang('en')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${instructionLang === 'en' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setInstructionLang('ta')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${instructionLang === 'ta' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
              >
                தமிழ்
              </button>
            </div>

            <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-4">{t.welcome}</h1>
            <p className="text-lg text-slate-600 font-bold mb-10 leading-relaxed">{t.subtitle}</p>

            <div className="pt-10 border-t border-slate-200/50">
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-8">{t.featuresTitle}</h3>
              <div className="space-y-8">
                {t.features.map((feature, idx) => (
                  <div key={idx} className="flex gap-5 group">
                    <div className="w-12 h-12 bg-white/60 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                      <feature.icon className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 mb-1 tracking-tight">{feature.title}</h4>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-10 border-t border-white/20">
            <div className="flex items-center gap-4 p-5 bg-blue-600/10 rounded-2xl border border-blue-600/20">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <p className="text-[11px] font-black text-blue-700 uppercase tracking-widest leading-relaxed">
                {t.footer}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Login Form */}
      <div className="relative z-10 flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[40px] p-8 md:p-12 max-w-md w-full animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/10">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Login</h2>
              <p className="text-slate-600 mt-2 font-medium">Please enter your credentials</p>
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
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300" 
                    placeholder="admin@example.com" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                  <Link href="/login/forgot-password" size="sm" className="text-[10px] text-blue-600 hover:text-blue-700 font-black uppercase tracking-widest">Forgot?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-5 px-6 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-3"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <Zap className="w-5 h-5 fill-current" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
              <p className="text-sm font-bold text-slate-500">
                New to MahallasPlus?{" "}
                <Link href="/register" className="text-blue-600 font-black hover:underline">
                  Register Now
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Powered by MahallasPlus &bull; Secured Enterprise Platform
          </p>
        </div>
      </div>
    </div>
  );
}
