'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';

const categories = [
  'Solar Inverters',
  'Solar Panels',
  'Lithium Batteries',
  'AC/DC Breakers',
  'Solar Wires & Cables',
  'Accessories'
];

const brands = [
  'Coretech',
  'Sunwooda',
  'Phoenix',
  'Inverex',
  'Sunflx',
  'Solis',
  'Jinko',
  'Longi',
  'Mora',
  'Itel'
];

interface ProductFiltersProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  filters: {
    categories: string[];
    brands: string[];
    stockStatus: string[];
    priceRange: { min: number; max: number };
    search: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    categories: string[];
    brands: string[];
    stockStatus: string[];
    priceRange: { min: number; max: number };
    search: string;
  }>>;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ isMobileOpen, setIsMobileOpen, filters, setFilters }) => {
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    stock: true,
    brands: true,
  });

  const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (section: 'categories' | 'brands' | 'stockStatus', value: string) => {
    setFilters(prev => {
      const currentValues = prev[section];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [section]: newValues };
    });
  };

  const handlePriceApply = () => {
    setFilters(prev => ({ ...prev, priceRange: localPriceRange }));
  };

  const FilterContent = () => (
    <div className="flex flex-col gap-6">
      {/* Categories */}
      <div className="border-b border-gray-100 pb-5">
        <button 
          className="flex items-center justify-between w-full group mb-4"
          onClick={() => toggleSection('categories')}
        >
          <span className="font-bold text-[13px] text-gray-900 tracking-tight">Categories</span>
          <div className="text-gray-400 group-hover:text-[#ff6600] transition-colors">
            {openSections.categories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>
        {openSections.categories && (
          <div className="flex flex-col gap-2.5">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={filters.categories.includes(cat)}
                      onChange={() => handleCheckboxChange('categories', cat)}
                      className="peer appearance-none w-4 h-4 border border-gray-200 rounded-md checked:bg-[#ff6600] checked:border-[#ff6600] transition-all cursor-pointer" 
                    />
                    <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>
                  <span className={`text-[12px] font-medium transition-colors ${filters.categories.includes(cat) ? 'text-[#ff6600] font-bold' : 'text-gray-500 group-hover:text-gray-900'}`}>{cat}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-gray-100 pb-5">
        <button 
          className="flex items-center justify-between w-full group mb-4"
          onClick={() => toggleSection('price')}
        >
          <span className="font-bold text-[13px] text-gray-900 tracking-tight">Price Range</span>
          <div className="text-gray-400 group-hover:text-[#ff6600] transition-colors">
            {openSections.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>
        {openSections.price && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input 
                  type="number" 
                  placeholder="Min"
                  value={localPriceRange.min}
                  onChange={(e) => setLocalPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-gray-50 border border-transparent rounded-lg px-3 py-2 text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-[#ff6600]/5 focus:border-[#ff6600] focus:bg-white transition-all" 
                />
              </div>
              <div className="w-2 h-[1px] bg-gray-300" />
              <div className="relative flex-1">
                <input 
                  type="number" 
                  placeholder="Max"
                  value={localPriceRange.max}
                  onChange={(e) => setLocalPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-gray-50 border border-transparent rounded-lg px-3 py-2 text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-[#ff6600]/5 focus:border-[#ff6600] focus:bg-white transition-all" 
                />
              </div>
            </div>
            <button 
              onClick={handlePriceApply}
              className="bg-gray-900 text-white w-full py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#ff6600] transition-all shadow-sm"
            >
              Apply Filter
            </button>
          </div>
        )}
      </div>

      {/* Stock Availability */}
      <div className="border-b border-gray-100 pb-5">
        <button 
          className="flex items-center justify-between w-full group mb-4"
          onClick={() => toggleSection('stock')}
        >
          <span className="font-bold text-[13px] text-gray-900 tracking-tight">Availability</span>
          <div className="text-gray-400 group-hover:text-[#ff6600] transition-colors">
            {openSections.stock ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>
        {openSections.stock && (
          <div className="flex flex-col gap-2.5">
            {['In Stock', 'Out of Stock'].map((status) => (
              <label key={status} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={filters.stockStatus.includes(status)}
                    onChange={() => handleCheckboxChange('stockStatus', status)}
                    className="peer appearance-none w-4 h-4 border border-gray-200 rounded-md checked:bg-[#ff6600] checked:border-[#ff6600] transition-all cursor-pointer" 
                  />
                  <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
                <span className={`text-[12px] font-medium transition-colors ${filters.stockStatus.includes(status) ? 'text-[#ff6600] font-bold' : 'text-gray-500 group-hover:text-gray-900'}`}>{status}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div>
        <button 
          className="flex items-center justify-between w-full group mb-4"
          onClick={() => toggleSection('brands')}
        >
          <span className="font-bold text-[13px] text-gray-900 tracking-tight">Brands</span>
          <div className="text-gray-400 group-hover:text-[#ff6600] transition-colors">
            {openSections.brands ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>
        {openSections.brands && (
          <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={filters.brands.includes(brand)}
                    onChange={() => handleCheckboxChange('brands', brand)}
                    className="peer appearance-none w-4 h-4 border border-gray-200 rounded-md checked:bg-[#ff6600] checked:border-[#ff6600] transition-all cursor-pointer" 
                  />
                  <div className="absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
                <span className={`text-[12px] font-medium transition-colors ${filters.brands.includes(brand) ? 'text-[#ff6600] font-bold' : 'text-gray-500 group-hover:text-gray-900'}`}>{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-28 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#ff6600]">
                <Filter size={16} />
              </div>
              <span className="font-bold text-sm tracking-tight">Filter Gear</span>
            </div>
            {(filters.categories.length > 0 || filters.brands.length > 0 || filters.stockStatus.length > 0 || filters.search) && (
              <button 
                onClick={() => setFilters({
                  categories: [],
                  brands: [],
                  stockStatus: [],
                  priceRange: { min: 0, max: 1000000 },
                  search: ''
                })}
                className="text-[10px] font-black text-[#ff6600] uppercase tracking-widest hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-xl">
              <Filter size={24} className="text-[#ff6600]" />
              Filters
            </div>
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="text-gray-500 hover:text-[#ff6600] transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <FilterContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductFilters;
