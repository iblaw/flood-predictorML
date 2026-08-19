import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navigation from "./Navigation";
import PageTransition from "./PageTransition";
import Footer from "./Footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flood Forecast ML | 3MTT Capstone",
  description: "AI-powered disaster management tool for predicting flood events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body 
        suppressHydrationWarning
        className="w-full min-h-full flex flex-col font-sans bg-white overflow-x-hidden"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(200, 200, 200, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(200, 200, 200, 0.35) 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      >
        <Navigation />
        
        <PageTransition>
          {children}
        </PageTransition>
        
        <Footer />
      </body>
    </html>
  );
}
