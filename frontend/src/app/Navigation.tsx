"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = [
  { name: 'Home', path: '/' },
  { name: 'Forecasts', path: '/forecasts' },
  { name: 'About', path: '/about' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    setIsExpanded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 3500);
  };

  useEffect(() => {
    resetTimeout();
    
    const handleMouseMove = (e: MouseEvent) => {
      // If mouse moves within the bottom 150px of the viewport, expand the nav
      if (e.clientY > window.innerHeight - 150) {
        resetTimeout();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.nav 
        layout
        onMouseEnter={resetTimeout}
        onMouseMove={resetTimeout}
        initial={{ borderRadius: 9999 }}
        className={`bg-white/90 backdrop-blur-md border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? 'p-1.5 rounded-full' : 'w-14 h-14 rounded-full justify-center cursor-pointer'
        }`}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div 
              key="expanded"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5"
            >
              {tabs.map((tab) => {
                const isActive = pathname === tab.path;
                return (
                  <Link key={tab.path} href={tab.path} passHref>
                    <motion.div
                      whileHover={{ scale: isActive ? 1 : 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`relative px-5 py-2 rounded-full font-bold text-sm transition-colors duration-200 cursor-pointer flex items-center justify-center border-2 border-black ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                          : 'bg-transparent text-black hover:bg-gray-100'
                      }`}
                    >
                      {tab.name}
                    </motion.div>
                  </Link>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center w-full h-full"
            >
              {/* Brutalist Menu icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" className="text-black">
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
