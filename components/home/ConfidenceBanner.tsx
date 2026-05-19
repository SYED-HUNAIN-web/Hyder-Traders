"use client";

import React from "react";
import Container from "../shared/Container";

const ConfidenceBanner = () => {
  return (
    <section className="py-2">
      <Container>
        <div className="relative bg-[#ff6600] rounded-2xl p-6 md:p-8 overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-black/10">
          {/* Text Content */}
          <div className="z-10 text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-1 drop-shadow-sm">
              BUY WITH CONFIDENCE
            </h2>
            <p className="text-white/90 text-sm md:text-base font-semibold tracking-wide">
              Best Prices and 7-Day Return Policy
            </p>
          </div>

          {/* Premium Sticker Badge */}
          <div className="relative z-20 flex-shrink-0 transform rotate-6 hover:rotate-0 transition-transform duration-500 cursor-pointer">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-yellow-300 via-[#ff6600] to-orange-700 rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-4 border-white relative overflow-hidden group">
              {/* Glossy Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10" />
              
              <div className="text-center px-3 z-10">
                <span className="block text-white font-black text-[10px] md:text-xs leading-none uppercase tracking-tighter drop-shadow-md">
                  100% AUTHENTIC<br/>
                  <span className="text-yellow-200">GUARANTEED</span>
                </span>
              </div>
              
              {/* Outer Glow */}
              <div className="absolute inset-0 rounded-full border border-white/40" />
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/5 rounded-full blur-2xl" />
        </div>
      </Container>
    </section>
  );
};

export default ConfidenceBanner;
