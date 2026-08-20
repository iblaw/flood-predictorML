"use client";

import React from 'react';
import { motion } from 'framer-motion';

const skills = [
  { name: "Python", width: "100%" },
  { name: "Machine Learning", width: "85%" },
  { name: "Next.js", width: "95%" },
  { name: "Geospatial GIS", width: "75%" },
  { name: "FastAPI", width: "90%" },
  { name: "UI/UX Design", width: "80%" },
];

export default function About() {
  return (
    <div className="flex flex-col min-h-screen pt-20 pb-48 px-6 sm:px-8 max-w-6xl mx-auto w-full">
      <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-black md:text-center tracking-tight mb-12">Meet the Fellow</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-10 sm:gap-y-12 w-full mt-4">
        
        {/* Renders profile image placeholder */}
        <div className="order-2 md:order-none md:col-start-1 md:row-start-1 md:row-span-2">
          <div className="w-full aspect-square bg-black rounded-[2.5rem] sm:rounded-[3rem]"></div>
        </div>

        {/* Renders fellow biography card */}
        <div className="order-1 md:order-none md:col-start-2 md:row-start-1 flex flex-col justify-end">
          <div className="border-2 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white text-xl sm:text-2xl lg:text-[26px] leading-snug font-medium text-black">
            <p>
              Hi there! I am Lawal Ibrahim, a 3MTT NextGen Cohort Fellow specializing in the AI/ML track. This Flood Forecast ML system serves as my capstone project.
            </p>
            <div className="mt-6 flex flex-col gap-4">
              <div>
                <span className="bg-yellow-300 border-2 border-black px-3 py-1 font-mono text-sm font-bold inline-block">
                  Fellow ID: FE/26/5038794255
                </span>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                <a 
                  href="https://www.linkedin.com/in/ibrahim-lawal-83b3623bb?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="border-2 border-black bg-blue-600 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all px-4 py-2 text-sm font-bold inline-block"
                >
                  LinkedIn
                </a>
                <a 
                  href="https://www.instagram.com/miharbileo35/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="border-2 border-black bg-[#E1306C] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all px-4 py-2 text-sm font-bold inline-block"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Renders technical skills metrics */}
        <div className="order-3 md:order-none md:col-start-2 md:row-start-2 flex flex-col justify-start md:mt-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Skill tree</h2>
          <div className="flex flex-col gap-3 sm:gap-4 w-full relative">
            {skills.map((skill, idx) => (
              <div 
                key={idx} 
                className="relative w-full h-8 sm:h-12 flex items-center"
              >
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: skill.width }}
                  transition={{ duration: 1.2, delay: idx * 0.1, ease: "easeOut" }}
                  className="h-full bg-black relative overflow-hidden text-white font-bold text-sm px-4 flex items-center justify-between"
                >
                  <span className="whitespace-nowrap relative z-10 tracking-wide">{skill.name}</span>
                  <span className="whitespace-nowrap relative z-10 text-zinc-400">{skill.width}</span>

                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0 pointer-events-none"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: idx * 0.3 }}
                  />
                </motion.div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
