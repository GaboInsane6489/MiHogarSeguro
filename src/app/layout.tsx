import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Second Brain | Execution Workspace",
  description: "Personal Second Brain & Execution Operating System powered by Gemini AI and Supabase",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Second Brain | Execution Workspace",
    description: "High-performance daily execution OS and knowledge architecture",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-canvas text-text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
