"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Upload, Building, User, Users, Lock, CheckCircle2, ShieldCheck, Mail, ArrowRight, Loader2, Globe, MapPin } from "lucide-react";

import { submitRegistration } from "@/app/actions/register";
import { generateAndSendOtp, verifyOtp } from "@/app/actions/otp";
import { getCountries, getProvinces, getDistricts } from "@/app/actions/master-data";
import { getPublicSettings } from "@/app/actions/systemSettings";
import { getPublicLicensePlans } from "@/app/actions/licensePlans";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [govIdPreview, setGovIdPreview] = useState<string>("");
  const [selfiePreview, setSelfiePreview] = useState<string>("");

  const [countries, setCountries] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedPlanType, setSelectedPlanType] = useState("MONTHLY");
  const [licensePlan, setLicensePlan] = useState("");
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    async function loadSettings() {
      const settings = await getPublicSettings();
      if (settings?.logoUrl) setLogoUrl(settings.logoUrl);
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (plans.length > 0) {
      const availablePlans = plans.filter(p => p.type === selectedPlanType);
      if (availablePlans.length > 0) {
        setLicensePlan(availablePlans[0].id);
      } else {
        setLicensePlan("");
      }
    }
  }, [selectedPlanType, plans]);

  useEffect(() => {
    async function loadMasters() {
      const [c, p] = await Promise.all([
        getCountries(),
        getPublicLicensePlans()
      ]);
      setCountries(c);
      setPlans(p);
      if (p.length > 0) {
        const defaultPlan = p.find((pl: any) => pl.isDefault) || p[0];
        setLicensePlan(defaultPlan.id);
      }
    }
    loadMasters();
  }, []);

  useEffect(() => {
    async function loadProvinces() {
      if (selectedCountry) {
        const p = await getProvinces(selectedCountry);
        setProvinces(p);
        setDistricts([]);
        setSelectedProvince("");
      }
    }
    loadProvinces();
  }, [selectedCountry]);

  useEffect(() => {
    async function loadDistricts() {
      if (selectedProvince) {
        const d = await getDistricts(selectedProvince);
        setDistricts(d);
      }
    }
    loadDistricts();
  }, [selectedProvince]);

  const handleStep1Submit = async (formData: FormData) => {
    const emailVal = formData.get("email") as string;
    setEmail(emailVal);
    setSendingOtp(true);
    const res = await generateAndSendOtp(emailVal);
    setSendingOtp(false);
    if (res.success) {
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

    if (step < 4) {
      setStep(step + 1);
    } else {
      setIsProcessing(true);
      const res = await submitRegistration(formData);
      setIsProcessing(false);
      if (res.success) setIsSubmitted(true);
      else alert(res.error);
    }
  };

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
            Your registration request has been submitted securely. Our administrators will review your documents and contact you shortly.
          </p>
          <Link href="/" className="inline-flex items-center justify-center w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col overflow-x-hidden selection:bg-blue-100">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/auth-bg.png')" }} />
      <div className="fixed inset-0 z-0 bg-slate-900/10 backdrop-blur-[2px]" />

      <div className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-sm font-medium transition-all group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </Link>
      </div>
      
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 pb-20">
        <div className="backdrop-blur-xl bg-white/70 p-8 md:p-12 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-2xl w-full border border-white/40 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Onboard your Mahalla</h1>
                <p className="text-blue-600 font-black text-[11px] uppercase tracking-[0.2em] mt-1">Platform Registration &bull; Step {step} of 4</p>
              </div>
              <div className="hidden sm:block">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-10 object-contain opacity-80" />
                ) : (
                  <Users className="w-10 h-10 text-blue-600 opacity-40" />
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex-1 h-2 relative rounded-full bg-slate-200 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 ${step >= s ? 'w-full' : 'w-0'}`} />
                </div>
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
                    <input required={step === 1} name="fullName" type="text" className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="John Doe" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                      <input required={step === 1} name="email" type="email" className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                      <input required={step === 1} name="phone" type="tel" className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="+94 7X XXX XXXX" />
                    </div>
                  </div>
                </div>
            </div>

            {/* STEP 2: Email Verification */}
            <div className={`space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 ${step === 2 ? 'block' : 'hidden'}`}>
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/10">
                    <Mail className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Check your Inbox</h2>
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

            {/* STEP 3: Mahalla Details */}
            <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ${step === 3 ? 'block' : 'hidden'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Mahalla Details</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Mahalla Name</label>
                    <input required={step === 3} name="mahallaName" type="text" className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all" placeholder="Grand Central Mahalla" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Country</label>
                      <select 
                        required={step === 3} 
                        name="country" 
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full px-4 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select</option>
                        {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Province</label>
                      <select 
                        required={step === 3} 
                        name="province" 
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        className="w-full px-4 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                        disabled={!selectedCountry}
                      >
                        <option value="">Select</option>
                        {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">District</label>
                      <select 
                        required={step === 3} 
                        name="district" 
                        className="w-full px-4 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                        disabled={!selectedProvince}
                      >
                        <option value="">Select</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Address</label>
                    <textarea required={step === 3} name="address" rows={2} className="w-full px-5 py-4 bg-white/50 border border-slate-200 rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none" placeholder="123, Main Street, Area Name..." />
                  </div>

                  <div className="pt-4 border-t border-slate-200/50">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4 block ml-1">Select License Plan</label>
                    
                    <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 w-fit">
                      {['MONTHLY', 'ANNUALLY'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedPlanType(type)}
                          className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${selectedPlanType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {type.toLowerCase()}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plans.filter(p => p.type === selectedPlanType).map((plan) => (
                        <div 
                          key={plan.id}
                          onClick={() => setLicensePlan(plan.id)}
                          className={`cursor-pointer border-2 p-5 rounded-[24px] relative transition-all group ${licensePlan === plan.id ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/5' : 'border-slate-100 bg-white/40 hover:border-blue-200 hover:bg-white/60'}`}
                        >
                          <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-4 border-white shadow-sm transition-all ${licensePlan === plan.id ? 'bg-blue-600 scale-110' : 'bg-slate-200'}`} />
                          <h3 className="font-black text-slate-900 text-lg">{plan.name}</h3>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-xl font-black text-blue-600">
                              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(plan.isSaleActive ? plan.salePrice : plan.basePrice)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">/ {selectedPlanType === 'MONTHLY' ? 'mo' : 'yr'}</span>
                          </div>
                          <div className="mt-4 space-y-2">
                            {plan.features.slice(0, 3).map((f: string, i: number) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <input type="hidden" name="licensePlanId" value={licensePlan} />
                  </div>
                </div>
            </div>

            {/* STEP 4: Verification */}
            <div className={`space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ${step === 4 ? 'block' : 'hidden'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Identity Verification</h2>
                </div>
                
                <div className="bg-blue-600/5 border border-blue-600/10 rounded-3xl p-6 mb-6">
                  <p className="text-sm font-medium text-blue-900 leading-relaxed">
                    To maintain the integrity of our platform, we manually verify every Mahalla registration. Please provide clear documents for review.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ID Upload */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Government ID</label>
                    <div 
                      onClick={() => document.getElementById("gov-id-input")?.click()}
                      className={`h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer relative overflow-hidden group ${govIdPreview ? 'border-blue-600 bg-blue-50/30' : 'border-slate-200 bg-white/40 hover:bg-white/80 hover:border-blue-300'}`}
                    >
                      {govIdPreview ? (
                        <>
                          <img src={govIdPreview} className="absolute inset-0 w-full h-full object-cover opacity-20 transition-opacity group-hover:opacity-30" />
                          <CheckCircle2 className="w-10 h-10 text-blue-600 mb-2 relative z-10" />
                          <span className="text-sm font-black text-slate-900 relative z-10">ID Captured</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-bold text-slate-600">Front Side Photo</span>
                          <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">NIC or License</span>
                        </>
                      )}
                      <input id="gov-id-input" name="governmentId" type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setGovIdFile(file); setGovIdPreview(URL.createObjectURL(file)); }
                      }} />
                    </div>
                  </div>

                  {/* Selfie Upload */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Verification Selfie</label>
                    <div 
                      onClick={() => document.getElementById("selfie-input")?.click()}
                      className={`h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer relative overflow-hidden group ${selfiePreview ? 'border-emerald-600 bg-emerald-50/30' : 'border-slate-200 bg-white/40 hover:bg-white/80 hover:border-emerald-300'}`}
                    >
                      {selfiePreview ? (
                        <>
                          <img src={selfiePreview} className="absolute inset-0 w-full h-full object-cover opacity-20 transition-opacity group-hover:opacity-30" />
                          <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2 relative z-10" />
                          <span className="text-sm font-black text-slate-900 relative z-10">Selfie Captured</span>
                        </>
                      ) : (
                        <>
                          <User className="w-10 h-10 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-bold text-slate-600">Portrait Photo</span>
                          <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Face must be visible</span>
                        </>
                      )}
                      <input id="selfie-input" name="selfie" type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setSelfieFile(file); setSelfiePreview(URL.createObjectURL(file)); }
                      }} />
                    </div>
                  </div>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200/50">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 flex-1 order-2 sm:order-1">
                  Previous
                </button>
              )}
              <button 
                type="submit" 
                disabled={sendingOtp || isProcessing}
                className={`px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 order-1 sm:order-2 ${step === 1 ? 'w-full' : 'flex-1'}`}
              >
                {isProcessing || sendingOtp ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {step === 1 ? "Start Verification" : 
                     step === 2 ? "Verify OTP Code" :
                     step === 4 ? "Submit Registration" : "Continue to Next Step"}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 text-center pb-12">
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
          Powered by MahallasPlus &bull; Enterprise Community Core
        </p>
      </div>
    </div>
  );
}
