"use client";

import React from 'react';

interface TimeBadgesProps {
  risk24: number;
  risk48: number;
  risk72: number;
}

export default function TimeBadges({ risk24, risk48, risk72 }: TimeBadgesProps) {
  const getBadgeStyle = (score: number) => {
    if (score >= 0.904) return "bg-red-500 text-white border-red-900 border-2 border-b-4";
    if (score >= 0.600) return "bg-yellow-400 text-black border-yellow-900 border-2 border-b-4";
    return "bg-green-100 text-green-900 border-green-800 border-2 border-b-4";
  };

  const formatScore = (score: number) => `${Math.round(score * 100)}%`;

  return (
    <div className="flex flex-row gap-2 mt-3 z-10 relative pointer-events-none">
      <div className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold font-mono tracking-wider ${getBadgeStyle(risk24)}`}>
        24H: {formatScore(risk24)}
      </div>
      <div className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold font-mono tracking-wider ${getBadgeStyle(risk48)}`}>
        48H: {formatScore(risk48)}
      </div>
      <div className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold font-mono tracking-wider ${getBadgeStyle(risk72)}`}>
        72H: {formatScore(risk72)}
      </div>
    </div>
  );
}
