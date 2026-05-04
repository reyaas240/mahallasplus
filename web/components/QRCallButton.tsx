"use client";
import { useState } from "react";
import { QrCode, X, Phone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function QRCallButton({ phone, name }: { phone: string; name: string }) {
  const [showQR, setShowQR] = useState(false);

  if (!phone) return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowQR(true);
        }}
        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 hover:bg-blue-100 transition-all border border-slate-100 shadow-sm"
        title="Show Call QR"
      >
        <QrCode className="w-3.5 h-3.5" />
      </button>

      {showQR && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setShowQR(false)}
        >
          <div 
            className="bg-white rounded-[40px] p-10 shadow-2xl flex flex-col items-center gap-6 relative animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowQR(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-rose-600 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{name}</h3>
              <div className="flex items-center justify-center gap-2 mt-1 text-blue-600 font-bold">
                <Phone className="w-4 h-4" />
                <span>{phone}</span>
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl border-4 border-slate-50 shadow-inner">
              <QRCodeSVG 
                value={`tel:${phone}`} 
                size={200}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/logo.png", // If you have a logo, otherwise remove
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center max-w-[200px]">
              Scan to call directly from your mobile device
            </p>

            <a 
              href={`tel:${phone}`}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-xl shadow-blue-100"
            >
              <Phone className="w-4 h-4" /> Call Now
            </a>
          </div>
        </div>
      )}
    </>
  );
}
