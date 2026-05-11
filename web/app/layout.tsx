import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MahallasPlus - Modern Community Management",
  description: "A production-ready, multi-tenant platform for managing Mahallas and families securely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} font-sans`} suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
