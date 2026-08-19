"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const tabs = [
  { name: 'Home', path: '/' },
  { name: 'Forecasts', path: '/forecasts' },
  { name: 'About', path: '/about' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b-2 border-black px-6 py-4 flex justify-between items-center relative">
      <div className="font-black text-xl tracking-tight">
        <Link href="/" onClick={() => setIsOpen(false)}>Flood Forecast ML</Link>
      </div>
      
      {/* Desktop View */}
      <div className="hidden md:flex items-center gap-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <Link key={tab.path} href={tab.path} passHref>
              <div
                className={`font-bold text-sm transition-colors duration-200 cursor-pointer ${
                  isActive ? 'text-blue-600' : 'text-black hover:text-blue-600'
                }`}
              >
                {tab.name}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden block text-black focus:outline-none" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b-2 border-black flex flex-col p-6 gap-6 shadow-[0_8px_0_0_rgba(0,0,0,1)] z-50 animate-in slide-in-from-top-2 md:hidden">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link key={tab.path} href={tab.path} passHref>
                <div
                  onClick={() => setIsOpen(false)}
                  className={`font-bold text-lg transition-colors duration-200 cursor-pointer ${
                    isActive ? 'text-blue-600' : 'text-black hover:text-blue-600'
                  }`}
                >
                  {tab.name}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
