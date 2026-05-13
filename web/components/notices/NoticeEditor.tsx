"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { upsertNotice, publishNotice } from "@/app/actions/notices";
import { ImagePlus, FileUp, X, Loader2, Send, Save, Globe, MapPin } from "lucide-react";

interface SubMahalla {
  id: string;
  name: string;
}

interface NoticeEditorProps {
  initialData?: any;
  subMahallas?: SubMahalla[];
  role: string;
}

export default function NoticeEditor({ initialData, subMahallas = [], role }: NoticeEditorProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(initialData?.coverImage || null);
  const [targetAllSub, setTargetAllSub] = useState(initialData?.targetAllSub || false);
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>(initialData?.targetSubMahallaIds || []);

  const isMainAdmin = role === "MAIN_ADMIN";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, shouldPublish = false) {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formRef.current) return;
      const formData = new FormData(formRef.current);
      formData.append("targetAllSub", targetAllSub.toString());
      formData.append("targetSubMahallaIds", JSON.stringify(selectedSubIds));
      
      const notice = await upsertNotice(formData);

      if (shouldPublish) {
        await publishNotice(notice.id);
      }

      router.push("/dashboard/notices");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to save notice. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const toggleSubMahalla = (id: string) => {
    setSelectedSubIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <form ref={formRef} onSubmit={(e) => handleSubmit(e, false)} className="space-y-12">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      {initialData?.coverImage && <input type="hidden" name="existingCoverImage" value={initialData.coverImage} />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Editor */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Notice Title</label>
                <input
                  required
                  name="title"
                  defaultValue={initialData?.title}
                  placeholder="e.g. Annual Mahalla General Meeting 2026"
                  className="w-full text-2xl font-black text-slate-900 placeholder:text-slate-200 border-none focus:ring-0 p-0"
                />
              </div>

              <div className="h-px bg-slate-100" />

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Announcement Content</label>
                <textarea
                  required
                  name="content"
                  rows={12}
                  defaultValue={initialData?.content}
                  placeholder="Share the details of your announcement here..."
                  className="w-full text-slate-600 leading-relaxed placeholder:text-slate-200 border-none focus:ring-0 p-0 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <FileUp className="w-4 h-4" /> Supporting Documents & Photos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="border-2 border-dashed border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Upload Files</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">PDF, JPG, PNG up to 10MB</p>
                </div>
                <input type="file" name="attachments" multiple className="hidden" />
              </label>

              {/* Placeholder for existing attachments list */}
              {initialData?.attachments?.map((att: any) => (
                <div key={att.id} className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400">
                      <FileUp className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{att.name}</span>
                  </div>
                  <button type="button" className="text-slate-300 hover:text-rose-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Actions */}
        <div className="space-y-8">
          {/* Cover Image Upload */}
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Cover Image</h3>
            <div className="aspect-video rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative group">
              {coverPreview ? (
                <>
                  <img src={coverPreview} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => setCoverPreview(null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-lg flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                  <ImagePlus className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Cover</span>
                  <input 
                    type="file" 
                    name="coverImage" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCoverPreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Distribution Targeting */}
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Distribution Settings</h3>
            
            {isMainAdmin ? (
              <div className="space-y-6">
                <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 cursor-pointer transition-all">
                  <input 
                    type="checkbox" 
                    checked={targetAllSub}
                    onChange={(e) => setTargetAllSub(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-blue-200 text-blue-600 focus:ring-blue-500" 
                  />
                  <div>
                    <p className="text-xs font-black text-blue-900 uppercase tracking-tight">Broadcast Globally</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">Send to all Sub-Mahallas</p>
                  </div>
                </label>

                {!targetAllSub && (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Target Specific Sub-Mahallas</p>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                      {subMahallas.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => toggleSubMahalla(sub.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            selectedSubIds.includes(sub.id)
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-xs font-bold uppercase tracking-tight">{sub.name}</span>
                          <MapPin className={`w-3 h-3 ${selectedSubIds.includes(sub.id) ? "text-blue-400" : "text-slate-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                <MapPin className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Local Context</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Locked to your Mahalla</p>
                </div>
              </div>
            )}
          </div>

          {/* Publishing Actions */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-5 bg-white border-2 border-slate-900 text-slate-900 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save as Draft
            </button>
            
            <button
              type="button"
              disabled={loading}
              onClick={(e) => handleSubmit(e as any, true)}
              className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 group"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
              Publish & Notify
            </button>
            
            <p className="text-[9px] text-slate-400 font-bold uppercase text-center tracking-[0.2em] px-6 leading-loose">
              Publishing will instantly send WhatsApp notifications to all members in the targeted Mahallas.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

function Plus(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
