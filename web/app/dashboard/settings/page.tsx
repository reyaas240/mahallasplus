"use client";
import { useState, useEffect } from "react";
import { Mail, Shield, Save, Loader2, CheckCircle2, Server, Key, User, AtSign, Globe, Send, ShieldCheck, Lock } from "lucide-react";
import { getSystemSettings, updateSystemSettings, testSmtpConnection } from "@/app/actions/systemSettings";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState("smtp");
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function load() {
      try {
        const data = await getSystemSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    const data: any = {
      smtpHost: formData.get("smtpHost"),
      smtpPort: formData.get("smtpPort"),
      smtpUser: formData.get("smtpUser"),
      smtpPassword: formData.get("smtpPassword"),
      smtpFromEmail: formData.get("smtpFromEmail"),
      smtpFromName: formData.get("smtpFromName"),
      smtpEncryption: formData.get("smtpEncryption"),
      recaptchaSiteKey: formData.get("recaptchaSiteKey"),
      recaptchaSecretKey: formData.get("recaptchaSecretKey"),
      bankName: formData.get("bankName"),
      accountHolder: formData.get("accountHolder"),
      accountNumber: formData.get("accountNumber"),
      bankInstructions: formData.get("bankInstructions"),
      logoUrl: formData.get("logoUrl"),
    };

    const res = await updateSystemSettings(data);
    setSaving(false);
    if (res.success) {
      setMessage({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to save settings" });
    }
  };

  const handleTest = async () => {
    const form = document.querySelector('form');
    if (!form) return;
    
    setTesting(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(form);
    const data = {
      smtpHost: formData.get("smtpHost"),
      smtpPort: formData.get("smtpPort"),
      smtpUser: formData.get("smtpUser"),
      smtpPassword: formData.get("smtpPassword"),
      smtpFromEmail: formData.get("smtpFromEmail"),
      smtpFromName: formData.get("smtpFromName"),
      smtpEncryption: formData.get("smtpEncryption"),
    };

    const res = await testSmtpConnection(data);
    setTesting(false);
    if (res.success) {
      setMessage({ type: "success", text: "Test email sent successfully! Check your inbox." });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } else {
      setMessage({ type: "error", text: res.error || "Connection test failed" });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Settings...</p>
      </div>
    );
  }

  // Hidden fields for each tab so form data persists across tab switches
  const smtpHidden = (
    <>
      <input type="hidden" name="smtpHost" defaultValue={settings?.smtpHost} />
      <input type="hidden" name="smtpPort" defaultValue={settings?.smtpPort} />
      <input type="hidden" name="smtpUser" defaultValue={settings?.smtpUser} />
      <input type="hidden" name="smtpPassword" defaultValue={settings?.smtpPassword} />
      <input type="hidden" name="smtpFromEmail" defaultValue={settings?.smtpFromEmail} />
      <input type="hidden" name="smtpFromName" defaultValue={settings?.smtpFromName} />
      <input type="hidden" name="smtpEncryption" defaultValue={settings?.smtpEncryption} />
    </>
  );
  const securityHidden = (
    <>
      <input type="hidden" name="recaptchaSiteKey" defaultValue={settings?.recaptchaSiteKey} />
      <input type="hidden" name="recaptchaSecretKey" defaultValue={settings?.recaptchaSecretKey} />
    </>
  );
  const brandingHidden = (
    <>
      <input type="hidden" name="bankName" defaultValue={settings?.bankName} />
      <input type="hidden" name="accountHolder" defaultValue={settings?.accountHolder} />
      <input type="hidden" name="accountNumber" defaultValue={settings?.accountNumber} />
      <input type="hidden" name="bankInstructions" defaultValue={settings?.bankInstructions} />
      <input type="hidden" name="logoUrl" defaultValue={settings?.logoUrl} />
    </>
  );

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">System Settings</h2>
          <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-wider">Configure global platform parameters &amp; services</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          <button 
            onClick={() => setActiveTab("smtp")}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'smtp' ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-lg shadow-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <Mail className="w-4 h-4" /> SMTP Email
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-lg shadow-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <Shield className="w-4 h-4" /> Security
          </button>
          <button 
            onClick={() => setActiveTab("branding")}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'branding' ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-lg shadow-blue-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <Globe className="w-4 h-4" /> Payments &amp; Brand
          </button>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden p-10 space-y-8 relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

            <div className="relative">
              {activeTab === "smtp" ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <Server className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">SMTP Configuration</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Define the outgoing mail server for the platform</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1">SMTP Host</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Globe className="w-4 h-4" /></div>
                        <input name="smtpHost" defaultValue={settings?.smtpHost} placeholder="e.g. smtp.gmail.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1">SMTP Port</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Key className="w-4 h-4" /></div>
                        <input name="smtpPort" type="number" defaultValue={settings?.smtpPort} placeholder="587 or 465" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1">Username / Email</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User className="w-4 h-4" /></div>
                        <input name="smtpUser" defaultValue={settings?.smtpUser} placeholder="Email or Username" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1">Password</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Shield className="w-4 h-4" /></div>
                        <input name="smtpPassword" type="password" defaultValue={settings?.smtpPassword} placeholder="••••••••••••" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="col-span-2"><div className="h-px bg-slate-100 my-4" /></div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1">From Email</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><AtSign className="w-4 h-4" /></div>
                        <input name="smtpFromEmail" defaultValue={settings?.smtpFromEmail} placeholder="no-reply@mahallasplus.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1">From Name</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User className="w-4 h-4" /></div>
                        <input name="smtpFromName" defaultValue={settings?.smtpFromName} placeholder="MahallasPlus Notifications" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1">Encryption</label>
                      <select name="smtpEncryption" defaultValue={settings?.smtpEncryption || "TLS"} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all appearance-none">
                        <option value="TLS">TLS (StartTLS)</option>
                        <option value="SSL">SSL</option>
                        <option value="NONE">None</option>
                      </select>
                    </div>
                  </div>
                  {securityHidden}
                  {brandingHidden}
                </div>
              ) : activeTab === "security" ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Security &amp; Anti-Bot</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protect your platform from automated registrations</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4">
                     <Lock className="w-6 h-6 text-amber-600 shrink-0" />
                     <p className="text-xs font-bold text-amber-800 leading-relaxed uppercase tracking-wide">
                        Google reCAPTCHA v2 is required for public registration steps. Please obtain keys from the <a href="https://www.google.com/recaptcha/admin" target="_blank" className="underline decoration-2">reCAPTCHA Admin Console</a>.
                     </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1">reCAPTCHA Site Key</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Key className="w-4 h-4" /></div>
                        <input name="recaptchaSiteKey" defaultValue={settings?.recaptchaSiteKey} placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1">reCAPTCHA Secret Key</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Shield className="w-4 h-4" /></div>
                        <input name="recaptchaSecretKey" type="password" defaultValue={settings?.recaptchaSecretKey} placeholder="••••••••••••••••••••••••••••••••••••" className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                  {smtpHidden}
                  {brandingHidden}
                </div>
              ) : (
                <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
                      <Globe className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Payments &amp; Branding</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configure invoice details and platform identity</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1">Platform Logo URL</label>
                        <input name="logoUrl" defaultValue={settings?.logoUrl} placeholder="https://your-domain.com/logo.png" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                      </div>
                      <div className="col-span-2">
                        <div className="h-px bg-slate-100 my-4" />
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Bank Account Details (for Invoices)</h4>
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1">Bank Name</label>
                        <input name="bankName" defaultValue={settings?.bankName} placeholder="Commercial Bank" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1">Account Number</label>
                        <input name="accountNumber" defaultValue={settings?.accountNumber} placeholder="1234567890" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1">Account Holder Name</label>
                        <input name="accountHolder" defaultValue={settings?.accountHolder} placeholder="MahallasPlus Platform PVT LTD" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 px-1">Special Payment Instructions</label>
                        <textarea name="bankInstructions" rows={3} defaultValue={settings?.bankInstructions} placeholder="Please mention your Invoice Number as the reference..." className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-slate-900 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all resize-none" />
                      </div>
                    </div>
                  </div>
                  {smtpHidden}
                  {securityHidden}
                </div>
              )}

              <div className="mt-12 flex items-center justify-between">
                <div>
                  {message.text && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4" />}
                      {message.text}
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  {activeTab === "smtp" && (
                    <button type="button" onClick={handleTest} disabled={testing || saving} className="flex items-center gap-3 px-8 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all disabled:opacity-50 active:scale-95">
                      {testing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Test Connection
                    </button>
                  )}
                  <button disabled={saving || testing} className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Settings
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
