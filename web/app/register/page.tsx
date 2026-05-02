"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Upload, Building, User, Lock, CheckCircle2 } from "lucide-react";

import { submitRegistration } from "@/app/actions/register";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsProcessing(true);
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      const res = await submitRegistration(formData);
      setIsProcessing(false);
      
      if (res.success) {
        setIsSubmitted(true);
      } else {
        alert(res.error);
      }
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input required={step === 1} name="fullName" type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input required={step === 1} name="email" type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input required={step === 1} name="phone" type="tel" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="+1 (555) 000-0000" />
                </div>
            </div>

            <div className={`space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${step === 2 ? 'block' : 'hidden'}`}>
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <Building className="w-5 h-5 text-blue-600" /> Mahalla Details
                </h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mahalla Name</label>
                  <input required={step === 2} name="mahallaName" type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" placeholder="Grand Central Mahalla" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">License Plan</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="cursor-pointer border-2 border-blue-600 rounded-xl p-4 bg-blue-50 relative">
                      <div className="absolute top-3 right-3 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-sm"></div>
                      <h3 className="font-bold text-slate-900">Standard</h3>
                      <p className="text-sm text-slate-600 mt-1">Up to 5 Sub-Mahallas</p>
                    </label>
                    <label className="cursor-pointer border-2 border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                      <div className="absolute top-3 right-3 w-4 h-4 border-2 border-slate-300 rounded-full"></div>
                      <h3 className="font-bold text-slate-900">Enterprise</h3>
                      <p className="text-sm text-slate-600 mt-1">Unlimited scaling</p>
                    </label>
                  </div>
                  <input type="hidden" name="licensePlan" value="Standard" />
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
                
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Upload Government ID</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                  <input type="file" className="hidden" />
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Upload Selfie</p>
                  <p className="text-xs text-slate-500 mt-1">Must be clear and well-lit</p>
                  <input type="file" className="hidden" />
                </div>
            </div>

            <div className="mt-8 flex gap-4">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors w-full">
                  Previous
                </button>
              )}
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors w-full shadow-sm shadow-blue-200">
                {step === 3 ? "Submit Verification" : "Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
