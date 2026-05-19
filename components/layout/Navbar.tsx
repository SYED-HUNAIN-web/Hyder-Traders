"use client";

import React, { useState, useEffect } from "react";
import Container from "../shared/Container";
import { Search, ShoppingCart, User, Menu, Phone, X, Heart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Sync search input state with URL on navigation changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchQuery(params.get('search') || '');
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Solar System Installation", href: "/installation" },
    { name: "Contact Us", href: "/contact" },
    { name: "Order Tracking", href: "/tracking" },
  ];

  return (
    <nav className="relative w-full">
      {/* Main Navbar Row - Fixed/Sticky with Glassmorphism */}
      <div 
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? "bg-white/80 backdrop-blur-xl shadow-lg py-2" 
            : "bg-white/50 backdrop-blur-md py-4"
        }`}
      >
        <Container>
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <img 
                src="/logo.png" 
                alt="Hyder Traders Logo" 
                className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <h1 className="text-xl md:text-2xl font-extrabold text-[#1a1a1a] tracking-tight leading-none">
                HYDER<span className="text-[#ff6600]">TRADERS</span>
              </h1>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl relative px-4">
              <form onSubmit={handleSearch} className="relative w-full group">
                <input
                  type="text"
                  placeholder="Search for products (e.g. 550W Panels, Inverters...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#f5f5f5] border-2 border-gray-200 hover:border-gray-300 rounded-full py-3 px-6 pr-20 focus:bg-white focus:border-[#ff6600] focus:outline-none text-[#1a1a1a] transition-all shadow-sm focus:shadow-md"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button type="submit" className="bg-[#ff6600] text-white p-2 rounded-full hover:bg-[#e65c00] transition-all active:scale-90 shadow-md shadow-orange-500/20">
                    <Search size={18} />
                  </button>
                </div>

                {/* Search Suggestions Dropdown */}
                {searchQuery.length > 1 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-gray-50/50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Suggestions</p>
                      <div className="space-y-1">
                        {["Jinko 550W Solar", "Inverex VEYRON", "Lithium Battery 100Ah", "Hybrid Inverters"].filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).map((suggestion, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setSearchQuery(suggestion);
                              router.push(`/products?search=${encodeURIComponent(suggestion)}`);
                            }}
                            className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white hover:shadow-sm text-sm font-bold text-gray-700 hover:text-[#ff6600] transition-all flex items-center gap-3"
                          >
                            <Search size={14} className="text-gray-300" />
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-4">
              {/* Phone - Hidden on small mobile */}
              <div className="hidden sm:flex items-center gap-2 px-3 border-r border-gray-200">
                <div className="w-10 h-10 bg-[#f5f5f5] rounded-full flex items-center justify-center text-[#ff6600]">
                  <Phone size={18} fill="currentColor" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase leading-none">Call Support</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">+92 3001030542</span>
                </div>
              </div>

              {/* Icons */}
              <div className="flex items-center gap-1 md:gap-2">
                <Link href="/dashboard" className="p-2 text-gray-700 hover:text-[#ff6600] transition-colors hidden sm:block">
                  <User size={24} />
                </Link>
                <Link href="/cart" className="p-2 text-gray-700 hover:text-[#ff6600] transition-colors relative group">
                  <ShoppingCart size={24} />
                  <span className="absolute top-0 right-0 bg-[#ff6600] text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform">
                    {cartCount}
                  </span>
                </Link>
                <button 
                  className="lg:hidden p-2 text-gray-700 hover:text-[#ff6600]"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
              </div>
              
              {/* Auth Buttons - Desktop */}
              <div className="hidden xl:flex items-center gap-2">
                {isLoggedIn ? (
                  <Link href="/dashboard" className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-black transition-all shadow-md active:scale-95">
                    MY ACCOUNT
                  </Link>
                ) : (
                  <Link href="/login" className="px-5 py-2.5 bg-[#ff6600] text-white text-sm font-bold rounded-full hover:bg-[#e65c00] transition-all shadow-md active:scale-95">
                    LOGIN / SIGNUP
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Navigation Links Bar - Desktop */}
      <div className="hidden lg:block bg-white border-b py-3">
        <Container>
          <ul className="flex items-center gap-10">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  href={link.href} 
                  className="text-sm font-bold text-[#1a1a1a] hover:text-[#ff6600] transition-colors uppercase tracking-wide"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[72px] bottom-0 bg-white z-[100] overflow-y-auto animate-in slide-in-from-top duration-300">
          <div className="p-4 space-y-6">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f5f5f5] rounded-2xl py-4 px-6 pr-20 focus:outline-none border-2 border-gray-200 focus:border-[#ff6600]/20 focus:bg-white transition-all font-bold text-sm"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-2 text-gray-400"
                  >
                    <X size={18} />
                  </button>
                )}
                <button type="submit" className="bg-[#ff6600] text-white p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
                  <Search size={20} />
                </button>
              </div>
            </form>

            {/* Mobile Links */}
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.name} className="border-b pb-2">
                  <Link 
                    href={link.href} 
                    className="text-base font-bold text-[#1a1a1a] block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile Auth */}
            <div className="flex flex-col gap-3 pt-2">
              {isLoggedIn ? (
                <Link 
                  href="/dashboard" 
                  className="w-full py-4 bg-gray-900 text-white text-center font-bold rounded-xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  MY ACCOUNT
                </Link>
              ) : (
                <Link 
                  href="/login" 
                  className="w-full py-4 bg-[#ff6600] text-white text-center font-bold rounded-xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  LOGIN / SIGNUP
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
