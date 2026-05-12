"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Users, Layers, Lock, PhoneCall, ChevronRight, Activity, FileText, Globe, CheckCircle2, Zap, Menu, X, Languages } from "lucide-react";
import { getPublicSettings } from "@/app/actions/systemSettings";
import { getPublicLicensePlans } from "@/app/actions/licensePlans";
import { LanguageProvider, useLanguage } from "@/app/components/LanguageProvider";

function LandingContent() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanType, setSelectedPlanType] = useState("MONTHLY");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();

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

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-10">
            <Link href="#features" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">{t('nav.features')}</Link>
            <Link href="#pricing" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">{t('nav.pricing')}</Link>
            <Link href="#about" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">{t('nav.about')}</Link>
            <Link href="#contact" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">{t('nav.contact')}</Link>
          </nav>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="relative group hidden sm:block">
              <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                <Languages className="w-4 h-4" />
                <span className="uppercase">{language === 'en' ? 'EN' : 'தமிழ்'}</span>
              </button>
              <div className="absolute top-full mt-2 right-0 bg-white border border-slate-100 rounded-xl shadow-lg p-2 w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button onClick={() => setLanguage('en')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold ${language === 'en' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>English</button>
                <button onClick={() => setLanguage('ta')} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold ${language === 'ta' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>தமிழ்</button>
              </div>
            </div>

            <Link href="/login" className="hidden lg:block text-sm font-black text-slate-900 hover:text-blue-600 transition-colors uppercase tracking-widest">{t('nav.login')}</Link>
            <Link href="/register" className="text-sm font-black bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 uppercase tracking-widest whitespace-nowrap">
              {t('nav.join')}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-slate-900" />
              ) : (
                <Menu className="w-6 h-6 text-slate-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col gap-6">
              <Link href="#features" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">{t('nav.features')}</Link>
              <Link href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">{t('nav.pricing')}</Link>
              <Link href="#about" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">{t('nav.about')}</Link>
              <Link href="#contact" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">{t('nav.contact')}</Link>
              
              <div className="pt-4 border-t border-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Language</p>
                <div className="flex gap-2">
                  <button onClick={() => { setLanguage('en'); setIsMenuOpen(false); }} className={`flex-1 py-2 rounded-lg text-sm font-bold ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>English</button>
                  <button onClick={() => { setLanguage('ta'); setIsMenuOpen(false); }} className={`flex-1 py-2 rounded-lg text-sm font-bold ${language === 'ta' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>தமிழ்</button>
                </div>
              </div>

              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-sm font-black text-slate-900 hover:text-blue-600 transition-colors uppercase tracking-widest pt-6 border-t border-slate-50">{t('nav.login')}</Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-32 pb-48 overflow-hidden min-h-[90vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <img
              src="/hero-dashboard.png"
              alt="MahallasPlus Dashboard"
              className="w-full h-full object-cover opacity-100 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white via-white/60 to-white backdrop-blur-[2px]"></div>
          </div>

          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-10"></div>

          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 z-0">
            <div className="w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px]"></div>
          </div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 z-0">
            <div className="w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px]"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
              <Activity className="w-4 h-4" />
              <span>{t('hero.badge')}</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-slate-900 max-w-5xl mx-auto leading-[1.1] md:leading-[0.95] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              {t('hero.title1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{t('hero.title2')}</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 px-4">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 px-4">
              <Link href="/register" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 md:px-10 md:py-5 rounded-[24px] text-base md:text-lg font-black hover:bg-blue-700 transition-all hover:scale-105 shadow-2xl shadow-blue-600/20 uppercase tracking-widest group">
                {t('hero.cta_register')}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#features" className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 rounded-[24px] text-base md:text-lg font-black text-slate-900 bg-white border-2 border-slate-100 hover:bg-slate-50 transition-all uppercase tracking-widest text-center">
                {t('hero.cta_features')}
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-slate-900 relative overflow-hidden">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            <div className="space-y-2">
              <p className="text-4xl font-black text-white tracking-tighter">100%</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('stats.data_privacy')}</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-white tracking-tighter">Enterprise</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('stats.security')}</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-white tracking-tighter">Real-time</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('stats.audit')}</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-black text-white tracking-tighter">24/7</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('stats.cloud')}</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
              <div className="max-w-2xl">
                <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">{t('features.badge')}</h2>
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{t('features.title')}</h3>
              </div>
              <p className="text-lg text-slate-500 font-medium max-w-md">
                {t('features.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              <FeatureCard
                icon={<Layers className="w-6 h-6 text-blue-600" />}
                title={t('features.f1_title')}
                description={t('features.f1_desc')}
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-blue-600" />}
                title={t('features.f2_title')}
                description={t('features.f2_desc')}
              />
              <FeatureCard
                icon={<Lock className="w-6 h-6 text-blue-600" />}
                title={t('features.f3_title')}
                description={t('features.f3_desc')}
              />
              <FeatureCard
                icon={<FileText className="w-6 h-6 text-blue-600" />}
                title={t('features.f4_title')}
                description={t('features.f4_desc')}
              />
              <FeatureCard
                icon={<Users className="w-6 h-6 text-blue-600" />}
                title={t('features.f5_title')}
                description={t('features.f5_desc')}
              />
              <FeatureCard
                icon={<Globe className="w-6 h-6 text-blue-600" />}
                title={t('features.f6_title')}
                description={t('features.f6_desc')}
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 bg-slate-50 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">{t('pricing.badge')}</h2>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-8">{t('pricing.title')}</h3>

              <div className="inline-flex bg-white p-1.5 rounded-[20px] shadow-sm border border-slate-200">
                {['MONTHLY', 'ANNUALLY', 'LIFETIME'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedPlanType(type)}
                    className={`px-6 sm:px-8 py-3 rounded-[14px] text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${selectedPlanType === type ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {type === 'MONTHLY' ? t('pricing.monthly') : type === 'ANNUALLY' ? t('pricing.annually') : t('pricing.lifetime')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.filter(p => p.type === selectedPlanType).map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  selectedPlanType={selectedPlanType}
                  t={t}
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
                  {t('cta.title')}
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href="/register" className="w-full sm:w-auto bg-white text-blue-600 px-10 py-5 rounded-[24px] text-lg font-black hover:bg-slate-50 transition-all hover:scale-105 uppercase tracking-widest shadow-xl">
                    {t('cta.register')}
                  </Link>
                  <a href="mailto:contact@mahallasplus.com" className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-[24px] text-lg font-black text-white border-2 border-white/20 hover:bg-white/10 transition-all uppercase tracking-widest">
                    <PhoneCall className="w-5 h-5" />
                    {t('cta.support')}
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
              &copy; {new Date().getFullYear()} MahallasPlus &bull; {t('footer.rights')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <LanguageProvider>
      <LandingContent />
    </LanguageProvider>
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

function PricingCard({ plan, selectedPlanType, t }: { plan: any, selectedPlanType: string, t: any }) {
  const price = plan.isSaleActive ? plan.salePrice : plan.basePrice;
  const isPremium = plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('enterprise');

  return (
    <div className={`flex flex-col p-10 rounded-[40px] border-2 transition-all hover:scale-[1.02] duration-300 ${isPremium ? 'bg-slate-900 text-white border-slate-800 shadow-2xl shadow-slate-900/20' : 'bg-white text-slate-900 border-slate-100 shadow-xl shadow-slate-900/5'}`}>
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className={`text-sm font-black uppercase tracking-[0.2em] ${isPremium ? 'text-blue-400' : 'text-blue-600'}`}>{plan.name}</h4>
          {plan.isSaleActive && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{t('pricing.sale')}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {plan.isSaleActive && (
            <span className={`text-3xl font-bold line-through tracking-tight ${isPremium ? 'text-slate-500' : 'text-slate-400'}`}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(plan.basePrice)}
            </span>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black tracking-tighter">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(price)}
            </span>
            <span className={`text-xs font-bold uppercase tracking-widest opacity-50`}>
              {selectedPlanType === 'ANNUALLY' ? t('pricing.per_year') : selectedPlanType === 'MONTHLY' ? t('pricing.per_month') : t('pricing.one_time')}
            </span>
          </div>
        </div>
        <p className={`mt-4 text-sm font-medium leading-relaxed opacity-60`}>{plan.description}</p>
      </div>

      <div className="flex-grow mb-10">
        {plan.featureConfig && (
          <div className={`mb-8 p-5 rounded-3xl border transition-colors ${isPremium ? 'bg-white/5 border-white/10 group-hover:bg-white/10' : 'bg-slate-50 border-slate-100 group-hover:bg-slate-100/50'}`}>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Households</span>
                <span className={`text-[11px] font-black uppercase tracking-widest ${(plan.featureConfig as any).MAX_FAMILY_CARDS ? 'text-blue-500' : ''}`}>{(plan.featureConfig as any).MAX_FAMILY_CARDS || 'Unlimited'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Population</span>
                <span className={`text-[11px] font-black uppercase tracking-widest ${(plan.featureConfig as any).MAX_MEMBERS ? 'text-blue-500' : ''}`}>{(plan.featureConfig as any).MAX_MEMBERS || 'Unlimited'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Boundaries</span>
                <span className={`text-[11px] font-black uppercase tracking-widest ${(plan.featureConfig as any).MAX_SUB_MAHALLAS ? 'text-blue-500' : ''}`}>{(plan.featureConfig as any).MAX_SUB_MAHALLAS || 'Unlimited'} Sub-Mahallas</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {plan.features.map((feature: string, idx: number) => (
            <div key={idx} className="flex items-start gap-3 group/feat">
              <div className={`mt-1 w-1.5 h-1.5 rounded-full ${isPremium ? 'bg-blue-400' : 'bg-blue-600'} group-hover/feat:scale-150 transition-transform`} />
              <span className="text-[13px] font-bold tracking-tight opacity-70 group-hover/feat:opacity-100 transition-opacity">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href={`/register?plan=${plan.id}`}
        className={`w-full py-5 rounded-[24px] text-sm font-black uppercase tracking-[0.2em] text-center transition-all active:scale-95 ${isPremium ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20' : 'bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-900/10'}`}
      >
        {t('pricing.get_started')}
      </Link>
    </div>
  );
}
