"use client";

import React from 'react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 bg-white border-t-4 border-black px-4 py-2 sm:px-6 sm:py-3 flex items-center justify-between font-mono text-[10px] sm:text-sm uppercase font-bold">
      <div className="hidden sm:block">Flood Forecast ML &copy; 2026</div>
      <div className="truncate max-w-[60%] sm:max-w-none text-center sm:text-left">
        Built by Ibrahim Lawal | FE/26/5038794255
      </div>
      <button 
        onClick={scrollToTop}
        className="bg-black text-white px-2 py-1 sm:px-4 sm:py-1 border-2 border-black hover:bg-yellow-400 hover:text-black transition-colors font-bold flex items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
      >
        ↑ <span className="hidden sm:inline ml-1">BACK TO&nbsp;</span>TOP
      </button>
    </footer>
  );
}
