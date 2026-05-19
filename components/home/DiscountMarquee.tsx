"use client";

import React from "react";

const DiscountMarquee = () => {
  const text = "⚡SPECIAL DISCOUNT⚡SPECIAL DISCOUNT⚡SPECIAL DISCOUNT⚡SPECIAL DISCOUNT⚡SPECIAL DISCOUNT⚡SPECIAL DISCOUNT⚡SPECIAL DISCOUNT⚡SPECIAL DISCOUNT⚡SPECIAL DISCOUNT⚡SPECIAL DISCOUNT⚡";

  return (
    <section className="bg-[#ff6600] py-2 overflow-hidden border-y-2 border-white/20">
      <div className="animate-marquee whitespace-nowrap">
        <span className="text-sm md:text-base font-black text-white uppercase tracking-[0.2em] inline-block px-4">
          {text}
        </span>
        <span className="text-sm md:text-base font-black text-white uppercase tracking-[0.2em] inline-block px-4">
          {text}
        </span>
      </div>
    </section>
  );
};

export default DiscountMarquee;
