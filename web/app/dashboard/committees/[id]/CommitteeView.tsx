"use client";
import { useState } from "react";
import { Users, Shield, Calendar, MapPin, UserPlus, ShieldCheck, History, Wallet, HeartHandshake, ArrowUpRight, ArrowDownRight, Target, TrendingUp, Info, Landmark, Banknote } from "lucide-react";
import { MemberSelector } from "./MemberSelector";
import { CommitteeMemberActions } from "./CommitteeMemberActions";
import { TermManager } from "./TermManager";
import { DonorDonationManager } from "./DonorDonationManager";
import { FundDistributionManager } from "./FundDistributionManager";

export function CommitteeView({ committee, currentTerm, members, allMembers, stats, settings }: any) {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'distributions' | 'members'>('overview');

  const formatValue = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: settings.decimals,
      maximumFractionDigits: settings.decimals,
    }).format(val);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[36px] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-blue-50 transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
             <Landmark className="w-20 h-20 text-slate-600" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Term Opening Balance</p>
          <h4 className="text-2xl font-black text-slate-900 leading-none">{settings.currency} {formatValue(stats.openingBalance)}</h4>
          <div className="mt-4 flex items-center gap-2 text-slate-400">
             <Info className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Initial Float</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[36px] border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-blue-50 transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
             <Wallet className="w-20 h-20 text-blue-600" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Total Collections</p>
          <h4 className="text-2xl font-black text-slate-900 leading-none">{settings.currency} {formatValue(stats.totalCollections)}</h4>
          <div className="mt-4 flex items-center gap-2 text-emerald-600">
             <TrendingUp className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-widest">Active Inflow</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[36px] border-2 border-emerald-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-50 transition-all duration-500 bg-gradient-to-br from-white to-emerald-50/20">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
             <Banknote className="w-20 h-20 text-emerald-600" />
          </div>
          <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em] mb-3">Total Amount (Net)</p>
          <h4 className="text-3xl font-black text-slate-900 leading-none">{settings.currency} {formatValue(stats.totalAmount)}</h4>
          <div className="mt-4 flex items-center gap-2 text-emerald-600">
             <ShieldCheck className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-widest">Opening Balance & Collection</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[36px] border border-slate-200 shadow-sm group hover:shadow-xl transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Donor Base</p>
          <h4 className="text-2xl font-black text-slate-900 leading-none">{stats.donorCount}</h4>
          <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
             <HeartHandshake className="w-4 h-4 text-rose-500" /> Contributors
          </p>
        </div>
      </div>

      {/* Main Content & Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          
          {/* Custom Tabs */}
          <div className="flex gap-2 p-1.5 bg-slate-100/80 backdrop-blur rounded-[24px] w-fit border border-slate-200/50">
            {['overview', 'financials', 'distributions', 'members'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${activeTab === tab ? 'bg-white text-slate-900 shadow-md shadow-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="md:col-span-1">
                      <TermManager committeeId={committee.id} terms={committee.terms} />
                   </div>
                   <div className="md:col-span-1 space-y-8">
                     <div className="bg-white rounded-[40px] border border-slate-200 p-10 flex flex-col items-center justify-center text-center space-y-4 h-full">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                           <Info className="w-8 h-8" />
                        </div>
                        <h5 className="font-black text-slate-900 uppercase tracking-widest text-sm">Lifecycle Management</h5>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-loose">
                          Current Term: <span className="text-slate-900">{currentTerm?.name}</span><br/>
                          Status: <span className="text-emerald-600">{currentTerm?.status}</span>
                        </p>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-loose max-w-[200px]">
                          Manage your committee terms and lifecycle events from this central console.
                        </p>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'financials' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                 <DonorDonationManager committeeId={committee.id} terms={committee.terms} />
              </div>
            )}

            {activeTab === 'distributions' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                 <FundDistributionManager committeeId={committee.id} terms={committee.terms} />
              </div>
            )}

            {activeTab === 'members' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="lg:col-span-8 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden h-fit">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                      <Users className="w-6 h-6 text-blue-600" /> {currentTerm?.name} Personnel
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {members.map((m: any) => (
                      <div key={m.id} className="p-8 flex justify-between items-center hover:bg-slate-50/30 transition-all group">
                         <div className="flex gap-5 items-center">
                            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-100">
                              {m.familyMember.fullName.charAt(0)}
                            </div>
                            <div className="space-y-1">
                               <div className="flex items-center gap-3">
                                 <h4 className="font-black text-slate-900 uppercase tracking-wide text-sm">{m.familyMember.fullName}</h4>
                                 <span className="bg-slate-900 text-white text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-[0.1em]">{m.role}</span>
                               </div>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                 <MapPin className="w-3.5 h-3.5" /> {m.familyMember.familyCard.subMahalla.name}
                               </p>
                            </div>
                         </div>
                         <CommitteeMemberActions member={m} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="sticky top-28">
                    <MemberSelector terms={committee.terms} allMembers={allMembers} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (Empty or Global Widgets) */}
        <div className="lg:col-span-4 space-y-8 hidden lg:block">
           {/* Global sidebar content could go here, currently empty to focus on tab contents */}
        </div>
      </div>
    </div>
  );
}
