'use client';

import React, { useState, useEffect } from 'react';
import Container from '@/components/shared/Container';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import AuthRequired from '@/components/auth/AuthRequired';
import { getProductById, updateProduct, createOrder, getShippingSettings, ShippingSettings } from '@/services/firestore';
import { ShieldCheck, Truck, ChevronRight, CheckCircle2, AlertTriangle, Building, CreditCard, Copy, Check, Upload, Trash2, Building2, PhoneCall, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const CITIES = [
  'Hyderabad', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 
  'Peshawar', 'Quetta', 'Faisalabad', 'Multan', 'Sialkot', 
  'Gujranwala', 'Sukkur', 'Sargodha', 'Other'
];

const PROVINCES = ['Sindh', 'Punjab', 'Balochistan', 'Khyber Pakhtunkhwa', 'Gilgit Baltistan', 'Azad Kashmir'];

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, userProfile } = useAuth();
  
  const [isOrdered, setIsOrdered] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [generatedTracking, setGeneratedTracking] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [placedOrderTotal, setPlacedOrderTotal] = useState(0);

  const copyToClipboard = (text: string, type: 'account' | 'iban') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    }
  };

  const handleReceiptUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingReceipt(true);
    setReceiptFileName(file.name);
    
    try {
      // 100% bulletproof local image compression and base64 generation.
      // This eliminates dependencies on remote Firebase Storage buckets which may be inactive or restricted!
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
            setReceiptUrl(compressedBase64);
          } else {
            setReceiptUrl(event.target?.result as string);
          }
          setIsUploadingReceipt(false);
        };
        img.onerror = () => {
          // Graceful fallback to raw file reader in case image load fails
          setReceiptUrl(event.target?.result as string);
          setIsUploadingReceipt(false);
        };
      };
      reader.onerror = () => {
        alert("Failed to read the image file. Please try another file.");
        setIsUploadingReceipt(false);
      };
    } catch (err) {
      console.error("Local uploader compression failure:", err);
      alert("Error processing image file. Please try again.");
      setIsUploadingReceipt(false);
    }
  };

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    type: 'free',
    amount: 0,
    thresholdEnabled: false,
    thresholdAmount: 0
  });

  // Load Shipping Settings from Firestore
  useEffect(() => {
    async function loadShipping() {
      try {
        const data = await getShippingSettings();
        setShippingSettings(data);
      } catch (err) {
        console.error("Failed to load global shipping settings for checkout:", err);
      }
    }
    loadShipping();
  }, []);

  const baseShipping = shippingSettings.type === 'fixed' ? shippingSettings.amount : 0;
  const isThresholdMet = !!(
    shippingSettings.thresholdEnabled &&
    shippingSettings.thresholdAmount &&
    cartTotal >= shippingSettings.thresholdAmount
  );
  
  // Waive baseline shipping if cart total meets free shipping threshold
  const activeBaseShipping = isThresholdMet ? 0 : baseShipping;

  const customSurcharges = cart.reduce((sum, item) => {
    const itemCharge = (item.shippingCharge !== undefined && item.shippingCharge !== null)
      ? item.shippingCharge
      : 0;
    return sum + (itemCharge * item.quantity);
  }, 0);

  const shippingCost = activeBaseShipping + customSurcharges;
  const orderTotal = cartTotal + shippingCost;

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCity, setSelectedCity] = useState('Hyderabad');
  const [customCity, setCustomCity] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('Sindh');
  const [streetAddress, setStreetAddress] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Bank Transfer'>('COD');

  // Autofill form if logged-in user profiles exist
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setEmail(userProfile.email || '');
    } else if (user) {
      setFullName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user, userProfile]);

  // Clipboard paste listener for fast-track receipt uploads
  useEffect(() => {
    if (paymentMethod !== 'Bank Transfer') return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleReceiptUpload(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [paymentMethod]);

  const generateTrackingNumber = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `HT-${code}`;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setIsPlacingOrder(true);
    setErrorMessage(null);

    // Double-wall security: Abort instantly if user account is blocked
    if (userProfile?.blocked) {
      setErrorMessage("Your account has been blocked. You are not allowed to place orders on HYDER TRADERS.");
      setIsPlacingOrder(false);
      return;
    }

    try {
      // 1. Verify live stock for all cart items in Firestore
      for (const item of cart) {
        const product = await getProductById(item.id);
        if (!product) {
          throw new Error(`Product "${item.title}" no longer exists in our catalog.`);
        }
        const currentStock = product.stock !== undefined ? product.stock : 10;
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for "${item.title}". Only ${currentStock} units available.`);
        }
      }

      // 2. Generate tracking number
      const trackingCode = generateTrackingNumber();
      setGeneratedTracking(trackingCode);

      // 3. Finalize city address
      const finalCity = selectedCity === 'Other' ? customCity : selectedCity;
      if (selectedCity === 'Other' && !customCity.trim()) {
        throw new Error('Please specify your custom city.');
      }

      // 4. Structure Order Data
      const orderData: any = {
        userId: user ? user.uid : 'guest',
        trackingNumber: trackingCode,
        items: cart.map(item => ({
          productId: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.images[0]
        })),
        total: orderTotal,
        status: 'Pending' as const,
        shippingAddress: {
          fullName,
          email,
          phoneNumber,
          street: streetAddress,
          city: finalCity,
          province: selectedProvince
        },
        paymentMethod
      };

      if (specialNotes.trim()) {
        orderData.shippingAddress.notes = specialNotes.trim();
      }

      if (paymentMethod === 'Bank Transfer') {
        if (!receiptUrl) {
          throw new Error('Please upload your bank transfer receipt screenshot to complete the order.');
        }
        orderData.paymentScreenshot = receiptUrl;
        orderData.paymentStatus = 'Unpaid';
        orderData.paymentVerified = false;
      }

      // 5. Save Order in Firestore
      await createOrder(orderData);

      // 6. Reduce stock and update database
      for (const item of cart) {
        const product = await getProductById(item.id);
        if (product) {
          const currentStock = product.stock !== undefined ? product.stock : 10;
          const newStock = Math.max(0, currentStock - item.quantity);
          const newStatus = newStock > 0 ? 'In Stock' : 'Out of Stock';
          await updateProduct(product.id, {
            stock: newStock,
            stockStatus: newStatus
          });
        }
      }

      // 7. Success triggers
      setPlacedOrderTotal(orderTotal);
      clearCart();
      setIsOrdered(true);
    } catch (err: any) {
      console.error("Order placement failed:", err);
      setErrorMessage(err.message || 'An error occurred while placing your order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Authentication Gate
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#fafafa]">
        <div className="w-12 h-12 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return (
      <AuthRequired 
        redirectPath="/checkout" 
        message="To place an order and finalize your checkout, you must log in or sign up first." 
      />
    );
  }

  if (isOrdered) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-20 px-4">
        <Container>
          <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-orange-500/5 border border-gray-100 text-center">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-8 animate-in zoom-in duration-500">
              <CheckCircle2 size={48} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Order Placed Successfully!</h1>
            <p className="text-gray-500 font-medium mb-6">Thank you for shopping with Hyder Traders.</p>
            
            {/* Order details block */}
            <div className="bg-gray-55 rounded-3xl p-6 border border-gray-100 mb-10 text-left space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tracking Number</span>
                <span className="text-sm font-black text-[#ff6600] tracking-wider bg-orange-50 border border-orange-100 px-3 py-1 rounded-full uppercase">{generatedTracking}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Method</span>
                <span className="text-xs font-black text-gray-800 uppercase tracking-wider">{paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Bank Transfer'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                <span className="text-base font-black text-gray-900">PKR {placedOrderTotal.toLocaleString()}</span>
              </div>
            </div>

            {paymentMethod === 'Bank Transfer' && (
              <div className="bg-orange-50/50 rounded-3xl p-6 border border-orange-100/50 mb-10 text-left space-y-3">
                <h4 className="text-xs font-black text-orange-700 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle size={14} /> Action Required
                </h4>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  Please transfer the total amount of **PKR {placedOrderTotal.toLocaleString()}** to our bank account. Once transferred, share a screenshot of the receipt with your Order ID on WhatsApp at **+92 3001030542** to verify and release your shipment.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/tracking?id=${generatedTracking}`} className="bg-[#ff6600] text-white px-8 py-4.5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl shadow-orange-500/20 active:scale-95">
                Track Order
              </Link>
              <Link href="/" className="bg-gray-100 text-gray-600 px-8 py-4.5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all active:scale-95">
                Back to Home
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white py-20 px-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
          <AlertTriangle size={36} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-xs font-medium">Add products to your cart before proceeding to checkout.</p>
        <Link href="/products" className="bg-[#ff6600] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 md:py-20">
      <Container>
        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-10">
          {/* Checkout Info Form */}
          <div className="lg:w-2/3 space-y-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>
              <p className="text-gray-500 text-sm mt-1">Please provide your delivery information to complete the purchase.</p>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-3xl p-5 text-sm font-bold flex items-center gap-3 animate-shake">
                <AlertTriangle size={20} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Contact Info */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-3 uppercase tracking-wider">
                <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center text-[#ff6600] text-xs font-black">1</div>
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Muhammad Ahmed" 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl p-4 transition-all font-bold text-gray-900 outline-none text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Phone Number</label>
                  <input 
                    required 
                    type="tel" 
                    placeholder="e.g. +92 300 1234567" 
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl p-4 transition-all font-bold text-gray-900 outline-none text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                <input 
                  required 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl p-4 transition-all font-bold text-gray-900 outline-none text-sm" 
                />
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-3 uppercase tracking-wider">
                <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center text-[#ff6600] text-xs font-black">2</div>
                Delivery Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">City</label>
                  <select 
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl p-4 transition-all font-bold text-gray-900 outline-none text-sm cursor-pointer"
                  >
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Province</label>
                  <select 
                    value={selectedProvince}
                    onChange={e => setSelectedProvince(e.target.value)}
                    className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl p-4 transition-all font-bold text-gray-900 outline-none text-sm cursor-pointer"
                  >
                    {PROVINCES.map(prov => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedCity === 'Other' && (
                <div className="space-y-2 animate-in slide-in-from-top duration-200">
                  <label className="text-[10px] font-black text-[#ff6600] uppercase tracking-widest ml-4">Specify Custom City</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Enter your city name" 
                    value={customCity}
                    onChange={e => setCustomCity(e.target.value)}
                    className="w-full bg-gray-55 border-2 border-[#ff6600]/10 focus:border-[#ff6600]/30 focus:bg-white rounded-2xl p-4 transition-all font-bold text-gray-900 outline-none text-sm" 
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Street Address</label>
                <input 
                  required 
                  type="text" 
                  placeholder="House #, Street name, Block/Sector, Area" 
                  value={streetAddress}
                  onChange={e => setStreetAddress(e.target.value)}
                  className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl p-4 transition-all font-bold text-gray-900 outline-none text-sm" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Order Notes (Optional)</label>
                <textarea 
                  rows={3} 
                  placeholder="Special instructions for shipping (e.g. Leave with neighbor, Call before arriving...)" 
                  value={specialNotes}
                  onChange={e => setSpecialNotes(e.target.value)}
                  className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl p-4 transition-all font-bold text-gray-900 outline-none text-sm placeholder:text-gray-300" 
                />
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-3 uppercase tracking-wider">
                <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center text-[#ff6600] text-xs font-black">3</div>
                Payment Method
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cash on Delivery */}
                <label 
                  onClick={() => setPaymentMethod('COD')}
                  className={`relative flex items-center gap-4 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'COD' 
                      ? 'border-[#ff6600] bg-orange-50/30 shadow-md shadow-orange-100/10' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    value="COD" 
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="w-5 h-5 accent-[#ff6600] cursor-pointer" 
                  />
                  <div className="flex flex-col">
                    <span className="font-black text-gray-900 text-sm uppercase">Cash on Delivery</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Pay in cash on receipt</span>
                  </div>
                </label>

                {/* Bank Transfer */}
                <label 
                  onClick={() => setPaymentMethod('Bank Transfer')}
                  className={`relative flex items-center gap-4 p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                    paymentMethod === 'Bank Transfer' 
                      ? 'border-[#ff6600] bg-orange-50/30 shadow-md shadow-orange-100/10' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    value="Bank Transfer" 
                    checked={paymentMethod === 'Bank Transfer'}
                    onChange={() => setPaymentMethod('Bank Transfer')}
                    className="w-5 h-5 accent-[#ff6600] cursor-pointer" 
                  />
                  <div className="flex flex-col">
                    <span className="font-black text-gray-900 text-sm uppercase">Bank Transfer</span>
                    <span className="text-[9px] text-[#ff6600] font-black uppercase tracking-wider mt-0.5">Advance Payment Discount</span>
                  </div>
                </label>
              </div>

              {/* Show Bank Details if selected */}
              {paymentMethod === 'Bank Transfer' && (
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-gray-100 shadow-xl shadow-gray-100/50 space-y-8 animate-in slide-in-from-top duration-300">
                  
                  {/* Daraz-Style Payment Module Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-55 pb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-700 border border-purple-100 shadow-inner shrink-0 animate-pulse">
                        <Building2 size={22} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Direct Bank Transfer</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Secure Escrow Processing</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-100 px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                      Meezan Bank
                    </div>
                  </div>

                  {/* ATM / Professional Card Frame */}
                  <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#4c1d95] via-[#1e1b4b] to-black border border-purple-500/20 text-white shadow-xl shadow-indigo-950/15 p-6 md:p-8 space-y-6">
                    {/* Golden Hologram Chip Accent */}
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-9 bg-gradient-to-br from-amber-400 to-amber-200 rounded-lg shadow border border-amber-300/40 relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-300/30 via-transparent to-transparent pointer-events-none" />
                        {/* Chip grids */}
                        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5 p-1 opacity-45">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="border border-amber-900/10 rounded-[1px]"></div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400 block">HYDER TRADERS</span>
                        <span className="text-[7px] font-bold text-purple-300/60 uppercase mt-0.5 tracking-wider block">Official Corporate Account</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-[8px] font-black text-purple-300/60 uppercase tracking-widest block mb-1">Account Title</span>
                        <span className="text-base font-black tracking-tight text-white uppercase">HYDER TRADERS</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-white/5">
                        {/* Account Number */}
                        <div>
                          <span className="text-[8px] font-black text-purple-300/60 uppercase tracking-widest block mb-1">Account Number</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black tracking-wider text-white select-all">16110109941425</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard('16110109941425', 'account')}
                              className="text-amber-400 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer p-1"
                              title="Copy Account Number"
                            >
                              {copiedAccount ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                            {copiedAccount && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">Copied</span>}
                          </div>
                        </div>

                        {/* IBAN */}
                        <div>
                          <span className="text-[8px] font-black text-purple-300/60 uppercase tracking-widest block mb-1">IBAN (International Account)</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-black tracking-wider text-white select-all">PK47MEZN0016110109941425</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard('PK47MEZN0016110109941425', 'iban')}
                              className="text-amber-400 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer p-1"
                              title="Copy IBAN"
                            >
                              {copiedIban ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                            {copiedIban && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">Copied</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer branding */}
                    <div className="flex justify-between items-center text-[8px] font-black uppercase text-purple-400/80 tracking-widest pt-2 border-t border-white/5">
                      <span className="flex items-center gap-1"><ShieldCheck size={10} className="text-amber-400" /> Secure Corporate Node</span>
                      <span>Meezan Bank</span>
                    </div>
                  </div>

                  {/* Transfer Instructions & Steps */}
                  <div className="bg-gray-55 rounded-3xl p-5 md:p-6 border border-gray-100/50 space-y-4">
                    <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2.5 flex items-center gap-2">
                      <AlertCircle size={14} className="text-[#ff6600]" />
                      Payment Steps & Instructions
                    </h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[10px] font-semibold text-gray-505 leading-relaxed">
                      <div className="space-y-1">
                        <span className="text-gray-900 font-black flex items-center gap-1.5 uppercase"><span className="w-4 h-4 bg-orange-100 text-[#ff6600] rounded-full flex items-center justify-center text-[8px]">1</span> Transfer Amount</span>
                        <p>Transfer the exact subtotal of PKR {orderTotal.toLocaleString()} using Banking App or ATM.</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-900 font-black flex items-center gap-1.5 uppercase"><span className="w-4 h-4 bg-orange-100 text-[#ff6600] rounded-full flex items-center justify-center text-[8px]">2</span> Take Screenshot</span>
                        <p>Take a screenshot of the successful transaction showing the receipt details.</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-900 font-black flex items-center gap-1.5 uppercase"><span className="w-4 h-4 bg-orange-100 text-[#ff6600] rounded-full flex items-center justify-center text-[8px]">3</span> Upload Receipt</span>
                        <p>Upload the receipt screenshot inside the upload module below to release shipment.</p>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Screenshot Upload System */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Transfer Receipt Screenshot Proof</span>
                    
                    {!receiptUrl && !isUploadingReceipt ? (
                      <div className="relative border-2 border-dashed border-gray-200 hover:border-[#ff6600]/50 rounded-[2rem] p-6 text-center transition-all bg-gray-55/30">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => e.target.files && e.target.files[0] && handleReceiptUpload(e.target.files[0])}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center text-gray-500 pointer-events-none py-3">
                          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 border border-gray-100 text-gray-400">
                            <Upload size={20} />
                          </div>
                          <p className="text-xs font-black text-gray-700 uppercase tracking-wider">Upload or Paste (Ctrl+V) Receipt Image</p>
                          <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest">JPG, PNG, WebP up to 5MB • Paste directly supported</p>
                        </div>
                      </div>
                    ) : isUploadingReceipt ? (
                      <div className="border-2 border-dashed border-orange-200 bg-orange-50/10 rounded-[2rem] p-8 text-center flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin mb-3"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#ff6600]">Uploading Receipt Asset...</span>
                        <p className="text-[9px] text-gray-400 font-semibold mt-1 truncate max-w-xs">{receiptFileName}</p>
                      </div>
                    ) : (
                      <div className="border-2 border-[#ff6600]/25 bg-orange-50/5 rounded-[2rem] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in duration-200">
                        <div className="flex items-center gap-3.5">
                          <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            <img src={receiptUrl} alt="Receipt preview" className="max-w-full max-h-full object-contain rounded-xl" />
                          </div>
                          <div>
                            <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Uploaded Successfully
                            </span>
                            <p className="text-xs font-bold text-gray-800 line-clamp-1 max-w-[200px] sm:max-w-[300px]">{receiptFileName || 'Receipt Proof Asset'}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setReceiptUrl('');
                            setReceiptFileName('');
                          }}
                          className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow animate-in slide-in-from-right"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Verification Support button & Security Banner */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-emerald-50/35 border border-emerald-100/55 rounded-3xl p-5 mt-2">
                    <div className="flex gap-3 text-xs leading-relaxed text-gray-600 font-medium">
                      <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black text-gray-900 block uppercase text-[10px] tracking-wider">Fast-Track Verification Notice</span>
                        <p className="text-[10px] text-gray-505 font-semibold mt-0.5 leading-relaxed">
                          Your order remains secure in pending state until verified. You can also chat directly with our WhatsApp Support channel for prompt logistics release.
                        </p>
                      </div>
                    </div>
                    
                    <a
                      href="https://wa.me/923001030542?text=Hi%20Hyder%20Traders,%20I%20have%20just%20placed%20a%20bank%20transfer%20order%20and%20need%20verification."
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#0c4a24] hover:bg-green-800 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/10 active:scale-95 shrink-0"
                    >
                      <PhoneCall size={12} fill="currentColor" /> Live Chat Support
                    </a>
                  </div>

                </div>
              )}
            </div>
          </div>

          {/* Checkout Review Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 sticky top-32">
              <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight uppercase">Order Review</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar border-b border-gray-50 pb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-gray-100 shrink-0 p-1 flex items-center justify-center">
                      <img src={item.images[0]} alt={item.title} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-xs font-bold text-gray-900 line-clamp-1 leading-tight">{item.title}</p>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-black text-gray-900 whitespace-nowrap">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-black">Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-2 border-b border-dashed border-gray-105 pb-4">
                  <div className="flex justify-between items-center text-gray-500 font-medium">
                    <span>Base Shipping</span>
                    {baseShipping === 0 ? (
                      <span className="text-green-600 font-black uppercase text-xs tracking-widest italic">Free</span>
                    ) : isThresholdMet ? (
                      <span className="text-gray-400 line-through text-xs font-black">
                        Rs. {baseShipping.toLocaleString()}
                        <span className="text-green-600 font-black uppercase tracking-widest ml-1.5 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded text-[8px] italic animate-pulse">Waived</span>
                      </span>
                    ) : (
                      <span className="text-gray-900 font-black">Rs. {baseShipping.toLocaleString()}</span>
                    )}
                  </div>

                  {customSurcharges > 0 && (
                    <div className="flex justify-between items-center text-gray-500 font-medium text-xs">
                      <span>Bulky Logistics Surcharges</span>
                      <span className="text-gray-700 font-bold">Rs. {customSurcharges.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-gray-700 font-black text-xs pt-1.5 mt-1 border-t border-gray-50">
                    <span>Total Shipping Fee</span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-black uppercase tracking-widest italic">Free</span>
                    ) : (
                      <span>Rs. {shippingCost.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-lg font-black text-gray-900 uppercase tracking-tight">Total</span>
                  <span className="text-2xl font-black text-[#ff6600]">Rs. {orderTotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isPlacingOrder || cart.length === 0}
                className="w-full bg-[#ff6600] text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
              >
                {isPlacingOrder ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Placing Order...
                  </>
                ) : (
                  <>Place Order <ChevronRight size={18} /></>
                )}
              </button>

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <ShieldCheck size={16} className="text-green-500" /> Secure Checkout Guaranteed
              </div>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
};

export default CheckoutPage;
