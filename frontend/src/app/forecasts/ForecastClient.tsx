"use client";

import React, { useState, useEffect, useTransition, useDeferredValue, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchX } from 'lucide-react';
import { LGA, BFFData } from './ForecastCard';
import dynamic from 'next/dynamic';

const VirtualizedGrid = dynamic(() => import('../../components/VirtualizedForecastGrid'), { ssr: false });

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
  
  const [statusFilter, setStatusFilter] = useState('ALL');
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
      .catch(() => {})
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

  const handleSetStatusFilter = useCallback((filterType: string) => {
    startTransition(() => {
      setStatusFilter(filterType);
    });
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

  const filterCounts = useMemo(() => {
    const counts = { 'ALL': filteredLgas.length, 'HIGH RISK': 0, 'MODERATE RISK': 0, 'SAFE': 0 };
    filteredLgas.forEach(lga => {
      const data = bulkPredictions[lga.name];
      if (data && data.tier) {
        const tier = data.tier.toUpperCase();
        if (counts[tier as keyof typeof counts] !== undefined) {
          counts[tier as keyof typeof counts]++;
        }
      }
    });
    return counts;
  }, [filteredLgas, bulkPredictions]);

  const finalLgas = useMemo(() => {
    if (statusFilter === 'ALL') return filteredLgas;
    
    return filteredLgas.filter(lga => {
      const data = bulkPredictions[lga.name];
      if (!data) return false;
      const tier = data.tier ? data.tier.toUpperCase() : "PENDING";
      return tier === statusFilter;
    });
  }, [filteredLgas, statusFilter, bulkPredictions]);

  const isTransitioning = isPending || searchValue !== deferredSearchValue;

  return (
    <div className="flex flex-col min-h-screen items-center pt-24 pb-48 px-6 sm:px-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col items-center w-full max-w-2xl text-center mb-16 relative">
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-black mb-2 tracking-tight">Flood Forecasts</h1>
        {lastUpdated && (
          <div className="text-sm font-medium text-black/80 font-mono mt-2 mb-6">
            Last Forecast: {lastUpdated}
          </div>
        )}
        <div className="relative w-full px-4 sm:px-0">
          <input 
            type="text" 
            value={searchValue}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full border-2 border-black rounded-full px-6 py-4 text-base font-medium outline-none focus:ring-2 focus:ring-blue-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white text-center relative z-10"
          />
          {!searchValue && (
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-20 text-zinc-400 text-base font-medium">
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
        
        <button 
          onClick={handleGeolocation}
          disabled={isLocating}
          className="mt-4 text-blue-600 underline underline-offset-4 decoration-1 text-sm font-medium hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLocating ? 'Locating...' : 'my current location'}
        </button>

        <div className="flex gap-4 mt-8 flex-wrap justify-center">
          {['ALL', 'HIGH RISK', 'MODERATE RISK', 'SAFE'].map((filterType) => {
            const count = filterCounts[filterType as keyof typeof filterCounts];
            const isDisabled = filterType !== 'ALL' && count === 0;
            return (
              <button
                key={filterType}
                onClick={() => !isDisabled && handleSetStatusFilter(filterType)}
                disabled={isDisabled}
                className={`flex items-center gap-2 border-2 border-black font-bold px-4 py-2 text-sm rounded-lg transition-colors ${statusFilter === filterType ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'} ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {filterType === 'ALL' ? 'All' : filterType === 'HIGH RISK' ? 'High Risk' : filterType === 'MODERATE RISK' ? 'Moderate Risk' : 'Safe'}
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusFilter === filterType ? 'bg-white/20 text-white' : 'bg-black/10 text-black'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`w-full transition-opacity duration-200 ${isTransitioning ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {!isBulkLoaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
            {[...Array(6)].map((_, i) => (
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
                    setStatusFilter('ALL'); 
                  });
                }}
                className="border-2 border-black bg-black text-white font-bold px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
              >
                Clear Search & Filters
              </button>
            </div>
          </div>
        ) : (
          <VirtualizedGrid 
            lgas={finalLgas}
            bulkPredictions={bulkPredictions}
            isBulkLoaded={isBulkLoaded}
          />
        )}
      </div>
    </div>
  );
}
