'use client';

import React from 'react';
import Container from '@/components/shared/Container';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white py-20 px-4">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-8 animate-bounce">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-10 max-w-xs text-center font-medium">Looks like you haven't added anything to your cart yet. Start exploring our premium solar products!</p>
        <Link href="/products" className="bg-[#ff6600] text-white px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-black transition-all shadow-xl shadow-orange-500/20 active:scale-95">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-20">
      <Container>
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Cart Items List */}
          <div className="lg:w-2/3">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shopping <span className="text-[#ff6600]">Cart</span></h1>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-gray-100">{cartCount} Items</span>
            </div>

            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 group hover:shadow-xl transition-all">
                  {/* Product Image */}
                  <div className="w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-50">
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow text-center md:text-left">
                    <div className="text-[10px] font-black text-[#ff6600] uppercase tracking-widest mb-1">{item.brand}</div>
                    <Link href={`/products/${item.id}`} className="text-lg font-black text-gray-900 hover:text-[#ff6600] transition-colors leading-tight mb-2 block">
                      {item.title}
                    </Link>
                    <div className="text-xl font-black text-gray-900 tracking-tight">Rs. {item.price.toLocaleString()}</div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-900 hover:bg-[#ff6600] hover:text-white transition-all shadow-sm active:scale-90"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-black text-gray-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-900 hover:bg-[#ff6600] hover:text-white transition-all shadow-sm active:scale-90"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="w-12 h-12 rounded-2xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Back to Shop */}
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-[#ff6600] transition-all uppercase tracking-widest mt-10">
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 sticky top-32">
              <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight uppercase">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-black">Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500 font-medium">
                  <span>Shipping Fee</span>
                  <span className="text-green-600 font-black uppercase text-xs tracking-widest italic">Free</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-lg font-black text-gray-900 uppercase tracking-tight">Total Amount</span>
                  <span className="text-2xl font-black text-[#ff6600]">Rs. {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <ShieldCheck size={16} className="text-green-500" /> Secure Checkout Guaranteed
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Truck size={16} className="text-[#ff6600]" /> Fast Delivery Across Pakistan
                </div>
              </div>

              <Link href="/checkout" className="w-full bg-[#ff6600] text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-black transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3">
                Checkout Now <ArrowRight size={18} />
              </Link>
              
              <p className="mt-6 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                Prices include all applicable taxes and 1 year basic warranty.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CartPage;
