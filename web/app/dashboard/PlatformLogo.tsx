"use client";
import { Users } from "lucide-react";
import { useState } from "react";

export function PlatformLogo() {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
        <Users className="w-6 h-6 text-white" />
      </div>
    );
  }

  return (
    <div className="w-60 h-40 flex items-center justify-center overflow-hidden">
      <img
        src="/Logomahallasplus.png"
        className="w-full h-full object-contain"
        alt="Logo"
        onError={() => setError(true)}
      />
    </div>
  );
}
