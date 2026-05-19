'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/dummyProducts';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('hyder_traders_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart from localStorage', e);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('hyder_traders_cart', JSON.stringify(cart));
  }, [cart]);

  // Clear notification timer cleanly
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const availableStock = product.stock !== undefined ? product.stock : 10;
    
    if (availableStock <= 0) {
      alert(`Sorry, "${product.title}" is currently out of stock.`);
      return;
    }

    let limitExceeded = false;
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        const targetQty = existingItem.quantity + quantity;
        if (targetQty > availableStock) {
          limitExceeded = true;
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: availableStock } : item
          );
        }
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: targetQty } : item
        );
      }
      const initialQty = Math.min(quantity, availableStock);
      return [...prevCart, { ...product, quantity: initialQty }];
    });
    
    if (limitExceeded) {
      alert(`Sorry, only ${availableStock} units of "${product.title}" are available in stock. Your cart has been set to the maximum available quantity.`);
    } else {
      setNotification("SUCCESSFULLY ADDED TO CART");
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    let limitExceeded = false;
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.id === productId);
      if (!item) return prevCart;
      
      const availableStock = item.stock !== undefined ? item.stock : 10;
      if (quantity > availableStock) {
        limitExceeded = true;
        return prevCart.map((i) =>
          i.id === productId ? { ...i, quantity: availableStock } : i
        );
      }
      
      return prevCart.map((i) =>
        i.id === productId ? { ...i, quantity } : i
      );
    });

    if (limitExceeded) {
      const item = cart.find(i => i.id === productId);
      const availableStock = item?.stock !== undefined ? item.stock : 10;
      alert(`Sorry, only ${availableStock} units are available in stock.`);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartCount, 
      cartTotal 
    }}>
      {children}
      
      {/* Global Cart Notification Popup */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[9999] bg-[#1a1a1a] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800"
          >
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <span className="text-xs font-black tracking-widest uppercase">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
