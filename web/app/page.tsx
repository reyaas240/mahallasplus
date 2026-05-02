import Link from "next/link";
import { Shield, Users, Layers, Lock, PhoneCall, ChevronRight, Activity, FileText } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">MahallasPlus</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#about" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">About</Link>
            <Link href="#contact" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Login</Link>
            <Link href="/register" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all shadow-sm shadow-blue-200">
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden bg-slate-50">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
            <div className="w-96 h-96 bg-blue-200/50 rounded-full blur-3xl"></div>
          </div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
            <div className="w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-8">
              <Activity className="w-4 h-4" />
              <span>Next-Generation Mahalla System</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight mb-6">
              Secure, Modern & Scalable <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Community Management</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              Empower your Main and Sub Mahallas with enterprise-grade security, automated family card management, and strict privacy controls.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-xl shadow-blue-200">
                Start Onboarding
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link href="#features" className="px-8 py-4 rounded-full text-lg font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                Explore Features
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Enterprise Features Built for Trust</h2>
              <p className="text-lg text-slate-600">Handling sensitive personal data requires the highest level of security. MahallasPlus is built with privacy and scalability in mind.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Layers className="w-6 h-6 text-blue-600" />}
                title="Multi-Tenant Architecture"
                description="Easily manage a hierarchy of Main Mahallas and Sub Mahallas from a single, unified platform dashboard."
              />
              <FeatureCard 
                icon={<Shield className="w-6 h-6 text-emerald-600" />}
                title="Strict Manual Verification"
                description="No auto-approvals. Every new Mahalla request requires an ID upload and manual review by platform administrators."
              />
              <FeatureCard 
                icon={<Lock className="w-6 h-6 text-indigo-600" />}
                title="Role-Based Access Control"
                description="Granular permissions ensure Sub Admin users only access data within their assigned jurisdiction."
              />
              <FeatureCard 
                icon={<FileText className="w-6 h-6 text-amber-600" />}
                title="Family Card Management"
                description="Digital family cards track living types, member relationships, subscriptions, and demographic data."
              />
              <FeatureCard 
                icon={<Users className="w-6 h-6 text-pink-600" />}
                title="Member Profiling"
                description="Detailed records including unique system-wide NIC tracking, education, and occupation logic."
              />
              <FeatureCard 
                icon={<Activity className="w-6 h-6 text-cyan-600" />}
                title="Data Security & Audit"
                description="Sensitive data is encrypted. Every action taken by admins is recorded in immutable audit logs."
              />
            </div>
          </div>
        </section>

        {/* Call To Action */}
        <section id="contact" className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Digitize Your Community?</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              Join the growing number of Mahallas moving to a secure, organized, and modern data management platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register" className="bg-white text-slate-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-slate-100 transition-all hover:scale-105">
                Register Your Mahalla
              </Link>
              <a href="mailto:contact@mahallasplus.com" className="flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold text-white border border-slate-700 hover:bg-slate-800 transition-all">
                <PhoneCall className="w-5 h-5" />
                Contact Sales
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-50 py-12 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-5 h-5 text-slate-400" />
            <span className="text-lg font-semibold text-slate-700">MahallasPlus</span>
          </div>
          <p>© {new Date().getFullYear()} MahallasPlus. All rights reserved.</p>
          <p className="mt-2">Built with privacy and security as the foundation.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
