
"use client";

import React, { useState, useEffect, useTransition, useDeferredValue, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { LGA, BFFData } from './ForecastCard';
import dynamic from 'next/dynamic';

import ForecastGrid from '../../components/ForecastGrid';
import ForecastFilters from '../../components/ForecastFilters';

interface ForecastClientProps {
  lgas: LGA[];
}

const placeholders = ["LGA", "latitude and longitude"];

export default function ForecastClient({ lgas }: ForecastClientProps) {
  const [searchValue, setSearchValue] = useState("");
  const deferredSearchValue = useDeferredValue(searchValue);
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const [isLocating, setIsLocating] = useState(false);

  const [isPending, startTransition] = useTransition();

  const [bulkPredictions, setBulkPredictions] = useState<Record<string, BFFData>>({});
  const [isBulkLoaded, setIsBulkLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    fetch(`${backendUrl}/bulk-forecasts`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.predictions) {
          setBulkPredictions(data.predictions);
        }
        if (data && data.last_updated) {
          const date = new Date(data.last_updated);
          const formatted = date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });
          setLastUpdated(formatted);
        }
      })
      .catch(() => { })
      .finally(() => setIsBulkLoaded(true));

    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lon = position.coords.longitude.toFixed(4);
        setSearchValue(`${lat}, ${lon}`);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        alert(`Unable to retrieve your location: ${error.message}`);
      }
    );
  }, []);

  const filteredLgas = useMemo(() => {
    if (!deferredSearchValue) return lgas;

    if (deferredSearchValue.includes(',')) {
      const parts = deferredSearchValue.split(',');
      const lat = parseFloat(parts[0]);
      const lon = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lon)) {
        let nearestLga = lgas[0];
        let minDistance = Infinity;
        for (const lga of lgas) {
          const d = Math.pow(lga.lat - lat, 2) + Math.pow(lga.lon - lon, 2);
          if (d < minDistance) {
            minDistance = d;
            nearestLga = lga;
          }
        }
        return [nearestLga];
      }
    }

    const lowerSearch = deferredSearchValue.toLowerCase();
    return lgas.filter((lga) => lga.name.toLowerCase().includes(lowerSearch));
  }, [lgas, deferredSearchValue]);

  const [filters, setFilters] = useState<{ riskLevels: string[], timeHorizons: string[] }>({ riskLevels: [], timeHorizons: [] });

  const handleApplyFilters = useCallback((newFilters: { riskLevels: string[], timeHorizons: string[] }) => {
    startTransition(() => {
      setFilters(newFilters);
    });
  }, []);

  const finalLgas = useMemo(() => {
    return filteredLgas.filter(lga => {
      const data = bulkPredictions[lga.name];
      if (!data) return false;
      
      const r_cur = data.risk_level ?? 0;
      const r_24 = data.risk_24h ?? 0;
      const r_48 = data.risk_48h ?? 0;
      const r_72 = data.risk_72h ?? 0;

      // Max risk calculation identical to ForecastCard
      let maxRisk = -1;
      let finalTier = "PENDING";
      if (data.tier !== "UNAVAILABLE") {
        const horizons = [r_24, r_48, r_72];
        maxRisk = Math.max(...horizons);
        if (maxRisk >= 0.7) finalTier = "HIGH RISK";
        else if (maxRisk >= 0.4) finalTier = "MODERATE RISK";
        else finalTier = "SAFE";
      } else {
        finalTier = "UNAVAILABLE";
      }

      // 1. Risk Level Filter (OR within group)
      const riskMatch = filters.riskLevels.length === 0 || filters.riskLevels.includes(finalTier);

      // 2. Time Horizon Filter (OR within group, AND between groups)
      let timeMatch = filters.timeHorizons.length === 0;
      if (!timeMatch && data.tier !== "UNAVAILABLE") {
        const timeChecks = [];
        if (filters.timeHorizons.includes("24H")) timeChecks.push(r_24);
        if (filters.timeHorizons.includes("48H")) timeChecks.push(r_48);
        if (filters.timeHorizons.includes("72H")) timeChecks.push(r_72);
        
        // Find if ANY of the selected horizons match the required risk levels
        // If riskLevels is empty, ANY selected horizon is fine.
        // If riskLevels has items, AT LEAST ONE selected horizon must match one of the selected risk levels.
        if (filters.riskLevels.length === 0) {
          timeMatch = true; 
        } else {
          timeMatch = timeChecks.some(val => {
            let tier = "SAFE";
            if (val >= 0.7) tier = "HIGH RISK";
            else if (val >= 0.4) tier = "MODERATE RISK";
            return filters.riskLevels.includes(tier);
          });
        }
      } else if (!timeMatch && data.tier === "UNAVAILABLE") {
         // If time horizon filtered but data unavailable, it fails the time horizon filter usually
         timeMatch = false;
      }

      // If user selected ONLY Risk Levels (e.g. HIGH RISK) but no Time Horizons, 
      // the `timeMatch` is true, so it will just return `riskMatch`.
      // If user selected BOTH (e.g. HIGH RISK and 24H), it must be High Risk at 24H (handled by timeMatch logic above).
      // Wait, if both are selected, `timeMatch` checks if 24H is High Risk. But what if it's High Risk at 24H, does it satisfy `riskMatch`?
      // `riskMatch` checks `finalTier`. If 24H is High Risk, `maxRisk` is >= High Risk, so `finalTier` is High Risk. So `riskMatch` is also true!
      // This is logically sound.

      return riskMatch && timeMatch;
    });
  }, [filteredLgas, filters, bulkPredictions]);

  const isTransitioning = isPending || searchValue !== deferredSearchValue;

  return (
    <div className="flex flex-col w-full min-h-screen items-center pt-24 pb-12 px-6 sm:px-10 lg:px-12 xl:px-16 max-w-[1600px] mx-auto">
      <div className="w-full shrink-0 z-10 bg-white pb-6 flex flex-col items-center">
        <div className="flex flex-col items-center w-full max-w-7xl text-center relative mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-black mb-2 tracking-tight">Flood Forecasts</h1>
          {lastUpdated && (
            <div className="text-sm font-medium text-black/80 font-mono mt-2 mb-6">
              Last Forecast: {lastUpdated}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full relative z-30 mt-2">
            <div className="relative w-full flex-1">
              <input
                type="text"
                value={searchValue}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full border-2 border-black rounded-full px-6 py-4 text-base font-medium outline-none focus:ring-2 focus:ring-blue-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white text-left sm:text-center relative z-10"
              />
              {!searchValue && (
                <div className="absolute inset-0 flex justify-start sm:justify-center px-6 sm:px-0 items-center pointer-events-none z-20 text-zinc-400 text-base font-medium">
                  <span className="whitespace-nowrap mr-1">Search by </span>
                  <div className="relative flex items-center">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={placeholderIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="whitespace-nowrap"
                      >
                        {placeholders[placeholderIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              )}

              <AnimatePresence>
                {isFocused && searchValue && filteredLgas.length > 0 && !searchValue.includes(',') && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl z-50 absolute w-full mt-2 overflow-hidden left-0 text-left"
                  >
                    <div className="max-h-60 overflow-y-auto flex flex-col">
                      {filteredLgas.slice(0, 30).map((lga, idx) => (
                        <div
                          key={idx}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchValue(lga.name);
                            setIsFocused(false);
                          }}
                          className="px-6 py-3 cursor-pointer font-bold text-black border-b border-black/10 last:border-b-0 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          {lga.name}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="shrink-0 w-full sm:w-auto">
              <ForecastFilters onApply={handleApplyFilters} initialFilters={filters} />
            </div>
          </div>

          <button
            onClick={handleGeolocation}
            disabled={isLocating}
            className="mt-6 text-blue-600 underline underline-offset-4 decoration-1 text-sm font-medium hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLocating ? 'Locating...' : 'my current location'}
          </button>
        </div>
      </div>

      <div className={`w-full relative transition-opacity duration-200 ${isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {!isBulkLoaded ? (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-8 mt-12 w-full">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse border-2 border-black rounded-3xl h-64 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start w-full">
                  <div className="w-1/2 h-8 bg-gray-300 rounded-md"></div>
                  <div className="w-16 h-8 bg-gray-300 rounded-full"></div>
                </div>
                <div className="flex-1 flex flex-col gap-3 mt-4">
                  <div className="w-full h-4 bg-gray-300 rounded-md"></div>
                  <div className="w-5/6 h-4 bg-gray-300 rounded-md"></div>
                  <div className="w-4/6 h-4 bg-gray-300 rounded-md"></div>
                </div>
                <div className="w-full h-10 bg-gray-300 rounded-xl mt-auto"></div>
              </div>
            ))}
          </div>
        ) : finalLgas.length === 0 ? (
          <div className="w-full bg-white border-2 border-black rounded-3xl p-12 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <div className="w-16 h-16 bg-red-100 border-2 border-black rounded-full flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-2xl font-black heading-font">No Communities Match This Filter</h3>
            <p className="text-gray-600 max-w-md mx-auto text-sm">
              We couldn&apos;t find any local government areas matching this criteria. Try clearing your filters or searching for a different area.
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setSearchValue('');
                  startTransition(() => {
                    setFilters({ riskLevels: [], timeHorizons: [] });
                  });
                }}
                className="border-2 border-black bg-black text-white font-bold px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
              >
                Clear Search & Filters
              </button>
            </div>
          </div>
        ) : (
          <ForecastGrid
            lgas={finalLgas}
            bulkPredictions={bulkPredictions}
            isBulkLoaded={isBulkLoaded}
          />
        )}
      </div>
    </div>
  );
}
