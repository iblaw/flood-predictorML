"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ForecastCard, { LGA, BFFData } from '../app/forecasts/ForecastCard';
import { Loader2 } from 'lucide-react';

interface ForecastGridProps {
  lgas: LGA[];
  bulkPredictions: Record<string, BFFData>;
  isBulkLoaded: boolean;
}

export default function ForecastGrid({ lgas, bulkPredictions, isBulkLoaded }: ForecastGridProps) {
  const [displayCount, setDisplayCount] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasNextPage = displayCount < lgas.length;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isLoading) {
      setIsLoading(true);
      // Simulate network request for the BFF getPaginatedForecasts feel
      setTimeout(() => {
        setDisplayCount(prev => Math.min(prev + 50, lgas.length));
        setIsLoading(false);
      }, 500); // 500ms delay to show the neo-brutalist loader
    }
  }, [hasNextPage, isLoading, lgas.length]);

  useEffect(() => {
    // Reset count when lgas list changes (e.g. searching or filtering)
    setDisplayCount(50);
  }, [lgas]);

  useEffect(() => {
    const currentSentinel = sentinelRef.current;
    if (!currentSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '100px' } // Pre-load slightly before hitting the absolute bottom
    );

    observer.observe(currentSentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const displayedLgas = lgas.slice(0, displayCount);

  return (
    <div className="w-full pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10 xl:gap-12 mt-12 w-full">
        {displayedLgas.map((lga, index) => (
          <div key={lga.name + index} className="w-full">
            <ForecastCard
              lga={lga}
              bulkData={bulkPredictions[lga.name]}
              isBulkLoaded={isBulkLoaded}
            />
          </div>
        ))}
        {hasNextPage && (
          <div ref={sentinelRef} className="h-20 w-full col-span-full flex flex-col items-center justify-center gap-2 mt-8">
            <Loader2 className="w-8 h-8 text-black animate-spin" />
            <span className="font-mono font-bold text-xs uppercase tracking-widest text-black">Loading more communities...</span>
          </div>
        )}
      </div>
    </div>
  );
}
