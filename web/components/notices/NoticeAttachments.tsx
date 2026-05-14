"use client";

import { useState } from "react";
import { FileText, Download, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { getProxiedImageUrl } from "@/lib/utils";

interface Attachment {
  id: string;
  url: string;
  name: string;
  type: string;
}

export default function NoticeAttachments({ attachments }: { attachments: Attachment[] }) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = attachments.filter(a => a.type.startsWith('image/'));
  const otherFiles = attachments.filter(a => !a.type.startsWith('image/'));

  const openLightbox = (id: string) => {
    const index = images.findIndex(img => img.id === id);
    if (index !== -1) setSelectedImage(index);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="pt-12 border-t border-slate-100">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Attachments & Documents</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attachments.map((att) => {
          const isImage = att.type.startsWith('image/');
          
          return (
            <div 
              key={att.id}
              className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px] border border-slate-100 hover:bg-slate-100 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm relative overflow-hidden">
                  {isImage ? (
                    <img src={getProxiedImageUrl(att.url)} alt={att.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <FileText className="w-6 h-6" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-tight truncate pr-4">{att.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{att.type.split('/')[1] || 'File'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isImage && (
                  <button 
                    onClick={() => openLightbox(att.id)}
                    className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
                    title="View Image"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                )}
                <a 
                  href={getProxiedImageUrl(att.url)}
                  download={att.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-300 hover:text-slate-900 transition-colors"
                  title="Download File"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Overlay */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[110]"
          >
            <X className="w-8 h-8" />
          </button>

          {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-8 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-4 z-[110]"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-4 z-[110]"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}

          <div className="max-w-[90vw] max-h-[80vh] relative group">
            <img 
              src={getProxiedImageUrl(images[selectedImage].url)} 
              alt={images[selectedImage].name}
              className="w-full h-full object-contain shadow-2xl rounded-lg animate-in zoom-in duration-300" 
            />
            <div className="absolute -bottom-12 left-0 right-0 text-center">
              <p className="text-white/60 text-xs font-black uppercase tracking-widest">{images[selectedImage].name}</p>
              <p className="text-white/30 text-[10px] font-bold uppercase tracking-tighter mt-1">{selectedImage + 1} / {images.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
