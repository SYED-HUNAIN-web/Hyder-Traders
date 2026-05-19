'use client';

import React, { useState } from 'react';
import { Heart, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/data/dummyProducts';
import { useRouter } from 'next/navigation';

interface ProductInfoProps {
  product: Product;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Title & Brand */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] bg-orange-50 text-[#ff6600] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md">
            {product.brand}
          </span>
          {product.stockStatus === 'In Stock' && (
            <span className="text-[10px] bg-green-50 text-green-600 font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-md">
              Ready to Ship
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
          {product.title}
        </h1>
        
        {/* Rating */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} strokeWidth={i < Math.floor(product.rating) ? 0 : 2} />
              ))}
            </div>
            <span className="font-bold text-gray-900 text-sm">{product.rating}</span>
          </div>
          <div className="w-[1px] h-4 bg-gray-200" />
          <div className="text-xs text-gray-500 font-bold uppercase tracking-widest hover:text-[#ff6600] cursor-pointer transition-colors underline underline-offset-4">
            {product.reviewsCount} Reviews
          </div>
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100/50">
        <div className="flex items-baseline gap-4 mb-1">
          <span className="text-3xl md:text-5xl font-black text-[#1a1a1a]">
            Rs. {product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-lg md:text-xl text-gray-400 line-through font-bold">
              Rs. {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
          Inclusive of all taxes
        </div>
      </div>

      {/* Short Description */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {product.highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-white border border-gray-100 p-3 rounded-xl shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff6600]" />
              {h}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-6 pt-4">
        <div className="flex items-center gap-6">
          <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Quantity</span>
          <div className="flex items-center bg-gray-100 rounded-xl p-1 w-32 border border-gray-200 shadow-inner">
            <button 
              onClick={decreaseQuantity}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#ff6600] rounded-lg transition-all shadow-sm active:scale-95"
              disabled={product.stockStatus === 'Out of Stock'}
            >
              <Minus size={14} strokeWidth={3} />
            </button>
            <input 
              type="number" 
              value={quantity}
              readOnly
              className="w-full text-center bg-transparent font-black text-gray-900 focus:outline-none text-sm"
            />
            <button 
              onClick={increaseQuantity}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white hover:text-[#ff6600] rounded-lg transition-all shadow-sm active:scale-95"
              disabled={product.stockStatus === 'Out of Stock'}
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row gap-3">
            <button 
              onClick={() => addToCart(product, quantity)}
              className="flex-1 bg-white text-gray-900 border-2 border-gray-900 py-4 rounded-xl font-black hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50 uppercase text-[11px] tracking-[0.2em] shadow-sm active:scale-95"
              disabled={product.stockStatus === 'Out of Stock'}
            >
              Add to Cart
            </button>
            <button 
              onClick={() => {
                addToCart(product, quantity);
                router.push('/checkout');
              }}
              className="flex-1 bg-[#ff6600] text-white py-4 rounded-xl font-black hover:bg-black transition-all duration-300 disabled:opacity-50 uppercase text-[11px] tracking-[0.2em] shadow-lg shadow-orange-200 active:scale-95"
              disabled={product.stockStatus === 'Out of Stock'}
            >
              Buy It Now
            </button>
          </div>
        </div>

        {/* Trust Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-10 border-t border-gray-100">
          <div className="flex flex-col items-center gap-3 text-center group">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#ff6600] group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-tight">Cash on<br />Delivery</div>
          </div>
          <div className="flex flex-col items-center gap-3 text-center group">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#ff6600] group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-tight">100%<br />Authentic</div>
          </div>
          <div className="flex flex-col items-center gap-3 text-center group">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#ff6600] group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"></path></svg>
            </div>
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-tight">Free<br />Shipping</div>
          </div>
          <div className="flex flex-col items-center gap-3 text-center group">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#ff6600] group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
            </div>
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-tight">Expert<br />Support</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
