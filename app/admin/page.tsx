'use client';

import React, { useState, useEffect } from 'react';
import Container from '@/components/shared/Container';
import { ShieldCheck, Users, Package, Settings, Lock, AlertCircle, ArrowRight, Eye, EyeOff, ShoppingCart, Star, Flame, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { verifyAdminCredentials } from '@/app/actions/adminAuth';
import ProductsManagement from '@/components/admin/ProductsManagement';
import OrdersManagement from '@/components/admin/OrdersManagement';
import UsersManagement from '@/components/admin/UsersManagement';
import ShippingManagement from '@/components/admin/ShippingManagement';
import { useProducts } from '@/context/ProductsContext';
import { getAllUsers, getAllOrders } from '@/services/firestore';

const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const { products } = useProducts();
  const [isVerified, setIsVerified] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users' | 'shipping'>('dashboard');

  // Live counts fetched dynamically
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  useEffect(() => {
    if (isVerified) {
      const fetchDashboardStats = async () => {
        setIsStatsLoading(true);
        try {
          const [usersList, ordersList] = await Promise.all([
            getAllUsers(),
            getAllOrders()
          ]);
          setTotalUsers(usersList.length);
          setTotalOrders(ordersList.length);
        } catch (err) {
          console.error("Failed to load dynamic dashboard statistics:", err);
        } finally {
          setIsStatsLoading(false);
        }
      };
      fetchDashboardStats();
    }
  }, [isVerified]);

  // Context statistics
  const totalProductsCount = products.length;
  const featuredProductsCount = products.filter(p => p.featured === true).length;
  const bestsellerProductsCount = products.filter(p => p.bestseller === true).length;
  const outOfStockProductsCount = products.filter(p => (p.stock || 0) === 0).length;

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const valid = await verifyAdminCredentials(username, password);
      if (valid) {
        setIsVerified(true);
      } else {
        setError("Invalid admin credentials.");
      }
    } catch (err) {
      setError("An error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isVerified ? (
        <div className="min-h-[80vh] bg-[#fafafa] flex items-center justify-center py-12 px-4">
          <Container>
            <div className="max-w-md mx-auto bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-orange-500/5 border border-gray-100">
              <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-orange-100">
                <Lock size={32} className="text-[#ff6600]" />
              </div>
              <h2 className="text-3xl font-black text-center text-gray-900 tracking-tight mb-2">Admin Verification</h2>
              <p className="text-gray-500 text-center text-sm font-medium mb-8">Please enter your secondary admin credentials to proceed.</p>

              <form onSubmit={handleVerification} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-2 block">Username</label>
                  <input
                    required
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Admin Username"
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#ff6600]/10 focus:bg-white rounded-2xl py-4 px-6 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-2 block">Password</label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-[#ff6600]/10 focus:bg-white rounded-2xl py-4 pl-6 pr-14 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff6600] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 rounded-2xl p-4 text-xs font-bold flex items-center gap-3">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1a1a1a] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-[#ff6600] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 mt-4 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Verify Access <ArrowRight size={18} /></>
                  )}
                </button>
              </form>
            </div>
          </Container>
        </div>
      ) : (
        <div className="min-h-screen bg-[#f5f5f5] py-12">
          <Container>
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Portal</h1>
                  <p className="text-gray-500 font-medium">Welcome back, {userProfile?.fullName || 'Administrator'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-8 border-b border-gray-100 pb-4">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('products')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Products Management
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Orders Management
                </button>
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Users Management
                </button>
                <button 
                  onClick={() => setActiveTab('shipping')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'shipping' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Shipping Settings
                </button>
              </div>

              {activeTab === 'dashboard' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {/* Total Products */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-all">
                      <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                        <Package size={28} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Products</div>
                        <div className="text-3xl font-black text-gray-900 mt-1">{totalProductsCount}</div>
                      </div>
                    </div>

                    {/* Total Users */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-all">
                      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                        <Users size={28} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Users</div>
                        <div className="text-3xl font-black text-gray-900 mt-1">
                          {isStatsLoading || totalUsers === null ? (
                            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mt-1"></div>
                          ) : (
                            totalUsers
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-all">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                        <ShoppingCart size={28} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</div>
                        <div className="text-3xl font-black text-gray-900 mt-1">
                          {isStatsLoading || totalOrders === null ? (
                            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mt-1"></div>
                          ) : (
                            totalOrders
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Featured Products Count */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-all">
                      <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                        <Star size={28} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Featured Products</div>
                        <div className="text-3xl font-black text-gray-900 mt-1">{featuredProductsCount}</div>
                      </div>
                    </div>

                    {/* Bestseller Products Count */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-all">
                      <div className="w-14 h-14 bg-orange-50 text-[#ff6600] rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                        <Flame size={28} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bestseller Products</div>
                        <div className="text-3xl font-black text-gray-900 mt-1">{bestsellerProductsCount}</div>
                      </div>
                    </div>

                    {/* Out Of Stock Products */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-all">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${outOfStockProductsCount > 0 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-green-50 text-green-600'}`}>
                        <AlertTriangle size={28} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Out Of Stock</div>
                        <div className={`text-3xl font-black mt-1 ${outOfStockProductsCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{outOfStockProductsCount}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-[#1a1a1a] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl border border-white/5">
                    <div className="z-10 relative max-w-xl">
                      <h3 className="text-xl font-black tracking-tight mb-2">Live Store Administration</h3>
                      <p className="text-sm text-gray-300 font-medium leading-relaxed">
                        Welcome to your high-fidelity administration command center. Use the tabs above to manage your live catalog, monitor order volumes, adjust inventory stock quantities on the fly, and toggle featured homepage highlights.
                      </p>
                    </div>
                    {/* Decorative accent element */}
                    <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-[#ff6600]/10 to-transparent pointer-events-none" />
                  </div>
                </>
              ) : activeTab === 'products' ? (
                <ProductsManagement />
              ) : activeTab === 'orders' ? (
                <OrdersManagement />
              ) : activeTab === 'users' ? (
                <UsersManagement />
              ) : (
                <ShippingManagement />
              )}
            </div>
          </Container>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
