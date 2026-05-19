'use client';

import Container from "@/components/shared/Container";
import Hero from "@/components/home/Hero";
import ConfidenceBanner from "@/components/home/ConfidenceBanner";
import CategoryStrip from "@/components/home/CategoryStrip";
import DiscountMarquee from "@/components/home/DiscountMarquee";
import BrandsMarquee from "@/components/home/BrandsMarquee";
import TopProducts from "@/components/home/TopProducts";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Zap } from "lucide-react";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import CloudinaryImage from "@/components/shared/CloudinaryImage";

export default function Home() {
  const { products, isLoading } = useProducts();
  const { addToCart } = useCart();
  // Get all products that are featured (Show on Homepage)
  const featuredProducts = products.filter(p => p.featured === true);

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Hero Section */}
      <Hero />

      {/* Confidence Banner */}
      <ConfidenceBanner />

      {/* Category Strip */}
      <CategoryStrip />

      {/* Discount Marquee */}
      <DiscountMarquee />

      {/* Brands Marquee */}
      <BrandsMarquee />

      {/* Features Section */}
      <section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-gray-100 rounded-2xl flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-[#ff6600]/10 rounded-full flex items-center justify-center text-[#ff6600] flex-shrink-0">
                <Truck size={28} />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a]">Fast Delivery</h3>
                <p className="text-sm text-gray-500">All across Pakistan</p>
              </div>
            </div>
            
            <div className="p-6 bg-white border border-gray-100 rounded-2xl flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-[#ff6600]/10 rounded-full flex items-center justify-center text-[#ff6600] flex-shrink-0">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a]">Quality Warranty</h3>
                <p className="text-sm text-gray-500">Genuine solar products</p>
              </div>
            </div>
            
            <div className="p-6 bg-white border border-gray-100 rounded-2xl flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-[#ff6600]/10 rounded-full flex items-center justify-center text-[#ff6600] flex-shrink-0">
                <Zap size={28} />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a]">Expert Installation</h3>
                <p className="text-sm text-gray-500">Professional technical team</p>
              </div>
            </div>
          </div>
        </Container>
      </section>
      {/* Featured Products */}
      {(featuredProducts.length > 0 || isLoading) && (
        <section className="mt-8">
          <Container>
            <div className="flex items-center justify-between mb-8 border-b-2 border-gray-100 pb-4">
              <h2 className="text-2xl font-extrabold text-[#1a1a1a] uppercase tracking-tight">
                Featured <span className="text-[#ff6600]">Products</span>
              </h2>
              <Link href="/products" className="text-sm font-bold text-[#ff6600] hover:underline flex items-center gap-1">
                SEE ALL PRODUCTS <ArrowRight size={16} />
              </Link>
            </div>
            
            {isLoading ? (
              <div className="w-full flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {featuredProducts.map((product) => (
                  <Link href={`/products/${product.id}`} key={product.id} className="group flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <div className="h-48 md:h-56 bg-gray-50 flex items-center justify-center relative overflow-hidden p-4 shrink-0">
                      <CloudinaryImage src={product.images[0]} alt={product.title} width={300} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                      {(product.stock || 0) === 0 ? (
                        <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                          Sold Out
                        </div>
                      ) : product.bestseller ? (
                        <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                          Bestseller
                        </div>
                      ) : (
                        <div className="absolute top-3 left-3 bg-[#ff6600] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                          New
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-grow">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{product.category}</span>
                        <h3 className="font-bold text-sm text-[#1a1a1a] mt-1 line-clamp-2 group-hover:text-[#ff6600] transition-colors">
                          {product.title}
                        </h3>
                      </div>
                      <div className="mt-4 flex flex-col">
                        <span className="text-[#ff6600] font-extrabold text-lg leading-none">PKR {product.price.toLocaleString()}</span>
                        {(product.comparePrice || product.originalPrice) && (
                          <span className="text-xs text-gray-400 line-through mt-1">PKR {(product.comparePrice || product.originalPrice)?.toLocaleString()}</span>
                        )}
                      </div>
                      <button
                        disabled={(product.stock || 0) === 0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if ((product.stock || 0) > 0) {
                            addToCart(product);
                          }
                        }}
                        className={`w-full mt-4 py-2 border-t border-gray-100 font-bold text-[10px] text-center transition-all uppercase tracking-widest rounded-lg border-2 cursor-pointer ${
                          (product.stock || 0) === 0
                            ? "bg-gray-100 text-gray-400 border-transparent cursor-not-allowed"
                            : "text-[#ff6600] border-transparent hover:bg-[#ff6600] hover:text-white hover:border-[#ff6600]"
                        }`}
                      >
                        {(product.stock || 0) === 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Container>
        </section>
      )}

      {/* Top Bestseller Products */}
      <TopProducts />
    </div>
  );
}

