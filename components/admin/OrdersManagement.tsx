'use client';

import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus, updateOrderPaymentDetails, deleteOrder, Order } from '@/services/firestore';
import { Search, Eye, Clock, CheckCircle2, Truck, X, Phone, User, MapPin, CreditCard, ShoppingBag, Calendar, AlertTriangle, Package, Building2, ExternalLink, Image, Building } from 'lucide-react';

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Order['status']>('All');

  // Modal active state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders on mount
  useEffect(() => {
    loadOrders();
  }, []);

  // Debounce search changes to prevent redundant render thrashes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const allOrders = await getAllOrders();
      // Sort orders descending by createdAt
      const sorted = allOrders.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setOrders(sorted);
      setFilteredOrders(sorted);
    } catch (err) {
      console.error("Failed to load orders for administration:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Search & Filter synchronization with debouncing
  useEffect(() => {
    let result = orders;

    if (statusFilter !== 'All') {
      result = result.filter(order => order.status === statusFilter);
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(order => 
        (order.trackingNumber && order.trackingNumber.toLowerCase().includes(q)) ||
        (order.shippingAddress?.fullName && order.shippingAddress.fullName.toLowerCase().includes(q)) ||
        (order.shippingAddress?.phoneNumber && order.shippingAddress.phoneNumber.includes(q))
      );
    }

    setFilteredOrders(result);
  }, [debouncedSearch, statusFilter, orders]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Optimistic UI update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
      
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error("Failed to transition order status:", err);
      alert("Error: Failed to update order status. Please try again.");
      loadOrders(); // Rollback to actual db state
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5"><Clock size={10} /> Pending</span>;
      case 'Processing':
        return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5"><Package size={10} /> Processing</span>;
      case 'Shipped':
        return <span className="bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5"><Truck size={10} /> Shipped</span>;
      case 'Delivered':
        return <span className="bg-green-50 text-green-600 border border-green-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5"><CheckCircle2 size={10} /> Delivered</span>;
      case 'Cancelled':
        return <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5"><X size={10} /> Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* CMS Header & Search Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Order Management</h2>
          <p className="text-gray-500 text-sm font-medium">Review customer purchases, payment verification status, and ship packages.</p>
        </div>
        <button 
          onClick={loadOrders}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
        >
          Refresh Feed
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="w-full md:w-96 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by ID, Name or Phone..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl py-3.5 pl-12 pr-6 outline-none font-bold text-gray-900 transition-all text-xs"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                statusFilter === status 
                  ? 'bg-gray-900 text-white shadow-sm' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Grid */}
      {isLoading ? (
        <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Order Registry...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-55 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <ShoppingBag size={24} />
          </div>
          <p className="font-bold text-gray-700 uppercase text-sm tracking-wider">No matching orders</p>
          <p className="text-xs text-gray-400 mt-1">Try modifying your search query or status filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="py-5 px-6">Tracking ID</th>
                  <th className="py-5 px-6">Customer</th>
                  <th className="py-5 px-6">Date</th>
                  <th className="py-5 px-6">Total Amount</th>
                  <th className="py-5 px-6">Payment</th>
                  <th className="py-5 px-6">Status</th>
                  <th className="py-5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-gray-700">
                {filteredOrders.map((order) => {
                  const dateString = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now';
                  return (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                      <td className="py-5 px-6 font-black text-gray-900 uppercase tracking-wider">
                        {order.trackingNumber}
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{order.shippingAddress?.fullName}</span>
                          <span className="text-[10px] text-gray-400 font-bold mt-0.5">{order.shippingAddress?.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-gray-500 font-semibold">
                        {dateString}
                      </td>
                      <td className="py-5 px-6 font-black text-gray-950">
                        PKR {order.total.toLocaleString()}
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          order.paymentMethod === 'COD' 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-orange-50 text-[#ff6600] border border-orange-100'
                        }`}>
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          {(order.status === 'Pending' || order.status === 'Processing') && (
                            <button 
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to cancel order ${order.trackingNumber}?`)) {
                                  handleStatusChange(order.id!, 'Cancelled');
                                }
                              }}
                              className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-2.5 rounded-xl transition-all cursor-pointer"
                              title="Cancel Order"
                            >
                              <X size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="bg-gray-50 text-gray-500 hover:bg-black hover:text-white p-2.5 rounded-xl transition-all cursor-pointer"
                            title="Inspect Order Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Modal Backdrop */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gray-900 p-6 md:p-8 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black text-[#ff6600] uppercase tracking-widest">Order Details Inspector</span>
                <h3 className="text-2xl font-black tracking-tight uppercase mt-1 flex items-center gap-3">
                  {selectedOrder.trackingNumber}
                  {getStatusBadge(selectedOrder.status)}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 bg-white/10 hover:bg-[#ff6600] text-white rounded-full flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-grow custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Customer Specs */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <User size={18} className="text-[#ff6600]" />
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Customer Sheet</h4>
                  </div>
                  
                  <div className="space-y-4 text-xs font-semibold text-gray-600">
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Full Name</span>
                      <span className="font-bold text-gray-900 text-sm">{selectedOrder.shippingAddress?.fullName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Phone Number</span>
                      <a href={`tel:${selectedOrder.shippingAddress?.phoneNumber}`} className="font-black text-[#ff6600] text-sm flex items-center gap-1 hover:underline">
                        <Phone size={12} fill="currentColor" /> {selectedOrder.shippingAddress?.phoneNumber}
                      </a>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Email Address</span>
                      <span className="font-bold text-gray-900">{selectedOrder.shippingAddress?.email}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Shipping details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                    <MapPin size={18} className="text-[#ff6600]" />
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Delivery Logistics</h4>
                  </div>
                  
                  <div className="space-y-4 text-xs font-semibold text-gray-600">
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Address</span>
                      <span className="font-bold text-gray-900 text-sm">{selectedOrder.shippingAddress?.street}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">City / Province</span>
                      <span className="font-bold text-gray-900">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.province}</span>
                    </div>
                    {selectedOrder.shippingAddress?.notes && (
                      <div>
                        <span className="text-[9px] font-black text-red-400 uppercase tracking-wider block">Logistics Note</span>
                        <p className="text-xs font-semibold text-gray-700 italic bg-gray-50 p-3.5 rounded-xl border border-gray-100 mt-1">"{selectedOrder.shippingAddress.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Details & Verification Section */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-900 border border-gray-200 shrink-0">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <h5 className="font-black text-xs text-gray-900 uppercase tracking-widest">Payment Settlement Information</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Method: {selectedOrder.paymentMethod}</span>
                        <span className="text-gray-300">•</span>
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          selectedOrder.paymentStatus === 'Paid' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {selectedOrder.paymentStatus === 'Paid' ? 'Paid & Verified' : 'Unpaid / Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.paymentMethod === 'Bank Transfer' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const isPaid = selectedOrder.paymentStatus === 'Paid';
                          const nextStatusValue = isPaid ? 'Unpaid' : 'Paid';
                          const nextVerifiedValue = !isPaid;
                          
                          try {
                            // Update order data in Firestore
                            await updateOrderPaymentDetails(selectedOrder.id!, {
                              paymentStatus: nextStatusValue as any,
                              paymentVerified: nextVerifiedValue
                            });
                            
                            // Optimistically update local selectedOrder & order feed
                            setSelectedOrder(prev => prev ? { ...prev, paymentStatus: nextStatusValue as any, paymentVerified: nextVerifiedValue } : null);
                            setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, paymentStatus: nextStatusValue as any, paymentVerified: nextVerifiedValue } : o));
                            
                            // Auto-advance order status to Processing if marked as Paid
                            if (nextStatusValue === 'Paid' && selectedOrder.status === 'Pending') {
                              await handleStatusChange(selectedOrder.id!, 'Processing');
                            }
                          } catch (err) {
                            console.error("Failed to toggle payment status:", err);
                            alert("Failed to update payment status.");
                          }
                        }}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-sm hover:shadow ${
                          selectedOrder.paymentStatus === 'Paid'
                            ? 'bg-amber-55 hover:bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-[#ff6600] hover:bg-orange-600 text-white'
                        }`}
                      >
                        {selectedOrder.paymentStatus === 'Paid' ? 'Mark as Unpaid' : 'Verify & Mark as Paid'}
                      </button>
                    </div>
                  )}
                </div>

                {selectedOrder.paymentMethod === 'Bank Transfer' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Bank Details Visual Preview */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
                        <Building size={14} className="text-purple-700" />
                        <span className="font-black text-gray-900 uppercase tracking-widest text-[9px]">Destination Account Details</span>
                      </div>
                      
                      <div className="space-y-3 font-semibold text-gray-600">
                        <div className="grid grid-cols-2">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Bank Name:</span>
                          <span className="text-gray-900 font-bold">Meezan Bank</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Account Title:</span>
                          <span className="text-gray-900 font-bold">HYDER TRADERS</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Account Number:</span>
                          <span className="text-gray-900 font-bold font-mono">16110109941425</span>
                        </div>
                      </div>
                    </div>

                    {/* Screenshot Preview Module */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col justify-between min-h-[140px]">
                      <div className="flex items-center justify-between border-b border-gray-55 pb-2">
                        <div className="flex items-center gap-2">
                          <Image size={14} className="text-[#ff6600]" />
                          <span className="font-black text-gray-900 uppercase tracking-widest text-[9px]">Receipt Screenshot proof</span>
                        </div>
                        {selectedOrder.paymentScreenshot && (
                          <a 
                            href={selectedOrder.paymentScreenshot} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[#ff6600] font-black text-[9px] uppercase hover:underline flex items-center gap-1"
                          >
                            Open Fullscreen <ExternalLink size={10} />
                          </a>
                        )}
                      </div>

                      {selectedOrder.paymentScreenshot ? (
                        <div className="flex items-center gap-4 mt-3 flex-grow">
                          <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 p-0.5 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                            <img src={selectedOrder.paymentScreenshot} alt="Receipt Proof" className="max-w-full max-h-full object-contain rounded-lg" />
                          </div>
                          <div className="space-y-1 col-span-2">
                            <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-black uppercase px-2 py-0.5 rounded-full inline-block">
                              Receipt Attached
                            </span>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">Verify that the transferred amount matches PKR {selectedOrder.total.toLocaleString()} on your bank log statements.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center flex-grow py-4 text-gray-400">
                          <AlertTriangle size={18} className="mb-2 text-amber-500" />
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-700">No receipt attached yet</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">The customer hasn't uploaded a transfer screenshot proof.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <ShoppingBag size={18} className="text-[#ff6600]" />
                  <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Ordered Package Items</h4>
                </div>

                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-55 p-3 rounded-2xl border border-gray-100/50 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-100 p-1 flex items-center justify-center shrink-0">
                          <img src={item.image} alt={item.title} className="max-w-full max-h-full object-contain" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1 leading-tight">{item.title}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-black text-gray-950">PKR {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-sm">
                    <span className="font-black text-gray-900 uppercase tracking-widest">Total Amount</span>
                    <span className="text-lg font-black text-[#ff6600]">PKR {selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls - Status State Changers */}
            <div className="bg-gray-50 border-t border-gray-100 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0 mr-2">Update Status</span>
                <select 
                  value={selectedOrder.status}
                  onChange={e => handleStatusChange(selectedOrder.id!, e.target.value as Order['status'])}
                  className="bg-white border-2 border-gray-200 focus:border-[#ff6600]/20 rounded-xl px-4 py-2 font-black uppercase text-[10px] tracking-widest text-gray-800 outline-none cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button 
                  onClick={async () => {
                    if (window.confirm(`⚠️ PERMANENT DELETION WARNING:\n\nAre you sure you want to permanently delete order ${selectedOrder.trackingNumber}?\nThis action CANNOT be undone.`)) {
                      try {
                        await deleteOrder(selectedOrder.id!);
                        setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
                        setSelectedOrder(null);
                      } catch (err) {
                        console.error("Failed to delete order:", err);
                        alert("Failed to delete order from database.");
                      }
                    }
                  }}
                  className="bg-red-600 border border-red-700 text-white hover:bg-red-700 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  Delete Order
                </button>

                {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
                  <button 
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to cancel order ${selectedOrder.trackingNumber}?`)) {
                        handleStatusChange(selectedOrder.id!, 'Cancelled');
                      }
                    }}
                    className="bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-500 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}
                <a 
                  href={`https://wa.me/${selectedOrder.shippingAddress?.phoneNumber?.replace(/\+/g, '')}?text=Hi%20${selectedOrder.shippingAddress?.fullName},%20this%20is%20Hyder%20Traders%20contacting%20you%20regarding%20your%20order%20${selectedOrder.trackingNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white border border-gray-200 text-gray-700 hover:bg-black hover:text-white hover:border-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone size={12} fill="currentColor" /> Chat with customer
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
