"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Upload, Building, User, Lock, CheckCircle2, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

import { submitRegistration } from "@/app/actions/register";
import { generateAndSendOtp, verifyOtp } from "@/app/actions/otp";
import { getCountries, getProvinces, getDistricts } from "@/app/actions/master-data";
import { getPublicSettings } from "@/app/actions/systemSettings";
import { getPublicLicensePlans } from "@/app/actions/licensePlans";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
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
  const [siteKey, setSiteKey] = useState<string>("");

  useEffect(() => {
    async function loadConfig() {
      const isLocal = window.location.hostname === 'localhost';
      if (isLocal) {
        setSiteKey("6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI");
        return;
      }

      const config = await getPublicSettings();
      setSiteKey(config?.recaptchaSiteKey || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI");
    }
    loadConfig();
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
      setStep(1.5);
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
      setStep(2);
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

    if (step === 1.5) {
      handleOtpVerify();
      return;
    }

    if (step < 3) {
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
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted</h2>
          <p className="text-slate-600 mb-6">
            Your registration request has been submitted securely. Our platform administrators will review your uploaded documents and contact you shortly.
          </p>
          <Link href="/" className="inline-flex items-center justify-center w-full py-3 px-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="p-6">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Link>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-xl w-full border border-slate-100">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Onboard your Mahalla</h1>
            <p className="text-slate-600 mt-1">Step {step} of 3</p>
            
            <div className="flex gap-2 mt-4">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1.5 ? 'bg-blue-600' : 'bg-slate-200'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={`space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${step === 1 ? 'block' : 'hidden'}`}>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-blue-600" /> Personal Details
                </h2>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Full Name</label>
                  <input required={step === 1} name="fullName" type="text" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Email Address</label>
                  <input required={step === 1} name="email" type="email" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Phone Number</label>
                  <input required={step === 1} name="phone" type="tel" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="pt-2">
                  {siteKey ? (
                    <ReCAPTCHA
                      sitekey={siteKey}
                      onChange={(val) => setCaptchaVerified(!!val)}
                      className="rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm"
                    />
                  ) : (
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest p-4 bg-slate-50 border border-slate-100 rounded-xl w-full text-center">
                      Anti-bot protection is loading...
                    </div>
                  )}
                </div>
            </div>

            <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ${step === 1.5 ? 'block' : 'hidden'}`}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Verify your Email</h2>
                  <p className="text-sm text-slate-500">We've sent a 6-digit code to <span className="font-bold text-slate-700">{email}</span></p>
                </div>

                <div className="flex flex-col items-center">
                  <input 
                    type="text" 
                    maxLength={6} 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-48 text-center text-3xl font-black tracking-[0.5em] py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none transition-all"
                    placeholder="000000"
                  />
                  {otpError && <p className="text-rose-500 text-xs font-bold mt-3 flex items-center gap-1">⚠ {otpError}</p>}
                </div>

                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Didn't receive the code? <button type="button" onClick={() => handleStep1Submit(new FormData(document.querySelector('form')!))} className="text-blue-600 hover:underline">Resend Email</button>
                </p>
            </div>

            <div className={`space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${step === 2 ? 'block' : 'hidden'}`}>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <Building className="w-5 h-5 text-blue-600" /> Mahalla Details
                </h2>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Mahalla Name</label>
                  <input required={step === 2} name="mahallaName" type="text" className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm" placeholder="Grand Central Mahalla" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Country</label>
                    <select 
                      required={step === 2} 
                      name="country" 
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="">Select Country</option>
                      {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Province</label>
                    <select 
                      required={step === 2} 
                      name="province" 
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm appearance-none cursor-pointer disabled:opacity-50"
                      disabled={!selectedCountry}
                    >
                      <option value="">Select Province</option>
                      {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">District</label>
                    <select 
                      required={step === 2} 
                      name="district" 
                      className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm appearance-none cursor-pointer disabled:opacity-50"
                      disabled={!selectedProvince}
                    >
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Full Address</label>
                  <textarea required={step === 2} name="address" rows={2} className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm resize-none" placeholder="123, Main Street, Area Name..." />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Billing Frequency</label>
                  <div className="flex gap-3 mb-6">
                    {[
                      { id: 'MONTHLY', label: 'Monthly' },
                      { id: 'ANNUALLY', label: 'Annually' },
                      { id: 'LIFETIME', label: 'Lifetime' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedPlanType(type.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${selectedPlanType === type.id ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100' : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Available Plans</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.filter(p => p.type === selectedPlanType).map((plan) => (
                      <div 
                        key={plan.id}
                        onClick={() => setLicensePlan(plan.id)}
                        className={`cursor-pointer border-2 ${licensePlan === plan.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'} rounded-xl p-4 relative transition-all group hover:border-blue-300`}
                      >
                        <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-all ${licensePlan === plan.id ? 'bg-blue-600 scale-110' : 'bg-slate-200 group-hover:bg-slate-300'}`}></div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{plan.name}</h3>
                          {plan.isSaleActive && (
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 rounded text-[7px] font-black uppercase">Sale</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tight">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR' }).format(plan.isSaleActive ? plan.salePrice : plan.basePrice)}
                        </p>
                        <div className="mt-3 space-y-1">
                          {plan.features.map((f: string, i: number) => (
                            <p key={i} className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> {f}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                    {plans.filter(p => p.type === selectedPlanType).length === 0 && (
                      <div className="col-span-full py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No {selectedPlanType.toLowerCase()} plans available</p>
                      </div>
                    )}
                  </div>
                  <input type="hidden" name="licensePlanId" value={licensePlan} />
                </div>
            </div>

            <div className={`space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${step === 3 ? 'block' : 'hidden'}`}>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-blue-600" /> Identity Verification
                </h2>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-800">
                    To ensure security, we require manual verification. Please upload a clear photo of your Government ID and a selfie.
                  </p>
                </div>
                
                <div 
                  onClick={() => document.getElementById("gov-id-input")?.click()}
                  className={`border-2 border-dashed ${govIdPreview ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300'} rounded-xl p-6 text-center hover:bg-slate-50 transition-all cursor-pointer relative overflow-hidden min-h-[140px] flex flex-col items-center justify-center`}
                >
                  {govIdPreview ? (
                    <img src={govIdPreview} className="absolute inset-0 w-full h-full object-cover opacity-20" />
                  ) : null}
                  <div className="relative z-10">
                    {govIdPreview ? (
                      <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    )}
                    <p className="text-sm font-bold text-slate-700">{govIdPreview ? 'ID Uploaded Successfully' : 'Upload Government ID'}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{govIdFile ? govIdFile.name : 'PNG, JPG up to 5MB'}</p>
                  </div>
                  <input 
                    id="gov-id-input"
                    name="governmentId"
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setGovIdFile(file);
                        setGovIdPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                <div 
                  onClick={() => document.getElementById("selfie-input")?.click()}
                  className={`border-2 border-dashed ${selfiePreview ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300'} rounded-xl p-6 text-center hover:bg-slate-50 transition-all cursor-pointer relative overflow-hidden min-h-[140px] flex flex-col items-center justify-center`}
                >
                  {selfiePreview ? (
                    <img src={selfiePreview} className="absolute inset-0 w-full h-full object-cover opacity-20" />
                  ) : null}
                  <div className="relative z-10">
                    {selfiePreview ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    ) : (
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    )}
                    <p className="text-sm font-bold text-slate-700">{selfiePreview ? 'Selfie Captured Successfully' : 'Upload Selfie'}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{selfieFile ? selfieFile.name : 'Must be clear and well-lit'}</p>
                  </div>
                  <input 
                    id="selfie-input"
                    name="selfie"
                    type="file" 
                    accept="image/*"
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelfieFile(file);
                        setSelfiePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
            </div>

            <div className="mt-8 flex gap-4">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step === 2 ? 1 : step - 1)} className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors w-full">
                  Previous
                </button>
              )}
              <button 
                type="submit" 
                disabled={(step === 1 && !captchaVerified) || sendingOtp || isProcessing}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors w-full shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {(sendingOtp || isProcessing) && <ShieldCheck className="w-4 h-4 animate-pulse" />}
                {step === 1 ? (sendingOtp ? "Sending Code..." : "Continue") : 
                 step === 1.5 ? (isProcessing ? "Verifying..." : "Verify & Continue") :
                 step === 3 ? "Submit Verification" : "Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
