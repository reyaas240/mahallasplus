"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Lock, EyeOff } from "lucide-react";

export default function PrivacyPage() {
  const [lang, setLang] = useState<'en' | 'ta'>('en');

  const content = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: May 11, 2026",
      intro: "At MahallasPlus, we take your privacy seriously. This policy describes how we collect, use, and protect your personal and community information.",
      sections: [
        {
          title: "1. Information We Collect",
          body: "We collect information you provide directly during registration, including your full name, email address, phone number, Mahalla name, and location details. We also securely collect government-issued ID and selfie photos for identity verification."
        },
        {
          title: "2. How We Use Your Information",
          body: "We use your information to: (a) Verify your identity as a legitimate Mahalla representative, (b) Enable platform access and community management services, (c) Process transactions and invoices, (d) Send important administrative updates."
        },
        {
          title: "3. Data Security",
          body: "We implement enterprise-grade encryption for all sensitive data. Identity documents are stored in secure, encrypted storage and are only accessible by authorized compliance personnel for verification purposes."
        },
        {
          title: "4. Third-Party Sharing",
          body: "We do not sell, trade, or otherwise transfer your personal or community data to unauthorized third parties. We may share data with trusted service providers who assist us in operating our platform, so long as those parties agree to keep this information confidential."
        },
        {
          title: "5. Your Rights",
          body: "You have the right to access, correct, or request the deletion of your personal data. Please contact our support team to exercise these rights."
        },
        {
          title: "6. Cookies",
          body: "We use essential cookies to maintain your login session and language preferences. You can manage cookie settings in your browser, but some features of the platform may not function correctly without them."
        }
      ]
    },
    ta: {
      title: "தனியுரிமைக் கொள்கை",
      lastUpdated: "கடைசியாக புதுப்பிக்கப்பட்டது: மே 11, 2026",
      intro: "மஹல்லாஸ் பிளஸ்-இல், உங்கள் தனியுரிமையை நாங்கள் தீவிரமாக எடுத்துக்கொள்கிறோம். உங்கள் தனிப்பட்ட மற்றும் சமூகத் தகவல்களை நாங்கள் எவ்வாறு சேகரிக்கிறோம், பயன்படுத்துகிறோம் மற்றும் பாதுகாக்கிறோம் என்பதை இந்தக் கொள்கை விவரிக்கிறது.",
      sections: [
        {
          title: "1. நாங்கள் சேகரிக்கும் தகவல்கள்",
          body: "உங்கள் முழுப் பெயர், மின்னஞ்சல் முகவரி, தொலைபேசி எண், மஹல்லா பெயர் மற்றும் இருப்பிட விவரங்கள் உள்ளிட்ட பதிவின் போது நீங்கள் நேரடியாக வழங்கும் தகவல்களை நாங்கள் சேகரிக்கிறோம். அடையாளச் சரிபார்ப்பிற்காக அரசாங்கத்தால் வழங்கப்பட்ட அடையாள அட்டை மற்றும் செல்பி புகைப்படங்களையும் நாங்கள் பாதுகாப்பாகச் சேகரிக்கிறோம்."
        },
        {
          title: "2. உங்கள் தகவலை நாங்கள் எவ்வாறு பயன்படுத்துகிறோம்",
          body: "நாங்கள் உங்கள் தகவலை இதற்காகப் பயன்படுத்துகிறோம்: (அ) உங்களை ஒரு முறையான மஹல்லா பிரதிநிதியாக சரிபார்க்க, (ஆ) தள அணுகல் மற்றும் சமூக மேலாண்மை சேவைகளை இயக்க, (இ) பரிவர்த்தனைகள் மற்றும் விலைப்பட்டியல்களைச் செயல்படுத்த, (ஈ) முக்கியமான நிர்வாக அறிவிப்புகளை அனுப்ப."
        },
        {
          title: "3. தரவு பாதுகாப்பு",
          body: "அனைத்து முக்கியமான தரவுகளுக்கும் நிறுவன தர குறியாக்கத்தை நாங்கள் செயல்படுத்துகிறோம். அடையாள ஆவணங்கள் பாதுகாப்பான, குறியாக்கம் செய்யப்பட்ட சேமிப்பகத்தில் சேமிக்கப்படுகின்றன, மேலும் சரிபார்ப்பு நோக்கங்களுக்காக அங்கீகரிக்கப்பட்ட இணக்கப் பணியாளர்களால் மட்டுமே அவற்றை அணுக முடியும்."
        },
        {
          title: "4. மூன்றாம் தரப்பு பகிர்வு",
          body: "உங்கள் தனிப்பட்ட அல்லது சமூகத் தரவை அங்கீகரிக்கப்படாத மூன்றாம் தரப்பினருக்கு நாங்கள் விற்பனை செய்யவோ, வர்த்தகம் செய்யவோ அல்லது மாற்றவோ மாட்டோம். எமது தளத்தை இயக்குவதில் எமக்கு உதவும் நம்பகமான சேவை வழங்குநர்களுடன் நாங்கள் தரவைப் பகிரலாம், அந்தத் தரப்பினர் இந்தத் தகவலை ரகசியமாக வைத்திருக்க ஒப்புக்கொண்டால் மட்டுமே."
        },
        {
          title: "5. உங்கள் உரிமைகள்",
          body: "உங்கள் தனிப்பட்ட தரவை அணுகவும், திருத்தவும் அல்லது நீக்கக் கோரவும் உங்களுக்கு உரிமை உண்டு. இந்த உரிமைகளைப் பயன்படுத்த எமது ஆதரவுக் குழுவைத் தொடர்பு கொள்ளவும்."
        },
        {
          title: "6. குக்கீகள் (Cookies)",
          body: "உங்கள் உள்நுழைவு அமர்வு மற்றும் மொழி விருப்பங்களைப் பேண அத்தியாவசிய குக்கீகளை நாங்கள் பயன்படுத்துகிறோம். உங்கள் உலாவியில் குக்கீ அமைப்புகளை நீங்கள் நிர்வகிக்கலாம், ஆனால் சில அம்சங்கள் அவை இல்லாமல் சரியாகச் செயல்படாமல் போகலாம்."
        }
      ]
    }
  };

  const t = content[lang];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-xl transition-all">
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{t.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setLang('en')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${lang === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLang('ta')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${lang === 'ta' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-8 md:p-16">
          <div className="mb-12 border-b border-slate-100 pb-8">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{t.lastUpdated}</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.title}</h2>
            <p className="text-lg text-slate-500 mt-4 font-medium leading-relaxed">{t.intro}</p>
          </div>

          <div className="space-y-12">
            {t.sections.map((section, idx) => (
              <section key={idx} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{section.title}</h3>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed text-lg pl-12">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-20 p-8 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Security First</h4>
                <p className="text-sm font-bold text-slate-500">Your data is encrypted and protected.</p>
              </div>
            </div>
            <Link href="/register" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/10">
              Return to Registration
            </Link>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-12 text-center">
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} MahallasPlus &bull; Legal Department
        </p>
      </footer>
    </div>
  );
}
