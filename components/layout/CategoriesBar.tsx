"use client";

import React, { useState, useEffect } from "react";
import Container from "../shared/Container";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const CategoriesBar = () => {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Sync active category state with URL on navigation changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setActiveCategory(params.get('category'));
  }, [pathname]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories = [
    { name: "Solar Inverters", slug: "inverters" },
    { name: "Solar Panels", slug: "panels" },
    { name: "Lithium Batteries", slug: "batteries" },
    { name: "AC/DC Breakers", slug: "breakers" },
    { name: "Solar Wires", slug: "wires" },
    { name: "Accessories", slug: "accessories" },
  ];

  return (
    <div 
      className={`sticky z-40 transition-all duration-300 border-b ${
        isScrolled 
          ? "top-[56px] lg:top-[64px] bg-white/80 backdrop-blur-xl shadow-lg py-1" 
          : "top-[72px] lg:top-[80px] bg-white/50 backdrop-blur-md py-2"
      }`}
    >
      <Container>
        <div className="flex items-center py-1">
          {/* Navigation Links - Wrapped instead of scrollable */}
          <div className="flex flex-wrap items-center gap-4 md:gap-8 py-1">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pr-4 border-r border-gray-100 flex-shrink-0">
              CATEGORIES
            </div>

            {categories.map((cat) => (
              <motion.div
                key={cat.slug}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className={`group relative px-3 py-2 text-sm font-bold uppercase tracking-wide transition-all block ${
                    activeCategory === cat.slug 
                      ? "text-[#ff6600]" 
                      : "text-gray-600 hover:text-[#ff6600]"
                  }`}
                >
                  {cat.name}
                  {activeCategory === cat.slug && (
                    <motion.span 
                      layoutId="activeCategoryIndicator"
                      className="absolute -bottom-1 left-3 right-3 h-0.5 bg-[#ff6600] rounded-full"
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CategoriesBar;
