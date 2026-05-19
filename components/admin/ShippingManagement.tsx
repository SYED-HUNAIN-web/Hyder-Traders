'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getShippingSettings, updateShippingSettings, updateProduct, ShippingSettings } from '@/services/firestore';
import { useProducts } from '@/context/ProductsContext';
import { Product } from '@/data/dummyProducts';
import { Truck, Save, Search, CheckCircle2, RefreshCw, Sliders, Gift, HelpCircle } from 'lucide-react';
import CloudinaryImage from '@/components/shared/CloudinaryImage';

export default function ShippingManagement() {
  const { products, refreshProducts } = useProducts();
  const [settings, setSettings] = useState<ShippingSettings>({
    type: 'free',
    amount: 0,
    thresholdEnabled: false,
    thresholdAmount: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingGlobal, setIsSavingGlobal] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<string | null>(null);

  // Inline product editing state
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFees, setEditingFees] = useState<Record<string, number>>({});
  const [savingProducts, setSavingProducts] = useState<Record<string, boolean>>({});
  const [savedFeedback, setSavedFeedback] = useState<Record<string, boolean>>({});

  // Sync products shipping fees to local state on load/change
  useEffect(() => {
    const initialFees: Record<string, number> = {};
    products.forEach(p => {
      initialFees[p.id] = p.shippingCharge || 0;
    });
    setEditingFees(prev => ({ ...initialFees, ...prev }));
  }, [products]);

  // Load Settings from Firestore
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const data = await getShippingSettings();
        setSettings({
          type: data.type || 'free',
          amount: data.amount || 0,
          thresholdEnabled: data.thresholdEnabled || false,
          thresholdAmount: data.thresholdAmount || 0
        });
      } catch (err) {
        console.error("Failed to load shipping settings:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGlobal(true);
    setGlobalMessage(null);
    try {
      await updateShippingSettings(settings);
      setGlobalMessage("Global shipping policies updated successfully!");
      setTimeout(() => setGlobalMessage(null), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update global shipping settings.");
    } finally {
      setIsSavingGlobal(false);
    }
  };

  const handleSaveProductFee = async (productId: string) => {
    const fee = editingFees[productId] ?? 0;
    setSavingProducts(prev => ({ ...prev, [productId]: true }));
    
    try {
      await updateProduct(productId, { shippingCharge: fee });
      
      // Visual feedback trigger
      setSavedFeedback(prev => ({ ...prev, [productId]: true }));
      setTimeout(() => {
        setSavedFeedback(prev => ({ ...prev, [productId]: false }));
      }, 2000);

      await refreshProducts(true);
    } catch (err) {
      console.error("Failed to update inline product shipping charge:", err);
      alert("Failed to update shipping charge.");
    } finally {
      setSavingProducts(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Filter products by search term
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="w-10 h-10 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading command console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Shipping Command Center</h2>
          <p className="text-gray-500 text-sm mt-1">Configure global logistics thresholds and perform high-speed inline product surcharge overrides.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-orange-50 text-[#ff6600] border border-orange-100/50 px-4 py-2 rounded-2xl">
          <Truck size={18} className="animate-bounce" />
          <span className="text-xs font-black uppercase tracking-wider">Logistics Terminal Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Global Configurations */}
        <div className="space-y-8">
          <form onSubmit={handleSaveGlobal} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-55 pb-4">
              <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-700 border border-gray-100">
                <Sliders size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Global Shipping Policy</h3>
                <p className="text-[10px] text-gray-400 font-semibold">Standard baseline delivery parameters</p>
              </div>
            </div>

            {/* Flat vs Free Selectors */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-55 rounded-2xl border border-gray-100">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, type: 'free' })}
                className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${settings.type === 'free' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Free Shipping
              </button>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, type: 'fixed' })}
                className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${settings.type === 'fixed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Flat Rate Baseline
              </button>
            </div>

            {settings.type === 'fixed' && (
              <div className="animate-fade-in">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Baseline Flat Rate (PKR)</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    min="0"
                    value={settings.amount}
                    onChange={(e) => setSettings({ ...settings, amount: Number(e.target.value) })}
                    className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl py-3.5 px-5 outline-none font-bold text-gray-900 transition-all text-sm"
                    placeholder="e.g. 250"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">Rs.</span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingGlobal}
                className="w-full bg-[#1a1a1a] hover:bg-[#ff6600] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-gray-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingGlobal ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save Global Policies
              </button>
              {globalMessage && (
                <div className="mt-3 text-center text-xs font-bold text-emerald-600 animate-pulse bg-emerald-50 border border-emerald-100 rounded-xl py-2">
                  {globalMessage}
                </div>
              )}
            </div>
          </form>

          {/* Incentive Card: Threshold Value */}
          <form onSubmit={handleSaveGlobal} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-55 pb-4">
              <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-700 border border-gray-100">
                <Gift size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Free Shipping Promotion</h3>
                <p className="text-[10px] text-gray-400 font-semibold">Waive base rates for high-value orders</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-55 rounded-2xl border border-gray-100/50">
              <div>
                <span className="text-xs font-black text-gray-700 block uppercase tracking-wider">Free Shipping Incentives</span>
                <span className="text-[10px] text-gray-400">Enable subtotal-based checkout discount</span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, thresholdEnabled: !settings.thresholdEnabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-all duration-300 focus:outline-none ${settings.thresholdEnabled ? 'bg-[#ff6600] border-[#ff6600]' : 'bg-gray-100 border-gray-300'} cursor-pointer`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings.thresholdEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {settings.thresholdEnabled && (
              <div className="animate-fade-in">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Free Shipping Subtotal Threshold (PKR)</label>
                <div className="relative">
                  <input
                    required
                    type="number"
                    min="1"
                    value={settings.thresholdAmount || 0}
                    onChange={(e) => setSettings({ ...settings, thresholdAmount: Number(e.target.value) })}
                    className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl py-3.5 px-5 outline-none font-bold text-gray-900 transition-all text-sm"
                    placeholder="e.g. 50000"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">Rs.</span>
                </div>
                <p className="text-[9px] text-gray-400 mt-2 font-medium leading-relaxed italic">
                  *When checkout cart subtotal exceeds this amount, the base flat rate will be strike-through waived, leaving only product-specific bulky logistics surcharges active.
                </p>
              </div>
            )}

            {settings.thresholdEnabled && (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingGlobal}
                  className="w-full bg-[#1a1a1a] hover:bg-[#ff6600] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-gray-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingGlobal ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save Promotion
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right Side: High-speed Inventory Inline Surcharge Editor */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[650px]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-55 pb-4 shrink-0">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Product Surcharge Overrides</h3>
              <p className="text-[10px] text-gray-400 font-semibold">Perform rapid inline shipping adjustments</p>
            </div>
            
            {/* Search Box */}
            <div className="relative w-full md:w-48">
              <input 
                type="text" 
                placeholder="Search catalog..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border-2 border-transparent bg-gray-55 rounded-xl text-xs focus:border-[#ff6600]/10 focus:bg-white outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* List Wrapper */}
          <div className="overflow-y-auto flex-grow divide-y divide-gray-50 pr-1 mt-4">
            {filteredProducts.map((p) => {
              const currentFee = editingFees[p.id] ?? 0;
              const isSaving = savingProducts[p.id] || false;
              const isSaved = savedFeedback[p.id] || false;
              const isChanged = currentFee !== (p.shippingCharge || 0);

              return (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 p-0.5 shrink-0 flex items-center justify-center overflow-hidden">
                      <CloudinaryImage src={p.images[0]} alt={p.title} width={60} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-gray-900 truncate max-w-[180px] group-hover:text-[#ff6600] transition-colors">{p.title}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[8px] bg-gray-100 text-gray-500 font-black uppercase px-1 rounded">
                          {p.category}
                        </span>
                        <span className="text-[8px] text-gray-400 font-bold">
                          Rs. {p.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Inline Surcharge Controller */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative w-24">
                      <input 
                        type="number"
                        min="0"
                        value={currentFee}
                        onChange={(e) => setEditingFees({ ...editingFees, [p.id]: Number(e.target.value) })}
                        className={`w-full bg-gray-55 border-2 rounded-xl py-2 px-3 outline-none font-black text-xs text-right pr-6 transition-all ${isChanged ? 'border-orange-200 bg-orange-50/10 focus:border-[#ff6600]' : 'border-transparent focus:border-[#ff6600]/20 focus:bg-white'}`}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400">Rs.</span>
                    </div>

                    <button
                      onClick={() => handleSaveProductFee(p.id)}
                      disabled={isSaving || (!isChanged && !isSaved)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-all active:scale-95 ${
                        isSaved
                          ? 'bg-emerald-500 text-white cursor-default'
                          : isSaving
                          ? 'bg-gray-100 text-gray-400 cursor-wait'
                          : isChanged
                          ? 'bg-[#ff6600] text-white hover:bg-orange-600 cursor-pointer hover:shadow'
                          : 'bg-gray-55 text-gray-300 cursor-not-allowed'
                      }`}
                      title={isSaved ? "Saved Successfully!" : "Save Surcharge Override"}
                    >
                      {isSaved ? (
                        <CheckCircle2 size={16} />
                      ) : isSaving ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="text-center py-20 text-gray-400 flex flex-col items-center justify-center">
                <Search size={24} className="mb-2 text-gray-300" />
                <p className="text-xs font-black uppercase tracking-wider text-gray-700">No products found</p>
                <p className="text-[10px] text-gray-400 mt-1">Try adjusting search keywords.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
