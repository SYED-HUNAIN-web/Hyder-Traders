'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, UserPlus, LogIn, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Container from '@/components/shared/Container';

interface AuthRequiredProps {
  redirectPath?: string;
  message?: string;
}

const AuthRequired = ({ redirectPath = '/dashboard', message }: AuthRequiredProps) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#fafafa] py-12 px-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-24 -left-24 w-96 h-96 bg-[#ff6600]/5 rounded-full blur-3xl pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, -90, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/5 rounded-full blur-3xl pointer-events-none" 
      />

      <Container>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Animated Icon */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2
              }}
              className="w-24 h-24 bg-white rounded-[2.5rem] shadow-2xl shadow-orange-500/10 border border-orange-100 flex items-center justify-center mx-auto mb-10 relative group"
            >
              <div className="absolute inset-0 bg-[#ff6600]/5 rounded-[2.5rem] scale-0 group-hover:scale-110 transition-transform duration-500" />
              <Lock className="text-[#ff6600] w-10 h-10 relative z-10" />
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 border-2 border-[#ff6600]/20 rounded-[2.5rem]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-red-100">
                <ShieldAlert size={12} />
                Authentication Required
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
                Hold on! Please <span className="text-[#ff6600]">Login</span> <br /> 
                or <span className="text-[#ff6600]">Sign Up</span> first.
              </h2>
              <p className="text-gray-500 text-lg font-medium mb-12 max-w-md mx-auto leading-relaxed">
                {message || "To access your personalized dashboard, track orders, and manage your account, you need to be part of the Hyder Traders community."}
              </p>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Link 
                  href={`/login?redirect=${encodeURIComponent(redirectPath)}`} 
                  className="w-full sm:w-60 h-16 bg-[#ff6600] text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-500/20 hover:bg-black transition-all"
                >
                  <LogIn size={18} />
                  Sign In
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Link 
                  href={`/login?mode=signup&redirect=${encodeURIComponent(redirectPath)}`} 
                  className="w-full sm:w-60 h-16 bg-white text-gray-900 border border-gray-100 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-sm hover:border-[#ff6600] transition-all"
                >
                  <UserPlus size={18} />
                  Join Now
                </Link>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12"
            >
              <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#ff6600] font-black text-[10px] uppercase tracking-widest transition-colors group">
                Return to Homepage
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
};

export default AuthRequired;
