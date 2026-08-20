"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const blocks = [
  {
    num: "01",
    title: "Introduction | Defining the Problem",
    text: "Predicting floods isn't just about knowing when it's going to rain. It's about understanding how that rain interacts with the ground, the infrastructure, and local river systems. I started building Flood Forecast ML because I wanted to move away from reactive disaster response and see if we could actually process environmental data fast enough to predict these events before they get out of hand. But to do that, I first had to figure out how to teach a model what a flood actually looks like on paper.",
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
    text: "That turned out to be the biggest hurdle right out of the gate—figuring out our \"ground truth.\" We don't have perfect, historical flood logs for every local government area in Nigeria. To get around this, I used satellite-derived data from SFED and built a proxy target using Return Periods (RP) and Annual Exceedance Probabilities (AEP). It required a lot of data wrangling, but it finally gave the model a solid, objective target to learn from. Of course, having a target is useless without the underlying weather data, which led me straight into my next major headache.",
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
    title: "Data Pipeline | Dealing with APIs and Limits",
    text: "Pulling historical and forecast weather telemetry for over 700 communities sounds straightforward until you hit API rate limits. Watching a script run for hours only to crash halfway through because of a timeout from Open-Meteo is incredibly frustrating. I had to rewrite the backend pipeline to be much more resilient—adding exponential backoffs, chunking the requests, and saving checkpoints to Supabase so a network blip wouldn't force me to start over from scratch. Once the data was safely flowing, I quickly realized that raw numbers weren't going to be enough.",
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
    title: "Feature Engineering | Modeling How Water Behaves",
    text: "Feeding basic rainfall totals into a model doesn't work well because the ground doesn't hold water forever. A heavy storm yesterday is a much bigger risk than a heavy storm three weeks ago that has already drained. I spent a lot of time engineering features to account for this, like soil moisture velocity and decaying precipitation indexes. It was really about teaching the model how the environment naturally retains and loses water over time. With these complex hydrological features in place, I needed an algorithm that could actually make sense of them.",
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
    title: "Building the Brain | Why an Ensemble?",
    text: "Because weather is chaotic, no single algorithm handles all its edge cases perfectly. Instead of trying to force everything through one model, I set up a Stacking Ensemble. By combining XGBoost, Random Forest, and Decision Trees with a Soft Voting Classifier, the models essentially cross-validate each other. It made the predictions much more stable and reliable across different types of terrain. But building a stable model is only part of the equation; I still had to prove it wasn't just blindly guessing.",
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
    title: "Evaluation & Interpretability | The Right Metrics",
    text: "In flood prediction, standard accuracy is dangerously misleading. Out of over 13,000 evaluation samples in my dataset, only 375 were actual floods. A model that just guesses \"Safe\" every single time would look highly accurate but be completely useless. I focused heavily on the Precision-Recall curve (PR-AUC) and tuned my decision threshold to 0.904, which let me catch over 70% of actual floods while keeping false alarms low. Looking at the SHAP values also confirmed the model was making decisions based on the right factors—like AEP and topographic wetness—rather than just random noise. With a model I could finally trust, the last step was getting it out of my notebook and onto the web.",
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
    title: "Production | Bringing It Online",
    text: "Getting the code working locally was great, but the goal was always a live tool. I hooked the machine learning core up to a FastAPI backend, managed the database with Supabase, and built the interface using Next.js. Navigating free-tier server limits and optimizing the UI so it wouldn't lag under heavy data loads was a massive challenge. But seeing it finally run—calculating 24, 48, and 72-hour flood risk horizons across the country in milliseconds—made all the debugging completely worth it.",
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
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          <Link
            href="https://github.com/iblaw/flood-predictorML"
            target="_blank"
            className="border-2 border-black bg-black text-white px-8 py-4 font-bold text-lg hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center"
          >
            View GitHub Repo
          </Link>
          <Link
            href="#"
            className="border-2 border-black bg-white text-black px-8 py-4 font-bold text-lg hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center"
          >
            Watch Demo Video
          </Link>
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

