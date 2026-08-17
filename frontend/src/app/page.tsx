"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function TypewriterHeading() {
  const fullText = "Flood Forecast ML";
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (length < fullText.length) {
      const timeout = setTimeout(() => {
        setLength(l => l + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [length]);

  const p1 = fullText.slice(0, 6).slice(0, Math.min(length, 6)); 
  const p2 = length > 6 ? fullText.slice(6, 14).slice(0, Math.min(length - 6, 8)) : ""; 
  const p3 = length > 14 ? fullText.slice(14).slice(0, length - 14) : ""; 

  return (
    <div className="relative w-full flex flex-col items-center justify-center text-center">
      {/* Hidden placeholder to prevent layout shift */}
      <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-transparent leading-[1.1] tracking-tighter select-none pointer-events-none w-full">
        Flood <span className="text-transparent">Forecast</span> ML
      </h1>

      {/* Visible typewriter text */}
      <h1 className="absolute top-0 left-1/2 -translate-x-1/2 text-3xl sm:text-5xl lg:text-7xl font-black text-black leading-[1.1] tracking-tighter w-full">
        {p1}
        <span className="text-blue-600">{p2}</span>
        {p3}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
          className="inline-block w-[0.25em] h-[0.8em] bg-blue-600 ml-1 sm:ml-2 align-baseline"
        />
      </h1>
    </div>
  );
}

const blocks = [
  {
    num: "01",
    title: "INTRODUCTION: DEFINING THE PROBLEM",
    text: "Flooding remains one of the most devastating natural disasters globally, causing massive economic loss and displacement. The core issue lies in the unpredictable nature of sudden climatic shifts. By building a robust ML pipeline, we aim to transition from reactive disaster management to proactive early warning systems, predicting events before they unfold.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
        {/* River flow chart / topological lines */}
        <motion.path d="M10 50 Q 30 20 50 50 T 90 50" stroke="black" strokeWidth="4" fill="none" strokeLinecap="round" variants={{ hover: { pathLength: [0, 1], transition: { duration: 1.5, ease: "easeInOut" } } }} />
        <motion.path d="M10 65 Q 30 35 50 65 T 90 65" stroke="black" strokeWidth="3" strokeDasharray="6 6" fill="none" strokeLinecap="round" variants={{ hover: { x: [0, -10, 0], transition: { duration: 2, repeat: Infinity } } }} />
        <motion.circle cx="50" cy="50" r="6" fill="#2563eb" variants={{ hover: { scale: [1, 1.5, 1], transition: { duration: 1, repeat: Infinity } } }} />
      </svg>
    )
  },
  {
    num: "02",
    title: "SOLUTION APPROACH: GETTING THE TARGET",
    text: "Our primary objective is to predict the likelihood of a flood event within a 7-day window. We approach this as a supervised binary classification problem. The target variable is derived from historical flood impact records, carefully aligned with leading meteorological indicators to train the model on preceding conditions.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
        {/* Target crosshair / radar */}
        <circle cx="50" cy="50" r="35" stroke="black" strokeWidth="4" strokeDasharray="8 8" />
        <circle cx="50" cy="50" r="15" stroke="black" strokeWidth="4" />
        <motion.circle cx="50" cy="50" r="6" fill="#2563eb" variants={{ hover: { scale: [1, 2, 1], opacity: [1, 0.5, 1], transition: { duration: 1.5, repeat: Infinity } } }} />
        <motion.line x1="50" y1="5" x2="50" y2="95" stroke="black" strokeWidth="2" variants={{ hover: { rotate: 90, transition: { duration: 2, ease: "linear", repeat: Infinity } } }} style={{ originX: '50px', originY: '50px' }} />
        <motion.line x1="5" y1="50" x2="95" y2="50" stroke="black" strokeWidth="2" variants={{ hover: { rotate: 90, transition: { duration: 2, ease: "linear", repeat: Infinity } } }} style={{ originX: '50px', originY: '50px' }} />
      </svg>
    )
  },
  {
    num: "03",
    title: "DATA IS ALL YOU NEED: DATA COLLECTION AND CLEANING",
    text: "We sourced decades of climate data, including daily precipitation, soil moisture indexes, and upstream river discharge rates. The cleaning process involved aggressive imputation of missing values, aligning timestamps across multiple asynchronous sensors, and normalizing topographical datasets into a unified grid format.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
        {/* Satellite nodes / Database cylinders */}
        <motion.rect x="20" y="20" width="60" height="15" rx="4" stroke="black" strokeWidth="4" fill="white" variants={{ hover: { y: -5, transition: { duration: 0.3 } } }} />
        <motion.rect x="20" y="45" width="60" height="15" rx="4" stroke="black" strokeWidth="4" fill="white" variants={{ hover: { y: 0, transition: { duration: 0.3 } } }} />
        <motion.rect x="20" y="70" width="60" height="15" rx="4" stroke="black" strokeWidth="4" fill="white" variants={{ hover: { y: 5, transition: { duration: 0.3 } } }} />
        <line x1="50" y1="35" x2="50" y2="45" stroke="black" strokeWidth="4" />
        <line x1="50" y1="60" x2="50" y2="70" stroke="black" strokeWidth="4" />
        <motion.circle cx="80" cy="52" r="3" fill="#2563eb" variants={{ hover: { opacity: [0, 1, 0], transition: { duration: 0.8, repeat: Infinity } } }} />
      </svg>
    )
  },
  {
    num: "04",
    title: "TRIAL SO GOOD, THEN YOU USE IT: FEATURE ENGINEERING",
    text: "Raw data rarely tells the whole story. We engineered synthetic features such as 7-day cumulative rainfall and rolling soil saturation ratios. Crucially, we applied SMOTE (Synthetic Minority Over-sampling Technique) to address class imbalance, ensuring the model doesn't ignore rare but catastrophic flood events.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
        {/* Gears / Transformation */}
        <motion.circle cx="35" cy="50" r="20" stroke="black" strokeWidth="4" strokeDasharray="8 8" fill="none" variants={{ hover: { rotate: 360, transition: { duration: 4, ease: "linear", repeat: Infinity } } }} style={{ originX: '35px', originY: '50px' }} />
        <motion.circle cx="70" cy="50" r="12" stroke="black" strokeWidth="4" strokeDasharray="6 6" fill="none" variants={{ hover: { rotate: -360, transition: { duration: 3, ease: "linear", repeat: Infinity } } }} style={{ originX: '70px', originY: '50px' }} />
        <path d="M5 50 L15 50" stroke="black" strokeWidth="4" strokeLinecap="round" />
        <path d="M95 50 L85 50" stroke="black" strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
  },
  {
    num: "05",
    title: "MAKING OF THE TEAM: MODEL SELECTION AND TRAINING",
    text: "We benchmarked three distinct algorithms: Logistic Regression (as a baseline), Random Forest (for robust nonlinear boundaries), and XGBoost (for aggressive sequential error correction). Models were trained using k-fold cross-validation to prevent overfitting on specific storm seasons.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
        {/* Network / Branching tree */}
        <circle cx="50" cy="20" r="8" stroke="black" strokeWidth="4" fill="white" />
        <motion.circle cx="20" cy="80" r="8" stroke="black" strokeWidth="4" fill="white" variants={{ hover: { fill: "#2563eb", transition: { duration: 0.3 } } }} />
        <motion.circle cx="50" cy="80" r="8" stroke="black" strokeWidth="4" fill="white" variants={{ hover: { fill: "#2563eb", transition: { duration: 0.3 } } }} />
        <motion.circle cx="80" cy="80" r="8" stroke="black" strokeWidth="4" fill="white" variants={{ hover: { fill: "#2563eb", transition: { duration: 0.3 } } }} />
        <path d="M44 26 L26 74" stroke="black" strokeWidth="4" />
        <path d="M50 28 L50 72" stroke="black" strokeWidth="4" />
        <path d="M56 26 L74 74" stroke="black" strokeWidth="4" />
      </svg>
    )
  },
  {
    num: "06",
    title: "MODEL EVALUATION",
    text: "Accuracy alone is misleading for imbalanced datasets. We focused heavily on Precision-Recall AUC and the F1-score. XGBoost emerged as the champion, achieving an F1-score of 0.88, striking the optimal balance between catching genuine threats and minimizing false alarms.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
        {/* Bar chart / metrics */}
        <motion.rect x="15" y="60" width="15" height="30" stroke="black" strokeWidth="4" fill="white" variants={{ hover: { height: 50, y: -20, fill: "#2563eb", transition: { duration: 0.5 } } }} />
        <motion.rect x="42.5" y="40" width="15" height="50" stroke="black" strokeWidth="4" fill="white" variants={{ hover: { height: 70, y: -20, fill: "#2563eb", transition: { duration: 0.5, delay: 0.1 } } }} />
        <motion.rect x="70" y="20" width="15" height="70" stroke="black" strokeWidth="4" fill="white" variants={{ hover: { height: 90, y: -20, fill: "#2563eb", transition: { duration: 0.5, delay: 0.2 } } }} />
        <path d="M5 90 L95 90" stroke="black" strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
  },
  {
    num: "07",
    title: "IT ALL CAME TOGETHER",
    text: "The final model was exported and wrapped into a lightweight FastAPI backend. This Next.js frontend interacts directly with those endpoints, providing a seamless, real-time dashboard that visually maps the ML inferences for immediate human action.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
        {/* Puzzle / Connection */}
        <motion.path d="M20 50 L40 50 L40 30 L60 30 L60 50 L80 50" stroke="black" strokeWidth="6" fill="none" strokeLinejoin="round" variants={{ hover: { stroke: "#2563eb", pathLength: [0, 1], transition: { duration: 1 } } }} />
        <circle cx="20" cy="50" r="6" fill="black" />
        <circle cx="80" cy="50" r="6" fill="black" />
      </svg>
    )
  },
  {
    num: "08",
    title: "THIS IS ONLY THE BEGINNING: THE FUTURE",
    text: "Our roadmap includes integrating real-time satellite imagery APIs, expanding the topological grid to neighboring regions, and implementing a reinforcement learning module that continuously adapts to changing climate patterns over time.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
        {/* Forward arrow / Expansion */}
        <motion.path d="M20 50 L70 50 M50 30 L70 50 L50 70" stroke="black" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" variants={{ hover: { x: 10, stroke: "#2563eb", transition: { duration: 0.3, yoyo: Infinity } } }} />
        <circle cx="85" cy="50" r="4" fill="#2563eb" />
      </svg>
    )
  }
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-0">
      
      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-8 min-h-[60vh] mb-24 z-10 relative">
        
        <TypewriterHeading />

        {/* Badge & Arrow directly beneath heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 2, duration: 0.5 }} 
          className="flex flex-row items-center justify-center gap-3 sm:gap-4 mt-8 lg:mt-12"
        >
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse shrink-0">
             <path d="M10 10 Q 10 70 80 80" stroke="black" strokeWidth="4" fill="none" strokeLinecap="round" />
             <path d="M60 60 L85 82 L55 95" stroke="black" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-black leading-[1.1] text-left">
            a 3mtt<br className="block sm:hidden"/> capstone project
          </span>
        </motion.div>

        {/* Scroll link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 2, duration: 0.5 }} 
          className="pt-8 w-full flex justify-center"
        >
          <button 
            onClick={() => document.getElementById('technical-stuff')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-blue-600 font-medium text-base sm:text-lg lg:text-xl border-b-[1.5px] border-blue-600 pb-1 hover:text-blue-800 transition-colors bg-transparent"
          >
            Scroll to read the technical stuff
          </button>
        </motion.div>
        
      </section>

      {/* Technical Writeup Section */}
      <section id="technical-stuff" className="flex flex-col gap-8 sm:gap-12 w-full pt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {blocks.map((block, idx) => (
          <motion.div 
            key={idx}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
            }}
            className={`flex flex-col ${idx % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-16 w-full`}
          >
            {/* Card Content */}
            <div className="flex-1 w-full relative group max-w-full">
              <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform duration-300 group-hover:-translate-y-2 group-hover:-translate-x-2 group-hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-full">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl sm:text-5xl font-black text-blue-600">{block.num}</span>
                  <div className="h-1 flex-1 bg-black rounded-full"></div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-black mb-6 uppercase tracking-tight leading-tight">
                  {block.title}
                </h2>
                <p className="text-base sm:text-lg text-black font-medium leading-relaxed">
                  {block.text}
                </p>
              </div>
            </div>

            {/* SVG Visual */}
            <div className="flex-1 w-full flex justify-center items-center min-h-[250px] sm:min-h-[300px]">
              <motion.div whileHover="hover" className="w-full h-full flex justify-center items-center">
                {block.svg}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Footer Section */}
      <footer className="w-full bg-black text-white border-t-2 border-black py-12 px-6 text-center space-y-6 mt-32 relative overflow-hidden flex flex-col items-center justify-center">
        
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 relative z-40">
           <a href="#" className="border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-full px-6 sm:px-8 py-2 sm:py-3 bg-black text-white font-bold text-sm sm:text-base tracking-wide hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all">
             LinkedIn
           </a>
           <a href="#" className="border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-full px-6 sm:px-8 py-2 sm:py-3 bg-black text-white font-bold text-sm sm:text-base tracking-wide hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all">
             Instagram
           </a>
        </div>

        <div className="border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] rounded-full px-6 py-2 inline-block bg-black text-white font-bold text-sm sm:text-base tracking-widest uppercase relative z-40 mt-8 mb-4">
          a 3mtt capstone project
        </div>

        {/* Blueprint Marquee Banner */}
        <div className="w-full flex overflow-hidden whitespace-nowrap opacity-60 relative z-20 mt-8 pt-4 border-y-2 border-white border-dashed">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          >
            <div className="flex items-center gap-12 sm:gap-16 pr-12 sm:pr-16">
              {[...Array(4)].map((_, i) => (
                 <span key={i} className="text-5xl sm:text-7xl lg:text-[8rem] font-black tracking-tighter uppercase select-none" style={{ WebkitTextStroke: '2px white', color: 'transparent' }}>
                    FLOOD FORECAST ML
                 </span>
              ))}
            </div>
            <div className="flex items-center gap-12 sm:gap-16 pr-12 sm:pr-16">
              {[...Array(4)].map((_, i) => (
                 <span key={i} className="text-5xl sm:text-7xl lg:text-[8rem] font-black tracking-tighter uppercase select-none" style={{ WebkitTextStroke: '2px white', color: 'transparent' }}>
                    FLOOD FORECAST ML
                 </span>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
