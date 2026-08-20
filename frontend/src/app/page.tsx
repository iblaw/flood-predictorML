"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

const blocks = [
  {
    num: "01",
    title: "Introduction | Defining the Problem",
    text: "There is a terrifying quiet to how floods begin. Long before rivers overflow their banks, an invisible chain reaction is already underway: soil saturation peaks, upstream basins accumulate pressure, and heavy downpours overwhelm urban drainage. Too often, communities only realize the danger when the water is already at their doorstep. Flood Forecast ML was born out of a desire to break that cycle of reactive panic. I wanted to build a system that doesn't just watch the weather happen, but decodes the hidden physics of the land to predict disasters before they strike.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
        <motion.path d="M10 50 Q 30 20 50 50 T 90 50" stroke="black" strokeWidth="4" fill="none" strokeLinecap="round" variants={{ hover: { pathLength: [0, 1], transition: { duration: 1.5, ease: "easeInOut" } } }} />
        <motion.path d="M10 65 Q 30 35 50 65 T 90 65" stroke="black" strokeWidth="3" strokeDasharray="6 6" fill="none" strokeLinecap="round" variants={{ hover: { x: [0, -10, 0], transition: { duration: 2, repeat: Infinity } } }} />
        <motion.circle cx="50" cy="50" r="6" fill="#2563eb" variants={{ hover: { scale: [1, 1.5, 1], transition: { duration: 1, repeat: Infinity } } }} />
      </svg>
    )
  },
  {
    num: "02",
    title: "Solution Approach | Framing the Target",
    text: "The hardest part of machine learning isn't writing the algorithm; it's defining the ground truth. In disaster forecasting, reliable historical labels across hundreds of local government areas are scarce. To solve this, I leaned on satellite-derived datasets from SFED (Standard Flood Extent Depiction) and engineered a robust proxy target framework utilizing Return Periods (RP) and Annual Exceedance Probabilities (AEP). Transforming chaotic geospatial realities into a clean classification target required aggressive data structuring and domain-specific modeling.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
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
    title: "Data Pipeline | Surviving Rate-Limiting Hell",
    text: "Scale brings chaos. Merging spatial boundaries, static LGA lookups, and dynamic Open-Meteo weather telemetry for over 700 communities meant processing massive volumes of time-series data. And then came the rate limits—API timeouts that slammed the door mid-execution and threatened to tank the pipeline. Building this required resilience: implementing smart API fallbacks, chunked background workers, and automated database checkpoints so that an external network drop could never compromise core data integrity.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
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
    title: "Feature Engineering | Teaching the Model Nature's Memory",
    text: "Raw weather sums lie to you. Nature has a memory, and it forgets. Yesterday’s storm stresses saturated earth entirely differently than a heavy downpour from three weeks ago that has long since evaporated or drained. To capture this, I engineered temporal features—prioritizing recent precipitation windows, calculating soil moisture velocity, and leveraging Annual Exceedance Probabilities (AEP). By giving the model a mathematical sense of retention and hydrological time, it stopped treating weather data as flat numbers and started understanding how land actually holds water.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
        <motion.circle cx="35" cy="50" r="20" stroke="black" strokeWidth="4" strokeDasharray="8 8" fill="none" variants={{ hover: { rotate: 360, transition: { duration: 4, ease: "linear", repeat: Infinity } } }} style={{ originX: '35px', originY: '50px' }} />
        <motion.circle cx="70" cy="50" r="12" stroke="black" strokeWidth="4" strokeDasharray="6 6" fill="none" variants={{ hover: { rotate: -360, transition: { duration: 3, ease: "linear", repeat: Infinity } } }} style={{ originX: '70px', originY: '50px' }} />
        <path d="M5 50 L15 50" stroke="black" strokeWidth="4" strokeLinecap="round" />
        <path d="M95 50 L85 50" stroke="black" strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
  },
  {
    num: "05",
    title: "Building the Brain | Why Ensembling Beats a Single Model",
    text: "Natural systems are inherently non-linear, chaotic, and resistant to simple formulas. Forcing something as unpredictable as environmental hydrology through a single mathematical model is a recipe for blind spots. Instead, I built a Stacking Ensemble—blending XGBoost, Random Forest, and Decision Trees under a Soft Voting Classifier. This multi-model approach allows different algorithmic perspectives to debate and cross-validate complex patterns, mirroring how a panel of experts reaches a consensus in the real world.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
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
    title: "Evaluation & Interpretability | Prioritizing What Actually Matters",
    text: "Chasing vanity metrics like 97% overall accuracy in imbalanced classification is a trap. Out of 13,172 evaluation samples, only 375 represented actual flood events; a lazy model predicting \"Safe\" everywhere would look brilliant on paper while missing disasters. I prioritized PR-AUC optimization, tuning the decision threshold to 0.904 to successfully capture over 70% of true flood risks without drowning communities in false alarms. Coupled with SHAP (SHapley Additive exPlanations) analysis, the model's feature importance proved it wasn't guessing: features like AEP and topographic wetness indexes (TWI_Proxy) dominated, confirming the system genuinely understands physical terrain and accumulation pathways.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
        <motion.rect x="15" y="60" width="15" height="30" stroke="black" strokeWidth="4" fill="white" variants={{ hover: { height: 50, y: -20, fill: "#2563eb", transition: { duration: 0.5 } } }} />
        <motion.rect x="42.5" y="40" width="15" height="50" stroke="black" strokeWidth="4" fill="white" variants={{ hover: { height: 70, y: -20, fill: "#2563eb", transition: { duration: 0.5, delay: 0.1 } } }} />
        <motion.rect x="70" y="20" width="15" height="70" stroke="black" strokeWidth="4" fill="white" variants={{ hover: { height: 90, y: -20, fill: "#2563eb", transition: { duration: 0.5, delay: 0.2 } } }} />
        <path d="M5 90 L95 90" stroke="black" strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
  },
  {
    num: "07",
    title: "Production & Product | From Local Script to Live System",
    text: "Moving from a local Jupyter notebook to a production-grade application is where the real engineering begins. Wrapping this machine learning core into a lightning-fast Next.js frontend, powered by a FastAPI asynchronous backend and secured via Supabase, brought everything together. Navigating free-tier server constraints, deployment hurdles, and UI rendering optimizations tested every limit. Seeing it live—instantly calculating flood risk across Nigeria in milliseconds—turned an abstract code base into a powerful, working tool with real-world impact.",
    svg: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-[200px] overflow-visible">
        <motion.path d="M20 50 L40 50 L40 30 L60 30 L60 50 L80 50" stroke="black" strokeWidth="6" fill="none" strokeLinejoin="round" variants={{ hover: { stroke: "#2563eb", pathLength: [0, 1], transition: { duration: 1 } } }} />
        <circle cx="20" cy="50" r="6" fill="black" />
        <circle cx="80" cy="50" r="6" fill="black" />
      </svg>
    )
  }
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-0">
      <section className="w-full max-w-5xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-8 min-h-[60vh] mb-24 z-10 relative">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl lg:text-[5.5rem] font-black text-black leading-[1] tracking-tighter w-full"
        >
          Flood <span className="text-blue-600">Forecast</span> ML
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1, duration: 0.3 }} 
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

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-700 mt-6 font-medium"
        >
          An AI-powered early warning system leveraging geospatial telemetry and machine learning to preemptively predict flood risks across vulnerable Nigerian communities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mt-8 flex-wrap justify-center"
        >
          <Link
            href="https://github.com/iblaw/flood-predictorML"
            target="_blank"
            className="border-2 border-black bg-black text-white px-8 py-4 font-bold text-lg hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center whitespace-nowrap"
          >
            View GitHub Repo
          </Link>
          <Link
            href="#"
            className="border-2 border-black bg-white text-black px-8 py-4 font-bold text-lg hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center whitespace-nowrap"
          >
            Watch Demo Video
          </Link>
          <a
            href="https://colab.research.google.com/drive/1gtRA5ohLVmmIgA07jwwrTtQZhmb32uFZ?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-black bg-orange-400 text-black px-8 py-4 font-bold text-lg font-mono uppercase tracking-wide hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <BookOpen className="w-5 h-5" />
            View Colab Notebook
          </a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.4, duration: 0.3 }} 
          className="pt-12 w-full flex justify-center"
        >
          <button 
            onClick={() => document.getElementById('technical-stuff')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex flex-col items-center gap-2 text-blue-600 font-medium text-base sm:text-lg lg:text-xl hover:text-blue-800 transition-colors bg-transparent"
          >
            <span className="border-b-[1.5px] border-blue-600 pb-1 group-hover:border-blue-800 transition-colors">Scroll to read about the project</span>
            <motion.svg 
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </motion.svg>
          </button>
        </motion.div>
      </section>

      {/* Renders technical methodology content blocks */}
      <section id="technical-stuff" className="flex flex-col gap-8 sm:gap-12 w-full pt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
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
            {/* Renders content block text card */}
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

            {/* Renders interactive SVG illustration */}
            <div className="flex-1 w-full flex justify-center items-center min-h-[250px] sm:min-h-[300px]">
              <motion.div whileHover="hover" className="w-full h-full flex justify-center items-center">
                {block.svg}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}

