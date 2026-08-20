import React from 'react';

interface TimeBadgesProps {
  risk_24h?: number;
  risk_48h?: number;
  risk_72h?: number;
}

const getBadgeStyles = (score: number | undefined) => {
  if (score === undefined || score === null) return 'bg-zinc-800 text-zinc-400 border-zinc-600 border-2 border-b-4'; // Fallback
  if (score >= 0.904) return 'bg-red-500 text-white border-red-900 border-2 border-b-4';
  if (score >= 0.600) return 'bg-yellow-400 text-black border-yellow-900 border-2 border-b-4';
  return 'bg-green-100 text-green-900 border-green-800 border-2 border-b-4';
};

const formatPercentage = (score: number | undefined) => {
  if (score === undefined || score === null) return '--%';
  return `${Math.round(score * 100)}%`;
};

export default function TimeBadges({ risk_24h, risk_48h, risk_72h }: TimeBadgesProps) {
  return (
    <div className="flex flex-row gap-2 mt-3 flex-wrap pointer-events-auto">
      <span className={`px-2 py-0.5 rounded font-mono text-[10px] sm:text-xs font-bold whitespace-nowrap ${getBadgeStyles(risk_24h)}`}>
        24H: {formatPercentage(risk_24h)}
      </span>
      <span className={`px-2 py-0.5 rounded font-mono text-[10px] sm:text-xs font-bold whitespace-nowrap ${getBadgeStyles(risk_48h)}`}>
        48H: {formatPercentage(risk_48h)}
      </span>
      <span className={`px-2 py-0.5 rounded font-mono text-[10px] sm:text-xs font-bold whitespace-nowrap ${getBadgeStyles(risk_72h)}`}>
        72H: {formatPercentage(risk_72h)}
      </span>
    </div>
  );
}
