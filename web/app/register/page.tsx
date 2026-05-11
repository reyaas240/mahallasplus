"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, Upload, Building, User, Users, Lock, CheckCircle2, ShieldCheck, Mail, ArrowRight, Loader2, Globe, MapPin, X, ExternalLink, Zap, Eye } from "lucide-react";

import { submitRegistration, checkEmailAvailability } from "@/app/actions/register";
import { generateAndSendOtp, verifyOtp } from "@/app/actions/otp";
import { getCountries, getProvinces, getDistricts, getDivisionalSecretariats, getCities } from "@/app/actions/master-data";
import { getPublicSettings } from "@/app/actions/systemSettings";
import { getPublicLicensePlans } from "@/app/actions/licensePlans";

function RegisterContent() {
  const searchParams = useSearchParams();
  const initialPlanId = searchParams.get("plan");

  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [instructionLang, setInstructionLang] = useState<'en' | 'ta'>('en');

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [govIdPreview, setGovIdPreview] = useState<string>("");
  const [selfiePreview, setSelfiePreview] = useState<string>("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const [countries, setCountries] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [divisionalSecretariats, setDivisionalSecretariats] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDivisionalSecretariat, setSelectedDivisionalSecretariat] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [selectedPlanType, setSelectedPlanType] = useState("MONTHLY");
  const [licensePlan, setLicensePlan] = useState("");
  const [plans, setPlans] = useState<any[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'terms' | 'privacy' | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const settings = await getPublicSettings();
      if (settings?.logoUrl) setLogoUrl(settings.logoUrl);
    }
    loadSettings();
    loadMasterData();
    
    async function loadPlans() {
      const p = await getPublicLicensePlans();
      setPlans(p);
      if (initialPlanId) {
        setLicensePlan(initialPlanId);
        const pObj = p.find(x => x.id === initialPlanId);
        if (pObj) setSelectedPlanType(pObj.type);
      }
    }
    loadPlans();
  }, [initialPlanId]);

  const loadMasterData = async () => {
    const c = await getCountries();
    setCountries(c);
  };

  useEffect(() => {
    if (selectedCountry) {
      getProvinces(selectedCountry).then(setProvinces);
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedDivisionalSecretariat("");
      setSelectedCity("");
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedProvince) {
      getDistricts(selectedProvince).then(setDistricts);
      setSelectedDistrict("");
      setSelectedDivisionalSecretariat("");
      setSelectedCity("");
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      getDivisionalSecretariats(selectedDistrict).then(setDivisionalSecretariats);
      setSelectedDivisionalSecretariat("");
      setSelectedCity("");
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedDivisionalSecretariat) {
      getCities(selectedDivisionalSecretariat).then(setCities);
      setSelectedCity("");
    }
  }, [selectedDivisionalSecretariat]);

  const handleStep1Submit = async (formData: FormData) => {
    const emailVal = formData.get("email") as string;
    if (!emailVal) return;
    
    if (!termsAccepted) {
      alert(instructionLang === 'en' ? "Please accept the Terms and Conditions" : "விதிமுறைகளை ஏற்கவும்");
      return;
    }

    setSendingOtp(true);
    
    // Check email availability first
    const availability = await checkEmailAvailability(emailVal);
    if (!availability.available) {
      setSendingOtp(false);
      alert(availability.reason);
      return;
    }

    const res = await generateAndSendOtp(emailVal);
    setSendingOtp(false);
    
    if (res.success) {
      setEmail(emailVal);
      setStep(2);
    } else {
      alert(res.error || "Failed to send verification code. Please check your SMTP settings.");
    }
  };

  const handleOtpVerify = async () => {
    setIsProcessing(true);
    setOtpError("");
    const res = await verifyOtp(email, otp);
    setIsProcessing(false);
    if (res.success) {
      setStep(3);
    } else {
      setOtpError(res.error || "Invalid code");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (step === 1) {
      handleStep1Submit(formData);
      return;
    }

    if (step === 2) {
      handleOtpVerify();
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    } else {
      setIsProcessing(true);
      const res = await submitRegistration(formData);
      setIsProcessing(false);
      if (res.success) setIsSubmitted(true);
      else alert(res.error);
    }
  };

  const instructions = {
    en: {
      welcome: "Welcome to MahallasPlus",
      subtitle: "Please follow these steps to register your Mahalla / community.",
      step1: "Personal Details: Provide your contact information. This person will be the primary administrator.",
      step2: "Email Verification: Enter the 6-digit code sent to your email to verify your identity.",
      step3: "Location Details: Select your Mahalla's geographic location accurately.",
      step4: "Choose Plan: Select a license plan that best fits your community's needs.",
      step5: "Security Verification: Upload your ID and a Selfie for security verification.",
      footer: "Your data is secured with enterprise-grade encryption."
    },
    ta: {
      welcome: "மஹல்லாஸ் பிளஸ்-க்கு வரவேற்கிறோம்",
      subtitle: "உங்கள் மஹல்லா அல்லது சமூகத்தைப் பதிவு செய்ய இந்தப் படிகளைப் பின்பற்றவும்.",
      step1: "தனிப்பட்ட விவரங்கள்: உங்கள் தொடர்புத் தகவலை வழங்கவும். இந்தப் நபர் முதன்மை நிர்வாகியாக இருப்பார்.",
      step2: "மின்னஞ்சல் சரிபார்ப்பு: உங்கள் அடையாளத்தை உறுதிப்படுத்த உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்ட 6 இலக்கக் குறியீட்டை உள்ளிடவும்.",
      step3: "இருப்பிட விவரங்கள்: உங்கள் மஹல்லாவின் புவியியல் இருப்பிடத்தைத் துல்லியமாகத் தேர்ந்தெடுக்கவும்.",
      step4: "திட்டத்தைத் தேர்வுசெய்க: உங்கள் சமூகத் தேவைகளுக்கு மிகவும் பொருத்தமான உரிமத் திட்டத்தைத் தேர்ந்தெடுக்கவும்.",
      step5: "பாதுகாப்பு சரிபார்ப்பு: பாதுகாப்பு சரிபார்ப்புக்காக உங்கள் அடையாள அட்டை மற்றும் செல்பியைப் பதிவேற்றவும்.",
      footer: "உங்கள் தரவு நிறுவன தர குறியாக்கத்துடன் பாதுகாக்கப்படுகிறது."
    }
  };

  const t = instructions[instructionLang];

  if (isSubmitted) {
    return (
      <div className="min-h-screen relative flex flex-col justify-center items-center p-4">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/auth-bg.png')" }} />
        <div className="backdrop-blur-xl bg-white/70 p-10 rounded-[40px] shadow-2xl max-w-md w-full text-center border border-white/40 relative z-10 animate-in fade-in zoom-in">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Request Submitted</h2>
          <p className="text-slate-600 mb-8 font-medium leading-relaxed">
            Your registration request has been submitted securely. Our administrators will review your documents and contact you shortly. Check your email inbox or spam folder for invoice and payment details.
          </p>
          <Link href="/" className="inline-flex items-center justify-center w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col lg:flex-row overflow-x-hidden selection:bg-blue-100">
      <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/auth-bg.png')" }} />
      <div className="fixed inset-0 z-0 bg-slate-900/10 backdrop-blur-[2px]" />

      {/* LEFT PANEL: Instructions */}
      <div className="relative z-10 w-full lg:w-[450px] xl:w-[500px] lg:h-screen flex flex-col p-8 lg:p-12 bg-white/40 backdrop-blur-3xl border-r border-white/40 overflow-y-auto">
        <div className="flex flex-col h-full">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-12">
              <Link href="/" className="inline-flex">
                <img src="/Logomahallasplus.png" alt="MahallasPlus" className="h-16 w-auto object-contain" />
              </Link>
              <Link href="/" className="lg:hidden p-2 bg-white/50 rounded-xl hover:bg-white transition-all">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </Link>
            </div>
            
            <div className="flex items-center gap-2 mb-6 bg-white/50 p-1 rounded-xl w-fit border border-white/50">
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

            <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-3">{t.welcome}</h1>
            <p className="text-lg text-slate-600 font-bold mb-6 leading-relaxed">{t.subtitle}</p>

            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={`flex gap-6 transition-all duration-500 ${step === s ? 'opacity-100 scale-100' : 'opacity-40 scale-95 origin-left'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg ${step >= s ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/50 text-slate-400'}`}>
                    {s}
                  </div>
                  <div>
                    <h3 className="text-sm font-black mb-1 text-slate-900 tracking-tight">
                      {(t as any)[`step${s}`].split(':')[0]}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">
                      {(t as any)[`step${s}`].split(':')[1]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-12 border-t border-white/20">
            <div className="flex items-center gap-4 p-5 bg-blue-600/10 rounded-2xl border border-blue-600/20">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <p className="text-[11px] font-black text-blue-700 uppercase tracking-widest leading-relaxed">
                {t.footer}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form */}
      <div className="relative z-10 flex-1 flex flex-col h-screen overflow-y-auto">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="backdrop-blur-xl bg-white/70 p-8 md:p-12 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-2xl w-full border border-white/40 animate-in fade-in slide-in-from-right-4 duration-500">
            
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-blue-600 font-black text-[11px] uppercase tracking-[0.2em] mb-1">Onboarding Process</p>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Step {step} of 5</h2>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className={`w-10 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`} />
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* STEP 1: Personal Details */}
              <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ${step === 1 ? 'block' : 'hidden'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Personal Details</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input required={step === 1} name="fullName" type="text" className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="Mohamed" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                      <input required={step === 1} name="email" type="email" className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="mohamed@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                      <input required={step === 1} name="phone" type="tel" pattern="0[0-9]{9}" maxLength={10} title="Phone number must start with 0 and be exactly 10 digits long (e.g. 0771234567)" className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="077XXXXXXX" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Proposed Mahalla Name</label>
                    <input required={step === 1} name="mahallaName" type="text" className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="e.g. Grand Mosque Association" />
                  </div>

                  <div className="pt-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        name="termsAccepted"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 w-6 h-6 rounded-lg border-2 border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer" 
                      />
                      <span className="text-sm font-bold text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                        {instructionLang === 'en' ? (
                          <>
                            I have read and I accept the <button type="button" onClick={() => { setDrawerType('terms'); setDrawerOpen(true); }} className="text-blue-600 hover:underline inline-flex items-center gap-1">Terms & Conditions</button> and <button type="button" onClick={() => { setDrawerType('privacy'); setDrawerOpen(true); }} className="text-blue-600 hover:underline inline-flex items-center gap-1">Privacy Policy</button>
                          </>
                        ) : (
                          <>
                            நான் <button type="button" onClick={() => { setDrawerType('terms'); setDrawerOpen(true); }} className="text-blue-600 hover:underline inline-flex items-center gap-1">விதிமுறைகள் மற்றும் நிபந்தனைகள்</button> மற்றும் <button type="button" onClick={() => { setDrawerType('privacy'); setDrawerOpen(true); }} className="text-blue-600 hover:underline inline-flex items-center gap-1">தனியுரிமைக் கொள்கையை</button> வாசித்தேன் மற்றும் அவற்றை ஏற்றுக்கொள்கிறேன்
                          </>
                        )}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* STEP 2: Email Verification */}
              <div className={`space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 ${step === 2 ? 'block' : 'hidden'}`}>
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/10">
                    <Mail className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Check your Inbox or Spam Folder</h2>
                  <p className="text-slate-600 font-medium">We've sent a code to <span className="text-blue-600 font-black">{email}</span></p>
                </div>

                <div className="flex flex-col items-center max-w-sm mx-auto">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center text-4xl font-black tracking-[0.5em] py-6 bg-white border-2 border-slate-100 rounded-3xl focus:border-blue-600 outline-none transition-all shadow-inner"
                    placeholder="000000"
                  />
                  {otpError && <p className="text-rose-600 text-sm font-bold mt-4 flex items-center gap-2">⚠ {otpError}</p>}
                </div>

                <p className="text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Didn't receive it? <button type="button" onClick={() => handleStep1Submit(new FormData(document.querySelector('form')!))} className="text-blue-600 hover:underline">Resend Code</button>
                </p>
              </div>

              {/* STEP 3: Location Details */}
              <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ${step === 3 ? 'block' : 'hidden'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Location Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Country</label>
                    <select 
                      name="country" 
                      required={step === 3}
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                    >
                      <option value="">Select Country</option>
                      {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Province</label>
                    <select 
                      name="province" 
                      required={step === 3}
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all disabled:opacity-50"
                      disabled={!selectedCountry}
                    >
                      <option value="">Select Province</option>
                      {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">District</label>
                    <select 
                      name="district" 
                      required={step === 3}
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all disabled:opacity-50"
                      disabled={!selectedProvince}
                    >
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Divisional Secretariat</label>
                    <select 
                      name="divisionalSecretariat" 
                      required={step === 3}
                      value={selectedDivisionalSecretariat}
                      onChange={(e) => setSelectedDivisionalSecretariat(e.target.value)}
                      className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all disabled:opacity-50"
                      disabled={!selectedDistrict}
                    >
                      <option value="">Select Secretariat</option>
                      {divisionalSecretariats.map(ds => <option key={ds.id} value={ds.id}>{ds.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">City / Area</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select 
                      required={step === 3}
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all disabled:opacity-50"
                      disabled={!selectedDivisionalSecretariat}
                    >
                      <option value="">Select City</option>
                      {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      <option value="OTHER">Other (Type manually)</option>
                    </select>
                    {selectedCity === 'OTHER' && (
                      <input
                        type="text"
                        name="city"
                        required={step === 3}
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        placeholder="Enter City Name"
                      />
                    )}
                    {selectedCity !== 'OTHER' && selectedCity !== '' && (
                      <input type="hidden" name="city" value={selectedCity} />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Detailed Address</label>
                  <textarea required={step === 3} name="address" rows={3} className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="House No, Street, Landmark..." />
                </div>
              </div>

              {/* STEP 4: Choose Plan */}
              <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ${step === 4 ? 'block' : 'hidden'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Choose Plan</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {['MONTHLY', 'ANNUALLY'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedPlanType(type)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedPlanType === type ? 'bg-slate-900 text-white shadow-lg' : 'bg-white/50 text-slate-500 hover:text-slate-900 border border-white/50'}`}
                      >
                        {type.toLowerCase()}
                      </button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {plans.filter(p => p.type === selectedPlanType).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setLicensePlan(p.id)}
                        className={`relative p-6 rounded-[32px] border-2 transition-all text-left group overflow-hidden ${licensePlan === p.id ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-600/5' : 'border-slate-100 bg-white/50 hover:border-slate-200'}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-black text-slate-900">{p.name}</h3>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-2xl font-black text-blue-600">LKR {p.isSaleActive && p.salePrice ? p.salePrice : p.basePrice}</span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/{selectedPlanType === 'MONTHLY' ? 'mo' : 'yr'}</span>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${licensePlan === p.id ? 'border-blue-600 bg-blue-600' : 'border-slate-200'}`}>
                            {licensePlan === p.id && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            {p.name.includes('Basic') ? 'Core Management' : p.name.includes('Pro') ? 'Advanced Analytics' : 'Enterprise Tools'}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Unlimited Members
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Cloud Storage
                          </div>
                        </div>
                        
                        <input type="radio" name="licensePlanId" value={p.id} checked={licensePlan === p.id} onChange={() => {}} className="hidden" required={step === 4} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* STEP 5: Verification Documents */}
              <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ${step === 5 ? 'block' : 'hidden'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Security Verification</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Government ID</label>
                    <div className="relative group">
                      <div className={`relative aspect-video rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 bg-slate-50/50 group-hover:bg-white group-hover:border-blue-600 transition-all overflow-hidden ${govIdPreview ? 'border-solid border-emerald-500 bg-white' : ''}`}>
                        {govIdPreview && (
                          <>
                            <img src={govIdPreview} className="w-full h-full object-cover" alt="ID Preview" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                              <div className="flex gap-3">
                                <button type="button" onClick={() => setLightboxImage(govIdPreview)} className="p-4 bg-white rounded-2xl shadow-xl hover:scale-110 transition-transform flex items-center gap-2 group/btn">
                                  <Eye className="w-6 h-6 text-blue-600" />
                                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest pr-1">View</span>
                                </button>
                                <button type="button" onClick={() => { setGovIdPreview(""); setGovIdFile(null); }} className="p-4 bg-white rounded-2xl shadow-xl hover:scale-110 transition-transform">
                                  <X className="w-6 h-6 text-rose-600" />
                                </button>
                              </div>
                            </div>
                            <div className="absolute top-4 right-4 p-2 bg-blue-600 text-white rounded-full shadow-lg group-hover:opacity-0 transition-opacity">
                              <Eye className="w-4 h-4" />
                            </div>
                          </>
                        )}
                        {!govIdPreview && (
                          <>
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 tracking-tight">Upload ID Photo</span>
                          </>
                        )}
                        <input 
                          required={step === 5 && !govIdFile} 
                          type="file" 
                          name="governmentId" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setGovIdFile(file);
                              setGovIdPreview(URL.createObjectURL(file));
                            }
                          }} 
                          className={`absolute inset-0 opacity-0 cursor-pointer ${govIdPreview ? 'pointer-events-none' : ''}`} 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Live Selfie</label>
                    <div className="relative group">
                      <div className={`relative aspect-video rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 bg-slate-50/50 group-hover:bg-white group-hover:border-blue-600 transition-all overflow-hidden ${selfiePreview ? 'border-solid border-emerald-500 bg-white' : ''}`}>
                        {selfiePreview && (
                          <>
                            <img src={selfiePreview} className="w-full h-full object-cover" alt="Selfie Preview" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                              <div className="flex gap-3">
                                <button type="button" onClick={() => setLightboxImage(selfiePreview)} className="p-4 bg-white rounded-2xl shadow-xl hover:scale-110 transition-transform flex items-center gap-2 group/btn">
                                  <Eye className="w-6 h-6 text-blue-600" />
                                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest pr-1">View</span>
                                </button>
                                <button type="button" onClick={() => { setSelfiePreview(""); setSelfieFile(null); }} className="p-4 bg-white rounded-2xl shadow-xl hover:scale-110 transition-transform">
                                  <X className="w-6 h-6 text-rose-600" />
                                </button>
                              </div>
                            </div>
                            <div className="absolute top-4 right-4 p-2 bg-blue-600 text-white rounded-full shadow-lg group-hover:opacity-0 transition-opacity">
                              <Eye className="w-4 h-4" />
                            </div>
                          </>
                        )}
                        {!selfiePreview && (
                          <>
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <User className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 tracking-tight">Upload Selfie</span>
                          </>
                        )}
                        <input 
                          required={step === 5 && !selfieFile} 
                          type="file" 
                          name="selfie" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelfieFile(file);
                              setSelfiePreview(URL.createObjectURL(file));
                            }
                          }} 
                          className={`absolute inset-0 opacity-0 cursor-pointer ${selfiePreview ? 'pointer-events-none' : ''}`} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* NAVIGATION BUTTONS */}
              <div className="flex items-center gap-4 pt-6">
                {step > 1 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-5 px-6 rounded-[24px] font-black text-slate-600 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 uppercase tracking-widest text-sm">
                    Back
                  </button>
                )}
                <button 
                  disabled={isProcessing || sendingOtp}
                  type="submit" 
                  className={`flex-[2] flex items-center justify-center gap-3 py-5 px-6 rounded-[24px] font-black text-white bg-slate-900 hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing || sendingOtp ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {step === 5 ? "Complete" : "Continue"}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {step === 1 && (
                <div className="pt-6 text-center border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline font-black">
                      Login here
                    </Link>
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-8 text-center space-y-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Powered by MahallasPlus &bull; Enterprise Community Core
          </p>
        </div>
      </div>
      {/* LEGAL DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  {drawerType === 'terms' ? <ShieldCheck className="w-5 h-5 text-blue-600" /> : <Lock className="w-5 h-5 text-blue-600" />}
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {drawerType === 'terms' 
                    ? (instructionLang === 'en' ? 'Terms & Conditions' : 'விதிமுறைகள் மற்றும் நிபந்தனைகள்')
                    : (instructionLang === 'en' ? 'Privacy Policy' : 'தனியுரிமைக் கொள்கை')
                  }
                </h2>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10">
              {drawerType === 'terms' ? (
                <div className="space-y-8">
                  {instructionLang === 'en' ? (
                    <>
                      <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900">1. Accuracy of Information</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">You agree to provide accurate and truthful information about your community and identity. Misrepresentation may lead to account suspension.</p>
                      </section>
                      <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900">2. Management Use</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">This platform is provided solely for community management and non-profit organization administration.</p>
                      </section>
                      <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900">3. Data Compliance</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">You agree to comply with all local laws regarding member data protection and financial transparency.</p>
                      </section>
                    </>
                  ) : (
                    <>
                      <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900">1. தகவலின் துல்லியம்</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">உங்கள் சமூகம் மற்றும் அடையாளத்தைப் பற்றிய துல்லியமான மற்றும் உண்மையான தகவல்களை வழங்க ஒப்புக்கொள்கிறீர்கள். தவறான தகவல் கணக்கு இடைநிறுத்தத்திற்கு வழிவகுக்கும்.</p>
                      </section>
                      <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900">2. நிர்வாக பயன்பாடு</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">இந்த தளம் சமூக மேலாண்மை மற்றும் இலாப நோக்கற்ற நிறுவன நிர்வாகத்திற்காக மட்டுமே வழங்கப்படுகிறது.</p>
                      </section>
                      <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900">3. தரவு இணக்கம்</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">உறுப்பினர் தரவு பாதுகாப்பு மற்றும் நிதி வெளிப்படைத்தன்மை தொடர்பான அனைத்து உள்ளூர் சட்டங்களுக்கும் இணங்க ஒப்புக்கொள்கிறீர்கள்.</p>
                      </section>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {instructionLang === 'en' ? (
                    <>
                      <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900">1. Data Collection</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">We collect essential information to verify identity and enable community services, including NIC and portrait photos.</p>
                      </section>
                      <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900">2. Security Measures</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">All sensitive documents are encrypted and stored in secure infrastructure with restricted access.</p>
                      </section>
                      <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900">3. No Data Selling</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">We never sell your community or personal data to third-party commercial entities.</p>
                      </section>
                    </>
                  ) : (
                    <>
                      <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900">1. தரவு சேகரிப்பு</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">அடையாளத்தை சரிபார்க்கவும் சமூக சேவைகளை செயல்படுத்தவும் தேவையான தகவல்களை நாங்கள் சேகரிக்கிறோம்.</p>
                      </section>
                      <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900">2. பாதுகாப்பு நடவடிக்கைகள்</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">அனைத்து முக்கியமான ஆவணங்களும் குறியாக்கம் செய்யப்பட்டு, கட்டுப்படுத்தப்பட்ட அணுகலுடன் கூடிய பாதுகாப்பான உள்கட்டமைப்பில் சேமிக்கப்படுகின்றன.</p>
                      </section>
                      <section className="space-y-4">
                        <h3 className="text-lg font-black text-slate-900">3. தரவு விற்பனை இல்லை</h3>
                        <p className="text-slate-600 font-medium leading-relaxed">உங்கள் சமூக அல்லது தனிப்பட்ட தரவை மூன்றாம் தரப்பு வணிக நிறுவனங்களுக்கு நாங்கள் ஒருபோதும் விற்க மாட்டோம்.</p>
                      </section>
                    </>
                  )}
                </div>
              )}
              
              <div className="pt-12 border-t border-slate-100 flex flex-col gap-4">
                <button 
                  type="button"
                  onClick={() => { setTermsAccepted(true); setDrawerOpen(false); }}
                  className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
                >
                  {instructionLang === 'en' ? 'Accept & Continue' : 'ஏற்றுக்கொண்டு தொடரவும்'}
                </button>
                <button 
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full py-5 bg-slate-50 text-slate-500 rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-slate-100 transition-all active:scale-[0.98]"
                >
                  {instructionLang === 'en' ? 'Close' : 'மூடு'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* LIGHTBOX VIEWER */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setLightboxImage(null)} />
          <div className="relative max-w-5xl w-full h-full flex flex-col animate-in zoom-in duration-300">
            <button type="button" onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all">
              <X className="w-6 h-6" />
            </button>
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-[32px]">
              <img src={lightboxImage} className="max-w-full max-h-full object-contain shadow-2xl" alt="Enlarged view" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
