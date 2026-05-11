"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Scale, ShieldCheck, Globe } from "lucide-react";

export default function TermsPage() {
  const [lang, setLang] = useState<'en' | 'ta'>('en');

  const content = {
    en: {
      title: "Terms & Conditions",
      lastUpdated: "Last Updated: May 11, 2026",
      sections: [
        {
          title: "1. Agreement to Terms",
          body: "By accessing or using MahallasPlus, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not access the platform."
        },
        {
          title: "2. Registration & Eligibility",
          body: "To register a Mahalla, you must be a legitimate representative of the community. You are responsible for maintaining the confidentiality of your account and password."
        },
        {
          title: "3. User Responsibilities",
          body: "You agree to provide accurate, current, and complete information during the registration process. You are solely responsible for the content and management of your Mahalla's data on the platform."
        },
        {
          title: "4. Acceptable Use",
          body: "The platform must be used solely for non-profit community management, financial reporting, and member engagement. Any misuse for illegal activities, harassment, or data scraping is strictly prohibited."
        },
        {
          title: "5. Intellectual Property",
          body: "The MahallasPlus name, logo, and platform architecture are the exclusive property of MahallasPlus. Users retain ownership of the data they upload but grant the platform the necessary rights to process it."
        },
        {
          title: "6. Limitation of Liability",
          body: "MahallasPlus is provided 'as is' without warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform."
        }
      ]
    },
    ta: {
      title: "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
      lastUpdated: "கடைசியாக புதுப்பிக்கப்பட்டது: மே 11, 2026",
      sections: [
        {
          title: "1. விதிமுறைகளுக்கான ஒப்பந்தம்",
          body: "மஹல்லாஸ் பிளஸ்-ஐ அணுகுவதன் மூலம் அல்லது பயன்படுத்துவதன் மூலம், இந்த விதிமுறைகள் மற்றும் நிபந்தனைகளுக்கு கட்டுப்பட ஒப்புக்கொள்கிறீர்கள். இந்த விதிமுறைகளின் எந்தப் பகுதியையுடனும் நீங்கள் உடன்படவில்லை என்றால், நீங்கள் தளத்தை அணுகக்கூடாது."
        },
        {
          title: "2. பதிவு மற்றும் தகுதி",
          body: "ஒரு மஹல்லாவைப் பதிவு செய்ய, நீங்கள் சமூகத்தின் முறையான பிரதிநிதியாக இருக்க வேண்டும். உங்கள் கணக்கு மற்றும் கடவுச்சொல்லின் ரகசியத்தைப் பேணுவதற்கு நீங்களே பொறுப்பாவீர்கள்."
        },
        {
          title: "3. பயனர் பொறுப்புகள்",
          body: "பதிவுச் செயல்பாட்டின் போது துல்லியமான, தற்போதைய மற்றும் முழுமையான தகவலை வழங்க ஒப்புக்கொள்கிறீர்கள். மேடையில் உங்கள் மஹல்லாவின் தரவுகளின் உள்ளடக்கம் மற்றும் நிர்வாகத்திற்கு நீங்கள் மட்டுமே பொறுப்பாவீர்கள்."
        },
        {
          title: "4. ஏற்றுக்கொள்ளக்கூடிய பயன்பாடு",
          body: "இந்த தளம் இலாப நோக்கற்ற சமூக மேலாண்மை, நிதி அறிக்கை மற்றும் உறுப்பினர் ஈடுபாட்டிற்காக மட்டுமே பயன்படுத்தப்பட வேண்டும். சட்டவிரோத நடவடிக்கைகள், துன்புறுத்தல் அல்லது தரவு ஸ்கிராப்பிங்கிற்கான எந்தவொரு தவறான பயன்பாடும் கண்டிப்பாக தடைசெய்யப்பட்டுள்ளது."
        },
        {
          title: "5. அறிவுசார் சொத்து",
          body: "மஹல்லாஸ் பிளஸ் பெயர், லோகோ மற்றும் பிளாட்ஃபார்ம் கட்டமைப்பு ஆகியவை மஹல்லாஸ் பிளஸ்-ன் பிரத்யேக சொத்து. பயனர்கள் தாங்கள் பதிவேற்றும் தரவின் உரிமையைத் தக்கவைத்துக் கொள்கிறார்கள், ஆனால் அதைச் செயலாக்கத் தேவையான உரிமைகளை மேடைக்கு வழங்குகிறார்கள்."
        },
        {
          title: "6. பொறுப்பு வரம்பு",
          body: "மஹல்லாஸ் பிளஸ் உத்தரவாதங்கள் இல்லாமல் வழங்கப்படுகிறது. தளத்தைப் பயன்படுத்துவதால் ஏற்படும் மறைமுகமான அல்லது தற்செயலான பாதிப்புகளுக்கு நாங்கள் பொறுப்பல்ல."
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
                <Scale className="w-5 h-5 text-white" />
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
          </div>

          <div className="space-y-12">
            {t.sections.map((section, idx) => (
              <section key={idx} className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{section.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed text-lg">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-20 p-8 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">Questions?</h4>
                <p className="text-sm font-bold text-slate-500">Contact our support team for clarifications.</p>
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
