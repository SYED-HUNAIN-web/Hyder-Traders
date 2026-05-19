"use client";

import React from "react";
import Container from "../shared/Container";
import Link from "next/link";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import CloudinaryImage from "../shared/CloudinaryImage";

const TopProducts = () => {
  const { products, isLoading } = useProducts();
  const { addToCart } = useCart();

  // Filter for products marked as bestseller in Firestore
  const bestsellerProducts = products.filter(p => p.bestseller === true);

  if (bestsellerProducts.length === 0 && !isLoading) {
    return null;
  }

  return (
    <section className="py-8">
      <Container>
        {/* Top Products Banner matching Buy With Confidence */}
        <div className="relative bg-[#ff6600] rounded-2xl p-4 md:p-6 mb-8 overflow-hidden shadow-lg flex items-center justify-center border-b-4 border-black/10">
          <div className="z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
              TOP PRODUCTS
            </h2>
          </div>
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/5 rounded-full blur-2xl" />
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="w-full flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {bestsellerProducts.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id} className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="h-48 md:h-56 bg-gray-50 flex items-center justify-center relative overflow-hidden flex-shrink-0 p-4">
                  <CloudinaryImage src={product.images[0]} alt={product.title} width={400} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  {(product.stock || 0) === 0 ? (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider z-10">
                      Sold Out
                    </div>
                  ) : product.bestseller ? (
                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider z-10">
                      Bestseller
                    </div>
                  ) : (
                    <div className="absolute top-3 left-3 bg-[#ff6600] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider z-10">
                      New
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{product.category}</span>
                    <h3 className="font-bold text-sm text-[#1a1a1a] mt-1 line-clamp-2 group-hover:text-[#ff6600] transition-colors">
                      {product.title}
                    </h3>
                  </div>
                  <div className="mt-3 flex flex-col">
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
  );
};

export default TopProducts;
