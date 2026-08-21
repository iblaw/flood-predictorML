"use client";

import React, { useState, useRef, useEffect } from "react";
import { Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface FilterState {
  riskLevels: string[]; // e.g. ["HIGH RISK", "MODERATE RISK", "SAFE"]
  timeHorizons: string[]; // e.g. ["CURRENT", "24H", "48H", "72H"]
}

interface ForecastFiltersProps {
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export default function ForecastFilters({ onApply, initialFilters }: ForecastFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || { riskLevels: [], timeHorizons: [] }
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleRiskLevel = (level: string) => {
    setFilters((prev) => {
      const active = prev.riskLevels.includes(level);
      return {
        ...prev,
        riskLevels: active
          ? prev.riskLevels.filter((l) => l !== level)
          : [...prev.riskLevels, level],
      };
    });
  };

  const toggleTimeHorizon = (horizon: string) => {
    setFilters((prev) => {
      const active = prev.timeHorizons.includes(horizon);
      return {
        ...prev,
        timeHorizons: active
          ? prev.timeHorizons.filter((h) => h !== horizon)
          : [...prev.timeHorizons, horizon],
      };
    });
  };

  const handleApply = () => {
    onApply(filters);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left z-40" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="shrink-0 bg-white border-4 border-black px-6 py-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 font-mono text-sm uppercase font-bold hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
      >
        <Filter className="w-5 h-5" />
        <span className="sm:hidden">FILTER</span><span className="hidden sm:inline">FILTER OPTIONS</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-4 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 w-72 p-4 flex flex-col font-mono"
          >
            <div className="mb-4">
              <h3 className="font-bold uppercase tracking-widest text-sm mb-3 border-b-2 border-black pb-1">
                Filter by Risk Level
              </h3>
              <div className="flex flex-col gap-2">
                {["HIGH RISK", "MODERATE RISK", "SAFE"].map((level) => (
                  <label key={level} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); toggleRiskLevel(level); }}>
                    <div className={`w-5 h-5 border-2 border-black flex items-center justify-center transition-colors ${filters.riskLevels.includes(level) ? 'bg-black' : 'bg-white group-hover:bg-gray-200'}`}>
                      {filters.riskLevels.includes(level) && <div className="w-2 h-2 bg-white" />}
                    </div>
                    <span className="text-sm font-bold uppercase">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold uppercase tracking-widest text-sm mb-3 border-b-2 border-black pb-1">
                Filter by Time Horizon
              </h3>
              <div className="flex flex-col gap-2">
                {["24H", "48H", "72H"].map((horizon) => (
                  <label key={horizon} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); toggleTimeHorizon(horizon); }}>
                    <div className={`w-5 h-5 border-2 border-black flex items-center justify-center transition-colors ${filters.timeHorizons.includes(horizon) ? 'bg-black' : 'bg-white group-hover:bg-gray-200'}`}>
                      {filters.timeHorizons.includes(horizon) && <div className="w-2 h-2 bg-white" />}
                    </div>
                    <span className="text-sm font-bold uppercase">{horizon} FORECAST</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleApply}
              className="w-full bg-black text-white font-bold uppercase tracking-widest py-3 border-2 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all active:translate-y-0 active:shadow-none"
            >
              Apply Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
