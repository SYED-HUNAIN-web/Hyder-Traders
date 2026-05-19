'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Container from '@/components/shared/Container';
import { getOrderByTrackingNumber, Order } from '@/services/firestore';
import { useSearchParams } from 'next/navigation';
import { Search, Package, Truck, CheckCircle2, MapPin, Calendar, Clock, AlertCircle, ShoppingBag, X } from 'lucide-react';

const TrackingContent = () => {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-search if a tracking key is passed in the URL (e.g. from checkout redirect)
  useEffect(() => {
    const urlId = searchParams.get('id');
    if (urlId) {
      setOrderId(urlId);
      performTrackingSearch(urlId);
    }
  }, [searchParams]);

  const performTrackingSearch = async (trackingCode: string) => {
    if (!trackingCode.trim()) return;
    setIsSearching(true);
    setErrorMessage(null);
    setHasSearched(true);
    setOrder(null);

    try {
      const data = await getOrderByTrackingNumber(trackingCode.trim().toUpperCase());
      if (data) {
        setOrder(data);
      } else {
        setErrorMessage(`No order found with tracking number "${trackingCode}". Please verify the code.`);
      }
    } catch (err) {
      console.error("Tracking search error:", err);
      setErrorMessage("An error occurred while looking up your order. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performTrackingSearch(orderId);
  };

  // Build steps dynamically based on current Firestore status
  const getStatusSteps = (status: Order['status'], dateObj: any) => {
    const orderDate = dateObj?.toDate ? dateObj.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now';
    
    const steps = [
      { status: 'Order Placed', desc: 'Awaiting confirmation', icon: <Calendar size={18} />, completed: true, current: status === 'Pending' },
      { status: 'Processing', desc: 'Item is being packed', icon: <Package size={18} />, completed: ['Processing', 'Shipped', 'Delivered'].includes(status), current: status === 'Processing' },
      { status: 'Shipped', desc: 'In transit to destination', icon: <Truck size={18} />, completed: ['Shipped', 'Delivered'].includes(status), current: status === 'Shipped' },
      { status: 'Delivered', desc: 'Successfully delivered', icon: <CheckCircle2 size={18} />, completed: status === 'Delivered', current: status === 'Delivered' },
    ];
    return steps;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
      {/* Header Section */}
      <section className="bg-[#1a1a1a] pt-20 pb-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ff6600_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        
        <Container className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Track Your <span className="text-[#ff6600]">Order</span></h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">Enter your tracking number (e.g. HT-XXXXXX) to see the real-time status of your solar equipment shipment.</p>
        </Container>
      </section>

      {/* Search Bar Container */}
      <Container className="-mt-16 relative z-30">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff6600] transition-colors">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Enter Tracking Number (e.g. HT-K8D9J1)" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl py-5 px-16 outline-none font-bold text-gray-900 transition-all text-sm uppercase placeholder:normal-case"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isSearching}
              className="bg-[#ff6600] text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 cursor-pointer shrink-0"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Track Order'
              )}
            </button>
          </form>
          
          <p className="mt-6 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
            Order ID can be found in your order confirmation screen, WhatsApp receipt, or dashboard.
          </p>
        </div>
      </Container>

      {/* Error Message */}
      {errorMessage && (
        <Container className="mt-8">
          <div className="max-w-4xl mx-auto bg-red-50 border border-red-100 rounded-3xl p-6 flex items-center gap-4 text-red-600 font-bold text-sm animate-shake">
            <AlertCircle size={24} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </Container>
      )}

      {/* Tracking Results */}
      {order && (
        <Container className="mt-12">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Status Progress */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 border-b border-gray-50 pb-8">
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current Status</div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                    {order.status === 'Cancelled' ? (
                      <span className="text-red-600 uppercase">Order Cancelled</span>
                    ) : (
                      order.status
                    )}
                  </h2>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tracking Number</div>
                  <div className="text-xl font-black text-[#ff6600] tracking-wider uppercase bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full inline-block mt-1">{order.trackingNumber}</div>
                </div>
              </div>

              {order.status === 'Cancelled' ? (
                <div className="bg-red-50 rounded-3xl p-6 border border-red-100 text-red-600 flex gap-4 text-sm font-bold">
                  <AlertCircle size={24} className="shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black uppercase tracking-wider text-red-700">This order has been cancelled</h4>
                    <p className="text-xs font-semibold text-red-500 mt-1 leading-relaxed">
                      If you believe this was an error or would like to reactivate this order, please contact our helpline at **+92 3001030542** immediately.
                    </p>
                  </div>
                </div>
              ) : (
                /* Progress Timeline */
                <div className="relative flex flex-col md:flex-row justify-between gap-8 pt-4">
                  {/* Connector Line */}
                  <div className="hidden md:block absolute top-7 left-0 w-full h-1 bg-gray-100 -z-0">
                    <div 
                      className="h-full bg-[#ff6600] transition-all duration-1000" 
                      style={{ 
                        width: order.status === 'Pending' ? '0%' : 
                               order.status === 'Processing' ? '33%' : 
                               order.status === 'Shipped' ? '66%' : '100%' 
                      }}
                    ></div>
                  </div>

                  {getStatusSteps(order.status, order.createdAt).map((step, i) => (
                    <div key={i} className="flex md:flex-col items-center gap-4 relative z-10">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                        step.completed ? 'bg-[#ff6600] text-white shadow-orange-500/30' : 'bg-white text-gray-300 border-2 border-gray-100'
                      } ${step.current ? 'ring-4 ring-orange-100 scale-110' : ''}`}>
                        {step.icon}
                      </div>
                      <div className="text-left md:text-center">
                        <div className={`text-sm font-black tracking-tight ${step.completed ? 'text-gray-900' : 'text-gray-300'}`}>
                          {step.status}
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Delivery Address */}
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#ff6600]">
                      <MapPin size={20} />
                    </div>
                    <h3 className="font-black text-gray-900 uppercase tracking-wider text-xs">Shipping Address</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-black text-gray-900 text-base">{order.shippingAddress.fullName}</p>
                    <p className="text-gray-500 font-bold">{order.shippingAddress.street}</p>
                    <p className="text-gray-500 font-bold">
                      {order.shippingAddress.city}, {order.shippingAddress.province}
                    </p>
                    <p className="text-gray-900 font-black mt-4">{order.shippingAddress.phoneNumber}</p>
                    <p className="text-xs text-gray-400 font-medium italic mt-2">{order.shippingAddress.email}</p>
                  </div>
                </div>

                {order.shippingAddress.notes && (
                  <div className="mt-6 pt-4 border-t border-gray-50">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1">Customer Delivery Notes</span>
                    <p className="text-xs text-gray-500 font-semibold italic bg-gray-55 p-3.5 rounded-xl border border-gray-100">"{order.shippingAddress.notes}"</p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#ff6600]">
                    <ShoppingBag size={20} />
                  </div>
                  <h3 className="font-black text-gray-900 uppercase tracking-wider text-xs">Items in Package</h3>
                </div>
                
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden border border-gray-50 p-1 flex items-center justify-center shrink-0">
                          <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-900 line-clamp-1 leading-tight">{item.title}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-xs font-black text-gray-900 whitespace-nowrap">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}

                  <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-gray-500 font-medium">
                      <span>Subtotal</span>
                      <span className="text-gray-900 font-black">Rs. {order.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 font-medium">
                      <span>Shipping Fee</span>
                      <span className="text-green-600 font-black uppercase text-[10px] tracking-widest italic">Free</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500 font-medium pt-1">
                      <span>Payment Method</span>
                      <span className="text-gray-800 font-black uppercase tracking-wider">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Total Paid</p>
                      <p className="text-xl font-black text-[#ff6600]">Rs. {order.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help CTA */}
            <div className="bg-orange-50/50 p-8 rounded-[2rem] border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 bg-[#ff6600] rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 tracking-tight">Need assistance with your delivery?</h4>
                  <p className="text-gray-500 text-sm font-semibold mt-0.5">Our support team is available on WhatsApp to expedite your order validation.</p>
                </div>
              </div>
              <a 
                href={`https://wa.me/923001030542?text=Hi%20Hyder%20Traders,%20please%20verify%20my%20order%20with%20tracking%20number%20${order.trackingNumber}`} 
                target="_blank"
                rel="noreferrer"
                className="bg-white text-[#ff6600] border-2 border-[#ff6600] px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#ff6600] hover:text-white transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Verify on WhatsApp
              </a>
            </div>
          </div>
        </Container>
      )}
    </div>
  );
};

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-12 h-12 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
