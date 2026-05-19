'use client';

import React, { useState, Suspense } from 'react';
import Container from '../../components/shared/Container';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Star, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { signInWithEmail, signUpWithEmail, signInWithGooglePopup } from '../../services/auth';

const LoginPageComponent = () => {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        await signUpWithEmail(email, password, fullName);
      }
      
      // Redirect to target path or dashboard upon successful login/signup
      const redirectPath = searchParams.get('redirect') || '/dashboard';
      router.push(redirectPath);
    } catch (err: any) {
      console.error(err);
      // Simplify error message for user readability
      let friendlyMessage = err.message || 'Authentication failed. Please try again.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = 'Password should be at least 6 characters.';
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGooglePopup();
      const redirectPath = searchParams.get('redirect') || '/dashboard';
      router.push(redirectPath);
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google authentication failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side: Aesthetic Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a1a] relative p-20 flex-col justify-between overflow-hidden">
        {/* Abstract Background Decor */}
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="0" r="80" stroke="#ff6600" strokeWidth="0.1" />
            <circle cx="100" cy="0" r="60" stroke="#ff6600" strokeWidth="0.1" />
            <circle cx="100" cy="0" r="40" stroke="#ff6600" strokeWidth="0.1" />
            <path d="M0 100 L100 0" stroke="#ff6600" strokeWidth="0.05" />
          </svg>
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-white p-2 rounded-xl">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">
              HYDER<span className="text-[#ff6600]">TRADERS</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#ff6600]/10 text-[#ff6600] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Star size={12} fill="currentColor" />
            Leading Solar Marketplace
          </div>
          <h2 className="text-5xl xl:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8">
            Powering Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6600] to-orange-300">Sustainable Future</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed font-medium">
            Join thousands of satisfied customers who have transitioned to clean, reliable solar energy with Hyder Traders.
          </p>
        </div>

        <div className="relative z-10 flex gap-12">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-white">500+</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Installations</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-black text-white">98%</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Client Satisfaction</span>
          </div>
        </div>
      </div>

      {/* Right Side: Professional Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 bg-[#fafafa]">
        <div className="w-full max-w-[440px]">
          {/* Mobile Logo Only */}
          <div className="lg:hidden flex flex-col items-center mb-12">
            <img src="/logo.png" alt="Logo" className="h-12 w-auto mb-4" />
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">
              HYDER<span className="text-[#ff6600]">TRADERS</span>
            </h1>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-orange-500/5 border border-gray-100">
            <div className="mb-10">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-gray-400 font-medium text-sm">
                {mode === 'login' ? 'Please enter your account details' : 'Fill in the details to join us'}
              </p>
            </div>

            {/* Premium Toggle */}
            <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-10 border border-gray-100">
              <button 
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'login' ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Sign In
              </button>
              <button 
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'signup' ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff6600] transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      required 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your name" 
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-[#ff6600]/10 focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300 text-sm" 
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff6600] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    required 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com" 
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#ff6600]/10 focus:bg-white rounded-2xl py-4 pl-14 pr-6 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300 text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                  {mode === 'login' && (
                    <button type="button" className="text-[10px] font-black text-[#ff6600] uppercase tracking-widest hover:underline transition-all">Forgot?</button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff6600] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    required 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#ff6600]/10 focus:bg-white rounded-2xl py-4 pl-14 pr-14 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300 text-sm" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff6600] transition-colors flex items-center justify-center cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 text-xs font-bold leading-relaxed flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={16} className="shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#ff6600] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 mt-4 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Join Now'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="relative py-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em]">
                  <span className="bg-white px-4 text-gray-300">Professional Access</span>
                </div>
              </div>

              <button 
                type="button" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-4 bg-white border border-gray-100 py-4 rounded-2xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083A19.95 19.95 0 0 1 44 24c0 11.045-8.955 20-20 20c-7.773 0-14.495-4.444-17.687-10.921L12.717 28.054c.484 1.341 1.258 2.54 2.247 3.565L37.591 38.808C40.324 36.331 42.235 32.88 42.81 29.083H24v-9h19.611z"/></svg>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Sign in with Google</span>
              </button>
            </form>
          </div>

          {/* Footer Security */}
          <div className="mt-12 flex flex-col items-center gap-4">
             <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-green-500" /> 
                End-to-End Encrypted Data Protection
             </div>
             <div className="flex items-center gap-6 text-xs font-medium text-gray-400">
                <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
                <Link href="/help" className="hover:text-gray-900 transition-colors">Help Center</Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-12 h-12 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginPageComponent />
    </Suspense>
  );
};

export default LoginPage;
