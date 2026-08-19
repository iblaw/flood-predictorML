"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { name: 'Home', path: '/' },
  { name: 'Forecasts', path: '/forecasts' },
  { name: 'About', path: '/about' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-black px-6 py-4 flex justify-between items-center">
      <div className="font-black text-xl tracking-tight">
        <Link href="/">Flood Forecast ML</Link>
      </div>
      <div className="flex items-center gap-6">
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
    </nav>
  );
}
