"use client";

import React, { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { usePathname } from "next/navigation";

const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isRendered, setIsRendered] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Start fading out after 500ms to make it extremely snappy
    const timer1 = setTimeout(() => {
      setIsVisible(false);
    }, 500);

    // Completely remove from DOM after 1000ms
    const timer2 = setTimeout(() => {
      setIsRendered(false);
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []); // Run ONLY once on initial site load, not on every page transition!

  if (!isRendered) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer rotating dashed ring */}
        <div className="absolute w-32 h-32 rounded-full border-[3px] border-dashed border-[#ff6600]/40 animate-[spin_4s_linear_infinite]" />
        
        {/* Inner rotating solid ring */}
        <div className="absolute w-24 h-24 rounded-full border-t-[3px] border-b-[3px] border-[#1a1a1a] animate-[spin_1.5s_linear_infinite_reverse]" />
        
        {/* Center Logo/Icon */}
        <div className="relative w-16 h-16 bg-[#ff6600] rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,102,0,0.5)] animate-pulse">
          <Zap size={32} fill="white" />
        </div>
      </div>
      
      <div className="mt-10 text-center">
        <h2 className="text-3xl font-extrabold tracking-widest text-[#1a1a1a] uppercase">
          Hyder <span className="text-[#ff6600]">Traders</span>
        </h2>
        <p className="mt-3 text-xs text-gray-500 font-bold tracking-[0.25em] uppercase">
          Powering a Greener Tomorrow
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
