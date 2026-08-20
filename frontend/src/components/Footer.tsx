"use client";

import React from 'react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="fixed bottom-0 left-0 w-full z-40 bg-white border-t-4 border-black px-6 py-3 flex flex-col sm:flex-row items-center justify-between font-mono text-sm uppercase font-bold gap-3">
      <div>Flood Forecast ML &copy; 2026</div>
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
        <div>Built by Ibrahim Lawal | FE/26/5038794255</div>
        <button 
          onClick={scrollToTop}
          className="bg-black text-white px-4 py-1 border-2 border-black hover:bg-yellow-400 hover:text-black transition-colors font-bold flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
        >
          ↑ BACK TO TOP
        </button>
      </div>
    </footer>
  );
}
