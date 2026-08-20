"use client";

import React from 'react';
import { ArrowUp } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t-2 border-black bg-white text-black py-8 px-6 flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
      <div className="font-bold text-sm">
        &copy; {new Date().getFullYear()} Flood Forecast ML
      </div>
      <button 
        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        className="bg-black text-white p-3 hover:bg-blue-600 transition-colors shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] flex items-center justify-center border-2 border-transparent"
        aria-label="Back to Top"
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  );
}
