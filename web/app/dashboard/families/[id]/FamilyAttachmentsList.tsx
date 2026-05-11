"use client";

import { useState } from "react";
import { Image as ImageIcon, FileText, Eye, ExternalLink } from "lucide-react";
import { getProxiedImageUrl } from "@/lib/utils";
import { Lightbox } from "../../components/Lightbox";

interface FamilyAttachmentsListProps {
  attachments: string[];
}

export function FamilyAttachmentsList({ attachments }: FamilyAttachmentsListProps) {
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({
    open: false,
    index: 0
  });

  const imageAttachments = attachments.filter(path => path.match(/\.(jpg|jpeg|png|gif|webp)$/i));
  const proxiedImages = imageAttachments.map(path => getProxiedImageUrl(path));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-blue-600" /> Documents & Images
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {attachments.map((path, i) => {
          const isImage = path.match(/\.(jpg|jpeg|png|gif|webp)$/i);
          const imageIndex = isImage ? imageAttachments.indexOf(path) : -1;

          return (
            <div 
              key={i} 
              className="group relative aspect-square bg-slate-50 rounded-xl border border-slate-100 overflow-hidden hover:border-blue-200 transition-all cursor-pointer"
              onClick={() => {
                if (isImage) {
                  setLightbox({ open: true, index: imageIndex });
                } else {
                  window.open(path, "_blank");
                }
              }}
            >
              {isImage ? (
                <>
                  <img src={getProxiedImageUrl(path)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Attachment ${i+1}`} />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-3 bg-white rounded-xl shadow-xl hover:scale-110 transition-transform">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 p-1.5 bg-blue-600 text-white rounded-full shadow-lg group-hover:opacity-0 transition-opacity">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center group-hover:bg-blue-50/50 transition-colors">
                  <FileText className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  <span className="text-[8px] font-black uppercase text-slate-400 mt-1">Open Document</span>
                  <ExternalLink className="absolute top-2 right-2 w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Lightbox 
        images={proxiedImages}
        initialIndex={lightbox.index}
        isOpen={lightbox.open}
        onClose={() => setLightbox({ ...lightbox, open: false })}
      />
    </div>
  );
}
