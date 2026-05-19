'use client';

import React, { useState, useEffect } from 'react';
import Container from '../../components/shared/Container';
import { 
  User, Package, MapPin, Settings, LogOut, 
  ShoppingBag, CreditCard, Bell, ChevronRight, 
  ExternalLink, CheckCircle2, Clock, AlertCircle, ShieldCheck, Lock
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import AuthRequired from '../../components/auth/AuthRequired';
import { updateUserProfile, getOrdersByUserId, updateOrderStatus, Order } from '../../services/firestore';

const DashboardPage = () => {
  const { isLoggedIn, isLoading, logout, user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'settings'>('overview');
  
  // Profile settings state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Price alerts state
  const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(false);
  const [isAlertSettingLoading, setIsAlertSettingLoading] = useState(false);

  // Firestore orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  // Order cancellation state
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [cancelTrackingNum, setCancelTrackingNum] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  // Synchronize settings state once user profile is fetched
  useEffect(() => {
    if (userProfile) {
      setProfileName(userProfile.fullName || '');
      setProfilePhone(userProfile.phoneNumber || '');
      setPriceAlertsEnabled(userProfile.priceAlertsEnabled || false);
    } else if (user) {
      setProfileName(user.displayName || '');
    }
  }, [userProfile, user]);

  const handleEnablePriceAlerts = async () => {
    if (!user) return;
    setIsAlertSettingLoading(true);
    try {
      const nextState = !priceAlertsEnabled;
      await updateUserProfile(user.uid, {
        priceAlertsEnabled: nextState
      });
      setPriceAlertsEnabled(nextState);
    } catch (err) {
      console.error("Failed to update price alert settings:", err);
    } finally {
      setIsAlertSettingLoading(false);
    }
  };

  // Load orders dynamically from Firestore
  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      try {
        const userOrders = await getOrdersByUserId(user.uid);
        setOrders(userOrders);
      } catch (err) {
        console.error("Failed to load orders from Firestore:", err);
      } finally {
        setIsOrdersLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  const handleCancelOrderClick = (orderId: string, trackingNumber: string) => {
    setOrderToCancel(orderId);
    setCancelTrackingNum(trackingNumber);
    setCancelError(null);
    setCancelSuccess(null);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsCancelling(true);
    setCancelError(null);
    try {
      await updateOrderStatus(orderToCancel, 'Cancelled');
      
      // Update local state dynamically
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderToCancel ? { ...o, status: 'Cancelled' } : o)
      );
      
      setCancelSuccess("Your order has been successfully cancelled.");
      setTimeout(() => {
        setOrderToCancel(null);
        setCancelTrackingNum(null);
        setCancelSuccess(null);
      }, 2000);
    } catch (err: any) {
      console.error("Failed to cancel order:", err);
      setCancelError(err.message || "Failed to cancel the order. Please try again later.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-12 h-12 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return <AuthRequired />;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await updateUserProfile(user.uid, {
        fullName: profileName,
        phoneNumber: profilePhone,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || 'Failed to update profile settings.');
    } finally {
      setIsUpdating(false);
    }
  };

  const displayName = profileName || user.displayName || 'Valued Member';
  const firstName = displayName.split(' ')[0];
  
  // Calculate spent amounts and order counters dynamically from real Firestore data
  const totalOrdersCount = orders.length;
  const totalSpentValue = `PKR ${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}`;
  const wishlistCount = userProfile?.wishlist?.length || 0;

  const stats = [
    { label: 'Total Orders', value: String(totalOrdersCount), icon: <Package size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Spent', value: totalSpentValue, icon: <CreditCard size={20} />, color: 'bg-green-50 text-green-600' },
    { label: 'Wishlist', value: String(wishlistCount), icon: <ShoppingBag size={20} />, color: 'bg-orange-50 text-[#ff6600]' },
  ];

  // Slice actual orders list for the recent orders panel
  const recentOrders = orders.slice(0, 5);

  const userInitials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'HT';

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 md:py-20">
      <Container>
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Dashboard Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden sticky top-32">
              <div className="p-6 text-center border-b border-gray-50 bg-gray-50/50">
                <div className="w-20 h-20 bg-[#ff6600] rounded-3xl mx-auto mb-4 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 ring-4 ring-white font-black text-2xl tracking-tighter">
                  {userInitials}
                </div>
                <h3 className="font-black text-gray-900 tracking-tight text-lg truncate max-w-full px-2" title={displayName}>
                  {displayName}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                  {userProfile?.role === 'admin' ? 'Administrator' : 'Premium Member'}
                </p>
              </div>

              <div className="p-4 space-y-1">
                {[
                  { id: 'overview', label: 'Overview', icon: <User size={18} /> },
                  { id: 'orders', label: 'My Orders', icon: <Package size={18} /> },
                  { id: 'addresses', label: 'Addresses', icon: <MapPin size={18} /> },
                  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      activeTab === item.id 
                        ? 'bg-[#ff6600] text-white shadow-lg shadow-orange-500/20' 
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
                
                <div className="pt-4 mt-4 border-t border-gray-50">
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow space-y-8">
            {activeTab === 'overview' && (
              <>
                {/* Greeting */}
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                      Hello, <span className="text-[#ff6600]">{firstName}!</span> 👋
                    </h2>
                    <p className="text-gray-500 font-medium italic">Welcome to your dashboard. Here's what's happening with your account.</p>
                  </div>
                  <Link href="/products" className="bg-gray-900 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-[#ff6600] transition-all shadow-xl active:scale-95">
                    Start Shopping
                  </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all">
                      <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className="text-xl font-black text-gray-900 tracking-tight">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Orders */}
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-[10px] font-black text-[#ff6600] uppercase tracking-widest hover:underline cursor-pointer">View All</button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                          <th className="pb-4 px-4 font-black">Order ID</th>
                          <th className="pb-4 px-4 font-black">Date</th>
                          <th className="pb-4 px-4 font-black">Status</th>
                          <th className="pb-4 px-4 font-black">Total</th>
                          <th className="pb-4 px-4 font-black text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {recentOrders.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-gray-400 font-bold uppercase text-xs tracking-wider">
                              No recent orders placed yet. <Link href="/products" className="text-[#ff6600] hover:underline cursor-pointer ml-1">Start Shopping</Link>
                            </td>
                          </tr>
                        ) : (
                          recentOrders.map((order) => {
                            const dateString = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now';
                            return (
                              <tr key={order.id} className="border-b border-gray-55 group hover:bg-gray-55/50 transition-colors">
                                <td className="py-4 px-4 font-black text-gray-900 truncate max-w-[120px] uppercase">{order.trackingNumber || order.id || 'HT-Unknown'}</td>
                                <td className="py-4 px-4 text-gray-500 font-medium">{dateString}</td>
                                <td className="py-4 px-4">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    order.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                                    order.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                                    'bg-blue-50 text-blue-600'
                                  }`}>
                                    {order.status === 'Cancelled' ? <AlertCircle size={10} /> :
                                     order.status === 'Delivered' ? <CheckCircle2 size={10} /> :
                                     <Clock size={10} />}
                                    {order.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4 font-black text-gray-900">PKR {order.total.toLocaleString()}</td>
                                <td className="py-4 px-4 text-right">
                                  <Link href={`/tracking?id=${order.trackingNumber}`} className="text-gray-400 hover:text-[#ff6600] transition-colors inline-block">
                                    <ExternalLink size={18} />
                                  </Link>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Security Banner */}
                <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-orange-900/10">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-[#ff6600] rounded-2xl flex items-center justify-center text-white shrink-0">
                         <Bell size={28} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black tracking-tight">Enable Price Alerts</h4>
                        <p className="text-gray-400 text-sm font-medium">Get notified immediately when prices drop on your wishlist items.</p>
                      </div>
                   </div>
                   <button 
                     onClick={handleEnablePriceAlerts}
                     disabled={isAlertSettingLoading}
                     className={`px-8 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
                       priceAlertsEnabled 
                         ? "bg-green-600 text-white hover:bg-green-700 border-none" 
                         : "bg-white text-gray-900 hover:bg-[#ff6600] hover:text-white border-none"
                     }`}
                   >
                      {isAlertSettingLoading ? 'Updating...' : priceAlertsEnabled ? '✓ Enabled' : 'Setup Now'}
                   </button>
                </div>
              </>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8">
                {/* Profile Settings */}
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-8 flex items-center gap-3">
                    <User size={20} className="text-[#ff6600]" />
                    Profile Information
                  </h3>
                  
                  <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                      <input 
                        type="text" 
                        value={profileName} 
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#ff6600]/10 focus:bg-white transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                      <input 
                        type="email" 
                        value={user.email || ''} 
                        disabled
                        className="w-full bg-gray-100 border-none rounded-2xl p-4 font-bold text-gray-400 cursor-not-allowed outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Phone Number</label>
                      <input 
                        type="tel" 
                        value={profilePhone} 
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="e.g. +92 300 1234567"
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-900 focus:ring-2 focus:ring-[#ff6600]/10 focus:bg-white transition-all outline-none" 
                      />
                    </div>
                    
                    <div className="flex flex-col justify-end gap-2">
                      {saveSuccess && (
                        <p className="text-xs font-bold text-green-600 ml-4 animate-in fade-in">✓ Profile updated successfully!</p>
                      )}
                      {saveError && (
                        <p className="text-xs font-bold text-red-500 ml-4 animate-in fade-in">✗ {saveError}</p>
                      )}
                      <button 
                        type="submit"
                        disabled={isUpdating}
                        className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#ff6600] transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Notifications */}
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-8 flex items-center gap-3">
                    <Bell size={20} className="text-[#ff6600]" />
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Order Updates', desc: 'Receive SMS and Email for every step of your order' },
                      { title: 'Price Alerts', desc: 'Get notified when items in your wishlist drop in price' },
                      { title: 'Newsletter', desc: 'Stay updated with new solar technology and seasonal discounts' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="font-bold text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff6600]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security */}
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-8 flex items-center gap-3">
                    <ShieldCheck size={20} className="text-[#ff6600]" />
                    Account Security
                  </h3>
                  <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400">
                        <Lock size={20} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm uppercase">Two-Factor Authentication</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Recommended for better security</p>
                      </div>
                    </div>
                    <button className="bg-white border border-gray-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-900 hover:bg-black hover:text-white hover:border-black transition-all cursor-pointer">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-8 flex items-center gap-3 border-b border-gray-50 pb-4">
                    <Package size={20} className="text-[#ff6600]" />
                    Order History
                  </h3>

                  {isOrdersLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-10 h-10 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin mb-4"></div>
                      <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Loading orders...</span>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gray-55 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <ShoppingBag size={24} />
                      </div>
                      <p className="font-bold text-gray-700 uppercase text-sm tracking-wider">No orders placed yet</p>
                      <p className="text-xs text-gray-400 mt-1 mb-8">Once you purchase solar equipment, your orders will appear here.</p>
                      <Link href="/products" className="bg-[#ff6600] text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all">
                        Browse Store
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => {
                        const dateString = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now';
                        return (
                          <div key={order.id || order.trackingNumber} className="bg-gray-55 p-6 rounded-3xl border border-gray-100/50 space-y-4 hover:border-orange-100 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                              <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Tracking Number</span>
                                <span className="font-black text-gray-900 tracking-wider text-sm uppercase">{order.trackingNumber}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Date Placed</span>
                                <span className="text-xs font-bold text-gray-600">{dateString}</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Status</span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                  order.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                                  order.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                                  'bg-blue-50 text-blue-600'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Total Amount</span>
                                <span className="font-black text-gray-900 text-sm">PKR {order.total.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Products summary list */}
                            <div className="space-y-3">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 p-1 flex items-center justify-center shrink-0">
                                      <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-gray-800 line-clamp-1 leading-tight">{item.title}</p>
                                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Qty: {item.quantity}</p>
                                    </div>
                                  </div>
                                  <p className="font-black text-gray-900">PKR {(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                              {(order.status === 'Pending' || order.status === 'Processing') && order.id && (
                                <button 
                                  onClick={() => handleCancelOrderClick(order.id!, order.trackingNumber)}
                                  className="bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-500 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                                >
                                  Cancel Order
                                </button>
                              )}
                              <Link href={`/tracking?id=${order.trackingNumber}`} className="bg-white border border-gray-200 text-gray-700 hover:bg-[#ff6600] hover:text-white hover:border-[#ff6600] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
                                Track Package
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white p-20 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
                    <AlertCircle size={40} />
                 </div>
                 <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">Addresses Section</h3>
                 <p className="text-gray-500 font-medium max-w-xs">This feature is coming soon in the next update. Stay tuned!</p>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Cancellation Confirmation Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-gray-100 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto text-red-500 shadow-lg shadow-red-100">
                <AlertCircle size={32} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Cancel Order</h3>
                <p className="text-gray-500 font-medium text-sm">
                  Are you sure you want to cancel order <span className="font-bold text-gray-900 uppercase tracking-wider">{cancelTrackingNum}</span>? This action cannot be undone.
                </p>
              </div>

              {cancelError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold text-left">
                  ⚠ {cancelError}
                </div>
              )}

              {cancelSuccess && (
                <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-xs font-bold text-center">
                  ✓ {cancelSuccess}
                </div>
              )}

              {!cancelSuccess && (
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setOrderToCancel(null);
                      setCancelTrackingNum(null);
                    }}
                    disabled={isCancelling}
                    className="flex-grow bg-gray-50 hover:bg-gray-100 text-gray-700 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={confirmCancelOrder}
                    disabled={isCancelling}
                    className="flex-grow bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCancelling ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Confirm Cancel'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
