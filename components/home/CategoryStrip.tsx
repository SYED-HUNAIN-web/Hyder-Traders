"use client";

import React from "react";
import Link from "next/link";

const categories = [
  { name: "Solar Inverter", image: "/inverter.png", href: "/products" },
  { name: "Solar Panel", image: "/panel.png", href: "/products" },
  { name: "Batteries", image: "/battery.jpg", href: "/products" },
  { name: "Breakers", image: "/breaker.webp", href: "/products" },
  { name: "Wires/Cables", image: "/wire.jpeg", href: "/products" },
  { name: "Accessories", image: "/accessories.png", href: "/products" },
];

const CategoryStrip = () => {
  // Multiply categories for seamless infinite loop
  const displayCategories = [...categories, ...categories, ...categories, ...categories, ...categories];

  return (
    <section id="category-slider" className="w-full py-10 bg-white border-y border-gray-100 overflow-hidden block">
      <div className="relative w-full overflow-hidden">
        {/* Continuous Marquee Track */}
        <div className="flex animate-infinite-scroll hover:[animation-play-state:paused] whitespace-nowrap">
          {displayCategories.map((cat, idx) => (
            <Link
              key={`${cat.name}-${idx}`}
              href={cat.href}
              className="flex-shrink-0 flex flex-col items-center gap-3 px-8 md:px-16 group cursor-pointer"
            >
              {/* Product Card */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm group-hover:border-[#ff6600] group-hover:shadow-md transition-all duration-300 overflow-hidden flex items-center justify-center">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=" + cat.name.split(' ')[0];
                  }}
                />
              </div>

              {/* Product Name */}
              <span className="text-[10px] md:text-xs font-bold text-[#1a1a1a] uppercase tracking-tight group-hover:text-[#ff6600] transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Edge Gradients for Smoothness */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  );
};

export default CategoryStrip;
