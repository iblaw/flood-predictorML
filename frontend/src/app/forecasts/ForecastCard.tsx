"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Cloud, Sun, CloudLightning, Loader2, MapPin, Droplets, Mountain, Waves, AlertTriangle, ShieldCheck, Siren } from 'lucide-react';

export interface LGA {
  name: string;
  rp: number;
  isUrban: number;
  riverDistance: number;
  lat: number;
  lon: number;
  elevation?: number; // Added in case data has it
}

export interface BFFData {
  tier: string;
  risk_level: number;
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

export default function ForecastCard({ lga, bulkData, isBulkLoaded }: ForecastCardProps) {
  const [data, setData] = useState<BFFData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Sync with bulkData instantly
  useEffect(() => {
    if (bulkData) {
      setData(bulkData);
    } else if (isBulkLoaded) {
      // If bulk is loaded but we have no data, it means it's a custom coordinate not in the dictionary.
      // We must fetch it dynamically.
      fetchBFF();
    }
  }, [bulkData, isBulkLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBFF = async () => {
    if (loading) return;
    setLoading(true);
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
      
      // Strictly check for the 'tier' key that our FastAPI backend returns
      if (backendData && backendData.tier) {
        setData(backendData); 
      } else {
        // Fallback state
        setData({
          tier: "UNAVAILABLE",
          risk_level: 0,
          explanation: [],
          weather: {
            rainfall_7d: 0,
            soil_moisture_7d: 0,
            runoff_potential: 0
          }
        });
      }
    } catch (error) {
      console.error("ML Fetch Error:", error);
      setData({
        tier: "UNAVAILABLE",
        risk_level: 0,
        explanation: [],
        weather: {
          rainfall_7d: 0,
          soil_moisture_7d: 0,
          runoff_potential: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // If we haven't loaded bulk data yet and haven't fetched manually, we are 'LOADING'
  const isDataMissing = !data;

  // Derived properties from BFF data
  const predictionStatus = data?.tier ? data.tier.toUpperCase() : "PENDING";
  const isEvacuation = predictionStatus === "EVACUATION WARNING";
  const isWatch = predictionStatus === "FLOOD WATCH";
  const isSafe = predictionStatus === "SAFE";
  const isUnavailable = predictionStatus === "UNAVAILABLE";
  const statusText = isDataMissing ? "ANALYZING..." : predictionStatus;

  const rainfall7d = data?.weather?.rainfall_7d || 0;
  const soilMoisture = data?.weather?.soil_moisture_7d || 0;
  
  // Synthesize UI values if backend omits them
  const temperature = data?.weather?.temperature || 28.5; // fallback
  const weatherCode = data?.weather?.weather_code !== undefined ? data.weather.weather_code : (rainfall7d > 50 ? 65 : 3);
  const elevation = data?.weather?.elevation ?? lga.elevation ?? 0;

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
        className="bg-black cursor-pointer text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative group hover:ring-4 hover:ring-blue-600 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)] h-auto sm:aspect-square"
      >
        <div className="flex justify-between items-start w-full pointer-events-none mb-8 sm:mb-0">
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-light tracking-tight">{lga.name}</span>
            <span className={`text-xs sm:text-sm font-bold tracking-widest mt-1 ${isEvacuation ? 'text-red-400' : isWatch ? 'text-orange-500' : isUnavailable ? 'text-zinc-500' : 'text-green-400'}`}>
              {statusText}
            </span>
          </div>
          <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 mt-1 ml-2 flex items-center justify-center">
            {isEvacuation ? (
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Siren className="w-10 h-10 sm:w-14 sm:h-14 text-red-500" strokeWidth={2.5} />
              </motion.div>
            ) : isWatch ? (
              <AlertTriangle className="w-10 h-10 sm:w-14 sm:h-14 text-orange-500" strokeWidth={2.5} />
            ) : isSafe ? (
              <ShieldCheck className="w-10 h-10 sm:w-14 sm:h-14 text-green-500" strokeWidth={2.5} />
            ) : (
              <Loader2 className="w-10 h-10 sm:w-14 sm:h-14 text-zinc-500 animate-spin" strokeWidth={2.5} />
            )}
          </div>
        </div>
        
        {/* Inline Weather Details */}
        <div className="w-full bg-zinc-900 border border-zinc-700 p-4 rounded-2xl flex justify-between items-center pointer-events-none group-hover:border-zinc-500 transition-colors">
          {isDataMissing ? (
            <div className="flex w-full justify-between items-center py-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse"></div>
                <div className="flex flex-col gap-2">
                  <div className="w-12 h-4 bg-zinc-800 rounded animate-pulse"></div>
                  <div className="w-16 h-2 bg-zinc-800 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="w-12 h-4 bg-zinc-800 rounded animate-pulse"></div>
                <div className="w-10 h-2 bg-zinc-800 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {getWeatherIcon(weatherCode, "w-8 h-8 text-blue-400")}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{temperature}°C</span>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{getWeatherText(weatherCode)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-white">{rainfall7d}mm</span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">7d Rain</span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
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
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="flex flex-col items-center gap-2"
                  >
                    {getWeatherIcon(weatherCode, "w-16 h-16 text-black")}
                    <span className="font-bold text-xl">{temperature}°C</span>
                  </motion.div>
                )}
              </div>

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
                  <h3 className="font-bold text-sm tracking-wide mb-3">🧠 Why this forecast?</h3>
                  <ul className="flex flex-col gap-3">
                    {data.explanation.map((exp, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`shrink-0 w-2 h-2 mt-1.5 rounded-full ${isEvacuation ? 'bg-red-500' : isWatch ? 'bg-orange-500' : isUnavailable ? 'bg-zinc-400' : 'bg-green-500'}`} />
                        <p className="text-sm font-medium text-black leading-relaxed">
                          {exp}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowModal(false)}
                className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg mt-2 transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 shrink-0"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}