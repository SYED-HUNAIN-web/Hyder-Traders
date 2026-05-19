'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, ShieldX } from 'lucide-react';
import Link from 'next/link';
import Container from '@/components/shared/Container';
import { useAuth } from '@/context/AuthContext';
import AuthRequired from '@/components/auth/AuthRequired';

const AdminRequired = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoading, userProfile } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#fafafa]">
        <div className="w-12 h-12 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not logged in at all, fallback to the standard AuthRequired barrier screen
  if (!isLoggedIn) {
    return <AuthRequired />;
  }

  // If logged in, but not an admin, show a strict "Access Denied" screen
  if (userProfile?.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#fafafa] py-12 px-4 overflow-hidden relative">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" 
        />
        <Container>
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                className="w-24 h-24 bg-white rounded-[2.5rem] shadow-2xl shadow-red-500/10 border border-red-100 flex items-center justify-center mx-auto mb-10 relative group"
              >
                <div className="absolute inset-0 bg-red-500/5 rounded-[2.5rem] scale-0 group-hover:scale-110 transition-transform duration-500" />
                <ShieldX className="text-red-500 w-10 h-10 relative z-10" />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <span className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-red-100">
                  <ShieldAlert size={12} />
                  Access Denied
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
                  Restricted <span className="text-red-500">Admin Area</span>
                </h2>
                <p className="text-gray-500 text-lg font-medium mb-12 max-w-md mx-auto leading-relaxed">
                  You do not have the required permissions to access this page. This area is strictly reserved for administrators.
                </p>
              </motion.div>

              <div className="flex justify-center">
                <Link 
                  href="/dashboard" 
                  className="w-full sm:w-60 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all"
                >
                  <ArrowLeft size={18} />
                  Return to Dashboard
                </Link>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>
    );
  }

  // If role === 'admin', render the protected content
  return <>{children}</>;
};

export default AdminRequired;
