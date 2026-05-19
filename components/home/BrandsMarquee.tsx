"use client";

import React from "react";
import Container from "../shared/Container";

const BrandsMarquee = () => {
  const brands = [
    { name: "Coretech", image: "/coretech.jpeg" },
    { name: "Sunwooda", image: "/sunwooda.png" },
    { name: "Phoenix", image: "/phoenix.png" },
    { name: "Inverex", image: "/inverex.jpg" },
    { name: "Sunflx", image: "/sunflx.png" },
    { name: "Solis", image: "/solis.png" },
    { name: "Jinko", image: "/jinko.png" },
    { name: "Longi", image: "/longi.png" },
    { name: "Mora", image: "/mora.jpg" },
    { name: "Itel", image: "/itel.png" },
  ];

  return (
    <section className="py-6 border-t border-b border-gray-100 bg-white overflow-hidden">
      <Container>
        <div className="flex flex-col gap-4">
          <h3 className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest">
            TRUSTED BY TOP BRANDS
          </h3>
          
          <div className="relative w-full flex overflow-hidden group">
            {/* Left fade gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10"></div>
            
            <div className="flex animate-[marquee_20s_linear_infinite] group-hover:[animation-play-state:paused] whitespace-nowrap">
              {/* First set of brands */}
              {brands.map((brand, index) => (
                <div 
                  key={`brand-1-${index}`} 
                  className="mx-8 flex items-center justify-center w-32 h-16 transition-all duration-300 hover:scale-105"
                >
                  <img src={brand.image} alt={brand.name} className="max-w-full max-h-full object-contain" />
                </div>
              ))}
              
              {/* Duplicate set for seamless loop */}
              {brands.map((brand, index) => (
                <div 
                  key={`brand-2-${index}`} 
                  className="mx-8 flex items-center justify-center w-32 h-16 transition-all duration-300 hover:scale-105"
                >
                  <img src={brand.image} alt={brand.name} className="max-w-full max-h-full object-contain" />
                </div>
              ))}
            </div>

            {/* Right fade gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10"></div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default BrandsMarquee;
