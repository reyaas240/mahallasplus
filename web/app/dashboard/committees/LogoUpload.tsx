"use client";
import { useState, useRef } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Upload, X, Check, Image as ImageIcon } from "lucide-react";

export function LogoUpload({ onImageCropped, currentLogo }: { onImageCropped: (blob: Blob | null) => void, currentLogo?: string | null }) {
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropping, setIsCropping] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogo || null);
  const imgRef = useRef<HTMLImageElement>(null);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setImgSrc(reader.result?.toString() || ""));
      reader.readAsDataURL(e.target.files[0]);
      setIsCropping(true);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, 1, width, height),
      width,
      height
    );
    setCrop(crop);
  }

  async function getCroppedImg() {
    if (!imgRef.current || !completedCrop) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          onImageCropped(blob);
          setPreviewUrl(URL.createObjectURL(blob));
          setIsCropping(false);
        }
      }, "image/png");
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Committee Logo (512x512px)</label>
      
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center shadow-inner group-hover:border-blue-600 transition-all">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-300" />
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all">
            <Upload className="w-4 h-4" />
            <input type="file" className="hidden" accept="image/*" onChange={onSelectFile} />
          </label>
        </div>
        
        <div className="flex-1 space-y-1">
          <p className="text-xs font-black text-slate-900 uppercase tracking-wide">Identity Badge</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Square aspect ratio recommended.<br/>Max size: 2MB
          </p>
        </div>
      </div>

      {isCropping && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-8 animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-[40px] p-10 max-w-2xl w-full shadow-2xl relative overflow-hidden">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Adjust Identity Logo</h3>
               <button type="button" onClick={() => setIsCropping(false)} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:text-rose-600 transition-all hover:bg-rose-50">
                 <X className="w-6 h-6" />
               </button>
             </div>

             <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center mb-8 max-h-[50vh]">
               <ReactCrop 
                 crop={crop} 
                 onChange={c => setCrop(c)} 
                 onComplete={c => setCompletedCrop(c)}
                 aspect={1}
                 circularCrop
               >
                 {imgSrc && <img ref={imgRef} src={imgSrc} alt="Crop me" onLoad={onImageLoad} className="max-w-full" />}
               </ReactCrop>
             </div>

             <div className="flex gap-4">
               <button 
                 type="button"
                 onClick={() => setIsCropping(false)}
                 className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
               >
                 Discard
               </button>
               <button 
                 type="button"
                 onClick={getCroppedImg}
                 className="flex-2 px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200"
               >
                 <Check className="w-5 h-5" /> Save Identity Logo
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
