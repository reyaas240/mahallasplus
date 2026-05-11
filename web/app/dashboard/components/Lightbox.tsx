"use client";

import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useEffect } from "react";

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, isOpen, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [currentIndex, isOpen]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={onClose} />
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-xs font-black uppercase tracking-widest">
            {currentIndex + 1} / {images.length}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setZoom(z => Math.min(z + 0.5, 3))} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
              <ZoomIn className="w-5 h-5" />
            </button>
            <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
              <ZoomOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
        <div 
          className="relative max-w-full max-h-full transition-transform duration-300 ease-out pointer-events-auto"
          style={{ transform: `scale(${zoom})` }}
        >
          <img 
            src={images[currentIndex]} 
            className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg"
            alt={`Image ${currentIndex + 1}`} 
          />
        </div>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-0 p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-md transition-all pointer-events-auto group"
            >
              <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-0 p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl backdrop-blur-md transition-all pointer-events-auto group"
            >
              <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-white/5 backdrop-blur-md rounded-[24px] border border-white/5 overflow-x-auto max-w-[90%]">
          {images.map((img, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${currentIndex === idx ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/20' : 'border-transparent opacity-50 hover:opacity-100'}`}
            >
              <img src={img} className="w-full h-full object-cover" alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
