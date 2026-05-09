"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Users, Layers, Lock, PhoneCall, ChevronRight, Activity, FileText, Globe, CheckCircle2, Zap } from "lucide-react";
import { getPublicSettings } from "@/app/actions/systemSettings";
import { getPublicLicensePlans } from "@/app/actions/licensePlans";

export default function LandingPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState("MONTHLY");

  useEffect(() => {
    async function loadData() {
      const [settings, licensePlans] = await Promise.all([
        getPublicSettings(),
        getPublicLicensePlans()
      ]);
      if (settings?.logoUrl) setLogoUrl(settings.logoUrl);
      setPlans(licensePlans);
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-blue-100">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <img src="/Logomahallasplus.png" alt="MahallasPlus" className="h-15 w-auto object-contain transition-transform group-hover:scale-105" />
          </Link>
          <nav className="hidden lg:flex gap-10">
            <Link href="#features" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Features</Link>
            <Link href="#pricing" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Pricing</Link>
            <Link href="#about" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">About</Link>
            <Link href="#contact" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">Contact</Link>
          </nav>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hidden sm:block text-sm font-black text-slate-900 hover:text-blue-600 transition-colors uppercase tracking-widest">Login</Link>
            <Link href="/register" className="text-sm font-black bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 uppercase tracking-widest">
              Join Now
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

          {/* Abstract blobs */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
            <div className="w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px]"></div>
          </div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
            <div className="w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px]"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black uppercase tracking-[0.2em] mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
              <Activity className="w-4 h-4" />
              <span>Next-Gen Community Management</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 max-w-5xl mx-auto leading-[0.95] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              The Digital Backbone <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">for Modern Mahallas</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Empower your community with enterprise-grade security, automated family records, and seamless administrative controls in one unified platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link href="/register" className="flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-[24px] text-lg font-black hover:bg-blue-700 transition-all hover:scale-105 shadow-2xl shadow-blue-600/20 uppercase tracking-widest group">
                Register Your Mahalla
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#features" className="px-10 py-5 rounded-[24px] text-lg font-black text-slate-900 bg-white border-2 border-slate-100 hover:bg-slate-50 transition-all uppercase tracking-widest">
                See Features
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-slate-900 relative overflow-hidden">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            <div className="space-y-2">
              <p className="text-4xl font-black text-white tracking-tighter">100%</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Privacy</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-white tracking-tighter">Enterprise</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Level</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-white tracking-tighter">Real-time</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit Logs</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-white tracking-tighter">24/7</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cloud Access</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
              <div className="max-w-2xl">
                <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Core Capabilities</h2>
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Built for Trust, Designed for Scale</h3>
              </div>
              <p className="text-lg text-slate-500 font-medium max-w-md">
                Every feature in MahallasPlus is crafted to handle complex community hierarchies with absolute precision.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              <FeatureCard
                icon={<Layers className="w-6 h-6 text-blue-600" />}
                title="Hierarchical Logic"
                description="Manage Main and Sub Mahallas with dedicated admin roles and jurisdiction-locked data access."
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-blue-600" />}
                title="Verified Onboarding"
                description="Manual ID verification ensures only legitimate community leaders can operate on the platform."
              />
              <FeatureCard
                icon={<Lock className="w-6 h-6 text-blue-600" />}
                title="Privacy First"
                description="Sensitive member data is encrypted at rest and protected by strict role-based access controls."
              />
              <FeatureCard
                icon={<FileText className="w-6 h-6 text-blue-600" />}
                title="Digital Family Cards"
                description="Full lifecycle management of family records, member relationships, and demographic trends."
              />
              <FeatureCard
                icon={<Users className="w-6 h-6 text-blue-600" />}
                title="NIC Tracking"
                description="Unique system-wide identity tracking to prevent duplicate registrations and ensure data integrity."
              />
              <FeatureCard
                icon={<Globe className="w-6 h-6 text-blue-600" />}
                title="Cloud Native"
                description="Highly available infrastructure powered by Vercel and Neon, accessible from any device."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 bg-slate-50 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Flexible Licensing</h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-8">Choose the Perfect Plan for Your Mahalla</h3>

              <div className="inline-flex bg-white p-1.5 rounded-[20px] shadow-sm border border-slate-200">
                {['MONTHLY', 'ANNUALLY'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedPlanType(type)}
                    className={`px-8 py-3 rounded-[14px] text-xs font-black uppercase tracking-widest transition-all ${selectedPlanType === type ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {type.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.filter(p => p.type === selectedPlanType).map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isAnnual={selectedPlanType === 'ANNUALLY'}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="py-32">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[48px] p-12 md:p-24 text-center relative overflow-hidden shadow-[0_40px_80px_rgba(37,99,235,0.2)]">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 max-w-3xl mx-auto">
                  Ready to Digitize Your Community?
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href="/register" className="w-full sm:w-auto bg-white text-blue-600 px-10 py-5 rounded-[24px] text-lg font-black hover:bg-slate-50 transition-all hover:scale-105 uppercase tracking-widest shadow-xl">
                    Register Your Mahalla
                  </Link>
                  <a href="mailto:contact@mahallasplus.com" className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-[24px] text-lg font-black text-white border-2 border-white/20 hover:bg-white/10 transition-all uppercase tracking-widest">
                    <PhoneCall className="w-5 h-5" />
                    Talk to Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-20 border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center">
              <img src="/Logomahallasplus.png" alt="MahallasPlus" className="h-10 w-auto object-contain" />
            </div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} MahallasPlus &bull; Enterprise Community Core
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:border-blue-100 transition-all group">
      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
        <div className="group-hover:text-white transition-colors">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function PricingCard({ plan, isAnnual }: { plan: any, isAnnual: boolean }) {
  const price = plan.isSaleActive ? plan.salePrice : plan.basePrice;
  const isPremium = plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('enterprise');

  return (
    <div className={`flex flex-col p-10 rounded-[40px] border-2 transition-all hover:scale-[1.02] duration-300 ${isPremium ? 'bg-slate-900 text-white border-slate-800 shadow-2xl shadow-slate-900/20' : 'bg-white text-slate-900 border-slate-100 shadow-xl shadow-slate-900/5'}`}>
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className={`text-sm font-black uppercase tracking-[0.2em] ${isPremium ? 'text-blue-400' : 'text-blue-600'}`}>{plan.name}</h4>
          {plan.isSaleActive && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Sale</span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black tracking-tighter">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(price)}
          </span>
          <span className={`text-xs font-bold uppercase tracking-widest opacity-50`}>/ {isAnnual ? 'year' : 'month'}</span>
        </div>
        <p className={`mt-4 text-sm font-medium leading-relaxed opacity-60`}>{plan.description}</p>
      </div>

      <div className="flex-grow space-y-4 mb-10">
        {plan.features.map((feature: string, idx: number) => (
          <div key={idx} className="flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPremium ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className="text-sm font-bold tracking-tight opacity-80">{feature}</span>
          </div>
        ))}
      </div>

      <Link
        href={`/register?plan=${plan.id}`}
        className={`w-full py-5 rounded-[24px] text-sm font-black uppercase tracking-[0.2em] text-center transition-all active:scale-95 ${isPremium ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-900/10'}`}
      >
        Get Started
      </Link>
    </div>
  );
}
