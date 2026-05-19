"use client";

import React from "react";
import Container from "../shared/Container";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="py-6 md:py-10">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Large Banner (Left) */}
          <Link href="/products" className="lg:col-span-8 relative group overflow-hidden rounded-3xl h-[400px] md:h-[600px] shadow-xl block cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <img
              src="/hero-main.jpg"
              alt="itel Energy SPARTA Inverter"
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 text-white max-w-xl">
              <span className="inline-block px-4 py-1.5 bg-[#ff6600] text-white text-xs font-bold rounded-full mb-4 tracking-widest uppercase">
                itel Energy - SPARTA Series
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                Born for <span className="text-[#ff6600]">Reliability</span>
              </h2>
              <p className="text-gray-200 text-sm md:text-base font-medium mb-3">
                IP66 6.6kW SP Hybrid Inverter - Powered for Every Extreme. Pakistan's First Installation-Friendly Inverter.
              </p>
              <div className="flex flex-col gap-2 mb-8 text-xs text-gray-300">
                <p className="font-bold text-[#ff6600]">⚡ 6-Year Replacement + 6-Year Service Warranty</p>
                <p>• Works with SMART GO • 140A Fast Charging • Dual MPPT</p>
              </div>

              <span className="inline-flex items-center gap-3 px-8 py-4 bg-[#ff6600] text-white font-bold rounded-xl hover:bg-[#e65c00] transition-all shadow-lg hover:shadow-[#ff6600]/40 group/btn">
                SHOP NOW <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>

          {/* Grid of 4 Smaller Banners (Right) */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 h-full">
            {/* Small Banner 1 */}
            <Link href="/products" className="relative group overflow-hidden rounded-2xl h-[200px] lg:h-auto shadow-md block cursor-pointer">
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors z-10" />
              <img
                src="/inverter-banner.jpg"
                alt="itel Hybrid Inverters"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 p-4 z-20 text-white w-full">
                <h3 className="text-sm font-bold leading-tight mb-1">itel Hybrid Inverters</h3>
                <span className="text-[10px] font-bold text-[#ff6600] uppercase tracking-wider hover:underline">
                  Shop Now
                </span>
              </div>
            </Link>

            {/* Small Banner 2 */}
            <Link href="/products" className="relative group overflow-hidden rounded-2xl h-[200px] lg:h-auto shadow-md block cursor-pointer">
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors z-10" />
              <img
                src="/battery-banner.jpg"
                alt="Phoenix Lithium Batteries"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 p-4 z-20 text-white w-full">
                <h3 className="text-sm font-bold leading-tight mb-1">Phoenix Lithium Batteries</h3>
                <span className="text-[10px] font-bold text-[#ff6600] uppercase tracking-wider hover:underline">
                  Shop Now
                </span>
              </div>
            </Link>

            {/* Small Banner 3 */}
            <Link href="/products" className="relative group overflow-hidden rounded-2xl h-[200px] lg:h-auto shadow-md block cursor-pointer">
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors z-10" />
              <img
                src="/greener-tomorrow.jpg"
                alt="Sustainable Solar Solutions"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 p-4 z-20 text-white w-full">
                <h3 className="text-sm font-bold leading-tight mb-1">Sustainable Solutions</h3>
                <span className="text-[10px] font-bold text-[#ff6600] uppercase tracking-wider hover:underline">
                  Learn More
                </span>
              </div>
            </Link>

            {/* Small Banner 4 */}
            <Link href="/products" className="relative group overflow-hidden rounded-2xl h-[200px] lg:h-auto shadow-md bg-white block cursor-pointer">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
              <img
                src="/wires-banner.jpg"
                alt="Sunshine Wires & Cables"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 p-4 z-20 text-white w-full">
                <h3 className="text-sm font-bold leading-tight mb-1">Solar Wires & Cables</h3>
                <span className="text-[10px] font-bold text-[#ff6600] uppercase tracking-wider hover:underline">
                  Shop Now
                </span>
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;

