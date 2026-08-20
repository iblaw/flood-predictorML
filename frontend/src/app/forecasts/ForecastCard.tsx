"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Cloud, Sun, CloudLightning, Loader2, MapPin, Droplets, Mountain, Waves, AlertTriangle, ShieldCheck, Siren, Clock } from 'lucide-react';

export interface LGA {
  name: string;
  rp: number;
  isUrban: number;
  riverDistance: number;
  lat: number;
  lon: number;
  elevation?: number;
}

export interface BFFData {
  tier: string;
  risk_level: number;
  risk_24h?: number;
  risk_48h?: number;
  risk_72h?: number;
  explanation?: string[];
  weather: {
    rainfall_7d: number;
    soil_moisture_7d: number;
    runoff_potential: number;
    elevation?: number;
    weather_code?: number;
    temperature?: number;
  }
}

interface ForecastCardProps {
  lga: LGA;
  bulkData?: BFFData;
  isBulkLoaded?: boolean;
}

/** Converts a raw 0-1 probability into a display label + Tailwind colour classes. */
function riskLabel(value: number | undefined): { label: string; bg: string; text: string } {
  if (value === undefined || value === null) return { label: 'N/A', bg: 'bg-zinc-700', text: 'text-zinc-300' };
  if (value >= 0.7) return { label: 'HIGH', bg: 'bg-red-600', text: 'text-white' };
  if (value >= 0.4) return { label: 'MOD', bg: 'bg-orange-500', text: 'text-white' };
  return { label: 'LOW', bg: 'bg-green-600', text: 'text-white' };
}

export default function ForecastCard({ lga, bulkData, isBulkLoaded }: ForecastCardProps) {
  const [localData, setLocalData] = useState<BFFData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasFetched = React.useRef(false);

  useEffect(() => {
    setMounted(true);
    if (!bulkData && isBulkLoaded && !hasFetched.current) {
      hasFetched.current = true;
      const fetchBFF = async () => {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
          const res = await fetch(`${backendUrl}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: parseFloat(lga.lat.toString()),
              lon: parseFloat(lga.lon.toString()),
              Elevation_m: parseFloat((lga.elevation || 0).toString()),
              Distance_to_River_m: parseFloat(lga.riverDistance.toString()),
              Is_Urban: parseInt(lga.isUrban.toString(), 10),
              RP: parseFloat((lga.rp || 10.0).toString())
            })
          });

          if (!res.ok) throw new Error('Network response was not ok');

          const backendData = await res.json();
          
          if (backendData && backendData.tier) {
            setLocalData(backendData); 
          } else {
            setLocalData({
              tier: "UNAVAILABLE",
              risk_level: 0,
              explanation: [],
              weather: { rainfall_7d: 0, soil_moisture_7d: 0, runoff_potential: 0 }
            });
          }
        } catch (error) {
          console.error("ML Fetch Error:", error);
          setLocalData({
            tier: "UNAVAILABLE",
            risk_level: 0,
            explanation: [],
            weather: { rainfall_7d: 0, soil_moisture_7d: 0, runoff_potential: 0 }
          });
        }
      };

      fetchBFF();
    }
  }, [bulkData, isBulkLoaded, lga]);

  const data = bulkData || localData;
  const isDataMissing = !data;

  // WATERFALL MAX RULE: Find highest risk across 24h, 48h, 72h horizons
  let maxRisk = -1;
  let maxTimeframe = "24H FORECAST";
  let finalTier = "PENDING";

  if (data && data.tier !== "UNAVAILABLE") {
    const horizons = [
      { name: "24H FORECAST", val: data.risk_24h ?? 0 },
      { name: "48H FORECAST", val: data.risk_48h ?? 0 },
      { name: "72H FORECAST", val: data.risk_72h ?? 0 }
    ];

    for (const h of horizons) {
      if (h.val > maxRisk) {
        maxRisk = h.val;
        maxTimeframe = h.name;
      }
    }
    
    // Map maxRisk back to tier (using identical thresholds: 0.7 = HIGH, 0.4 = MODERATE)
    if (maxRisk >= 0.7) finalTier = "HIGH RISK";
    else if (maxRisk >= 0.4) finalTier = "MODERATE RISK";
    else finalTier = "SAFE";
  } else if (data && data.tier === "UNAVAILABLE") {
    finalTier = "UNAVAILABLE";
    maxTimeframe = "ANYTIME";
  }

  const predictionStatus = finalTier;
  const isEvacuation = predictionStatus === "HIGH RISK";
  const isWatch = predictionStatus === "MODERATE RISK";
  const isSafe = predictionStatus === "SAFE";
  const isUnavailable = predictionStatus === "UNAVAILABLE";
  
  const statusText = isDataMissing 
    ? "ANALYZING..." 
    : (isUnavailable ? "UNAVAILABLE" : `${predictionStatus} • ${maxTimeframe}`);

  const rainfall7d = data?.weather?.rainfall_7d || 0;
  const soilMoisture = data?.weather?.soil_moisture_7d || 0;
  const temperature = data?.weather?.temperature || 28.5;
  const weatherCode = data?.weather?.weather_code !== undefined ? data.weather.weather_code : (rainfall7d > 50 ? 65 : 3);
  const elevation = data?.weather?.elevation ?? lga.elevation ?? 0;

  const h24 = riskLabel(data?.risk_24h);
  const h48 = riskLabel(data?.risk_48h);
  const h72 = riskLabel(data?.risk_72h);
  const hasHorizons = data && (data.risk_24h !== undefined || data.risk_48h !== undefined || data.risk_72h !== undefined);

  const getWeatherIcon = (code: number, className: string) => {
    if (code === 0 || code === 1) return <Sun className={className} />;
    if (code === 2 || code === 3) return <Cloud className={className} />;
    if (code >= 51 && code <= 67) return <CloudRain className={className} />;
    if (code >= 95) return <CloudLightning className={className} />;
    return <Cloud className={className} />;
  };

  const getWeatherText = (code: number) => {
    if (code === 0 || code === 1) return "Sunny";
    if (code === 2 || code === 3) return "Cloudy";
    if (code >= 51 && code <= 67) return "Rainy";
    if (code >= 95) return "Storm";
    return "Overcast";
  };

  return (
    <>
      <motion.div 
        onClick={() => setShowModal(true)} 
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="bg-black cursor-pointer text-white rounded-[2rem] p-6 sm:p-8 flex flex-col relative group hover:ring-4 hover:ring-blue-600 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)] h-full gap-5"
      >
        {/* Header: name + status icon */}
        <div className="flex justify-between items-start w-full pointer-events-none">
          <div className="flex flex-col">
            <span className="text-3xl sm:text-4xl font-light tracking-tight">{lga.name}</span>
            <span className={`text-sm sm:text-base font-black tracking-widest mt-2 ${isEvacuation ? 'text-red-400' : isWatch ? 'text-orange-500' : isUnavailable ? 'text-zinc-500' : 'text-green-400'}`}>
              {statusText}
            </span>
          </div>
          <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
            {isEvacuation ? (
              <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                <Siren className="w-12 h-12 sm:w-14 sm:h-14 text-red-500" strokeWidth={2.5} />
              </motion.div>
            ) : isWatch ? (
              <AlertTriangle className="w-12 h-12 sm:w-14 sm:h-14 text-orange-500" strokeWidth={2.5} />
            ) : isSafe ? (
              <ShieldCheck className="w-12 h-12 sm:w-14 sm:h-14 text-green-500" strokeWidth={2.5} />
            ) : (
              <Loader2 className="w-12 h-12 sm:w-14 sm:h-14 text-zinc-500 animate-spin" strokeWidth={2.5} />
            )}
          </div>
        </div>

        {/* Time-horizon risk badge strip — only shown once data has arrived */}
        {!isDataMissing && (
          <div className="pointer-events-none flex items-center gap-2.5 flex-wrap">
            <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
            {hasHorizons ? (
              [{ window: '24h', ...h24 }, { window: '48h', ...h48 }, { window: '72h', ...h72 }].map(({ window, bg, text, label }) => (
                <span key={window} className={`inline-flex items-center gap-1.5 ${bg} ${text} text-xs font-black tracking-widest px-3 py-1 rounded-md shadow-sm`}>
                  {label === 'HIGH' ? <Siren className="w-3.5 h-3.5" /> : label === 'MOD' ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span className="opacity-75">{window}</span>
                  <span>{label}</span>
                </span>
              ))
            ) : (
              ['24h', '48h', '72h'].map(h => (
                <span key={h} className="inline-flex items-center gap-1.5 bg-zinc-800 text-xs font-black tracking-widest px-3 py-1 rounded-md text-zinc-500 shadow-sm">
                  <span className="opacity-75">{h}</span><span>N/A</span>
                </span>
              ))
            )}
          </div>
        )}
        
        {/* Weather summary bar */}
        <div className="mt-auto w-full bg-zinc-900 border-2 border-zinc-700 p-5 rounded-2xl flex justify-between items-center pointer-events-none group-hover:border-zinc-500 transition-colors">
          {isDataMissing ? (
            <div className="flex w-full justify-between items-center py-1">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 animate-pulse"></div>
                <div className="flex flex-col gap-2">
                  <div className="w-12 h-4 bg-zinc-800 rounded animate-pulse"></div>
                  <div className="w-16 h-3 bg-zinc-800 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="w-12 h-4 bg-zinc-800 rounded animate-pulse"></div>
                <div className="w-10 h-3 bg-zinc-800 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                {getWeatherIcon(weatherCode, "w-10 h-10 text-blue-400")}
                <div className="flex flex-col gap-0.5">
                  <span className="text-base font-bold text-white tracking-wide">{temperature}&#176;C</span>
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{getWeatherText(weatherCode)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-base font-bold text-white tracking-wide">{rainfall7d}mm</span>
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">7d Rain</span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {mounted && createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white border-2 border-black rounded-[2rem] p-6 sm:p-8 w-[95%] sm:w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6"
              >
                <div className="flex justify-between items-center border-b-2 border-black pb-4">
                <h2 className="text-3xl font-bold tracking-tight">{lga.name}</h2>
                <span className={`text-xs font-bold tracking-widest px-3 py-1.5 rounded-full ${isEvacuation ? 'bg-red-500 text-white' : isWatch ? 'bg-orange-500 text-white' : isUnavailable ? 'bg-zinc-600 text-white' : 'bg-black text-white'}`}>
                  {statusText}
                </span>
              </div>
              
              <div className="flex flex-col items-center justify-center py-2">
                {isDataMissing ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Loader2 className="w-12 h-12 text-blue-600" />
                  </motion.div>
                ) : (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-2">
                    {getWeatherIcon(weatherCode, "w-16 h-16 text-black")}
                    <span className="font-bold text-xl">{temperature}&#176;C</span>
                  </motion.div>
                )}
              </div>

              {/* Predictive time-horizon panel */}
              {!isDataMissing && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-black" />
                    <h3 className="font-black text-sm tracking-widest uppercase">Predictive Horizon</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { window: '24-Hour', ...h24, raw: data?.risk_24h },
                      { window: '48-Hour', ...h48, raw: data?.risk_48h },
                      { window: '72-Hour', ...h72, raw: data?.risk_72h },
                    ].map(({ window, bg, text, label, raw }) => (
                      <div key={window} className={`flex flex-col items-center justify-center gap-1 ${bg} rounded-xl p-3 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}>
                        <span className={`text-[10px] font-black tracking-widest uppercase ${text} opacity-75`}>{window}</span>
                        <span className={`text-xl font-black ${text}`}>{label}</span>
                        {raw != null && (
                          <span className={`text-[10px] font-mono ${text} opacity-60`}>{(raw * 100).toFixed(0)}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 font-mono text-sm bg-gray-50 border-2 border-black rounded-xl p-4 sm:p-6 shadow-inner">
                {isDataMissing ? (
                  <div className="col-span-1 sm:col-span-2 text-center text-gray-500 py-4 font-sans font-medium">Fetching real-time telemetry...</div>
                ) : (
                  <>
                    <div className="flex flex-col border-b border-gray-300 sm:border-none pb-2 sm:pb-0">
                      <div className="flex items-center gap-2 text-gray-600 mb-1"><Droplets className="w-4 h-4"/> 7-Day Rain</div>
                      <span className="font-bold text-black text-base">{rainfall7d} mm</span>
                    </div>
                    <div className="flex flex-col border-b border-gray-300 sm:border-none pb-2 sm:pb-0">
                      <div className="flex items-center gap-2 text-gray-600 mb-1"><MapPin className="w-4 h-4"/> Soil Moisture</div>
                      <span className="font-bold text-black text-base">{soilMoisture}%</span>
                    </div>
                    <div className="flex flex-col border-b border-gray-300 sm:border-none pb-2 sm:pb-0">
                      <div className="flex items-center gap-2 text-gray-600 mb-1"><Mountain className="w-4 h-4"/> Elevation</div>
                      <span className="font-bold text-black text-base">{elevation} m</span>
                    </div>
                    <div className="flex flex-col border-b border-gray-300 sm:border-none pb-2 sm:pb-0">
                      <div className="flex items-center gap-2 text-gray-600 mb-1"><Waves className="w-4 h-4"/> River Dist.</div>
                      <span className="font-bold text-black text-base">{parseFloat(lga.riverDistance.toFixed(2))} m</span>
                    </div>
                    <div className="flex flex-col pb-2 sm:pb-0">
                      <div className="flex items-center gap-2 text-gray-600 mb-1"><MapPin className="w-4 h-4"/> Is Urban</div>
                      <span className="font-bold text-black text-base">{lga.isUrban === 1 ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex justify-between items-center bg-black text-white p-3 rounded-lg mt-2">
                      <div className="flex items-center gap-2 font-sans font-bold text-xs uppercase tracking-widest">Return Period (RP)</div>
                      <span className="font-bold text-blue-400 text-lg">{lga.rp}</span>
                    </div>
                  </>
                )}
              </div>

              {!isDataMissing && data.explanation && data.explanation.length > 0 && (
                <div className="flex flex-col mt-2">
                  <h3 className="font-bold text-sm tracking-wide mb-3">Why this forecast?</h3>
                  <ul className="flex flex-col gap-3">
                    {data.explanation.map((exp, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`shrink-0 w-2 h-2 mt-1.5 rounded-full ${isEvacuation ? 'bg-red-500' : isWatch ? 'bg-orange-500' : isUnavailable ? 'bg-zinc-400' : 'bg-green-500'}`} />
                        <p className="text-sm font-medium text-black leading-relaxed">{exp}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowModal(false)}
                className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg mt-2 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 shrink-0"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  );
}
