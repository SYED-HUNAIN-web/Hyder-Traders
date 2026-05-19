'use client';

import React, { useState } from 'react';
import { Filter, Search, ChevronDown, X } from 'lucide-react';
import { useProducts } from '@/context/ProductsContext';
import ProductCard from './ProductCard';

interface ProductGridProps {
  onOpenFilters: () => void;
  filters: {
    categories: string[];
    brands: string[];
    stockStatus: string[];
    priceRange: { min: number; max: number };
    search: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

const ProductGrid: React.FC<ProductGridProps> = ({ onOpenFilters, filters, setFilters }) => {
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const [sortBy, setSortBy] = useState('latest');
  const { products } = useProducts();

  // Sync with global search from URL
  React.useEffect(() => {
    setSearchTerm(filters.search);
  }, [filters.search]);

  // Debounce search input value changes to keep UI extremely snappy
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setFilters((prev: any) => ({ ...prev, search: searchTerm }));
    }, 250);

    return () => clearTimeout(handler);
  }, [searchTerm, setFilters]);

  const removeFilter = (type: 'categories' | 'brands' | 'stockStatus', value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [type]: prev[type].filter((v: string) => v !== value)
    }));
  };

  // Comprehensive highly-efficient memoized filtering and sorting
  const sortedProducts = React.useMemo(() => {
    const searchVal = debouncedSearch.toLowerCase().trim();
    const filtered = products.filter(product => {
      // Search filter
      const matchesSearch = !searchVal || 
                          product.title.toLowerCase().includes(searchVal) ||
                          product.brand.toLowerCase().includes(searchVal) ||
                          product.category.toLowerCase().includes(searchVal);
      
      // Category filter
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category);
      
      // Brand filter
      const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.brand);
      
      // Stock filter
      const matchesStock = filters.stockStatus.length === 0 || filters.stockStatus.includes(product.stockStatus);
      
      // Price filter
      const matchesPrice = product.price >= filters.priceRange.min && product.price <= filters.priceRange.max;

      return matchesSearch && matchesCategory && matchesBrand && matchesStock && matchesPrice;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'best-selling':
          return b.rating - a.rating; // Using rating as proxy for best selling
        case 'latest':
        default:
          return 0; // Assuming dummy data order is 'latest'
      }
    });
  }, [products, debouncedSearch, sortBy, filters.categories, filters.brands, filters.stockStatus, filters.priceRange.min, filters.priceRange.max]);

  return (
    <div className="flex-1">
      {/* Active Filters Bar */}
      {(filters.categories.length > 0 || filters.brands.length > 0 || filters.stockStatus.length > 0 || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">Active:</span>
          {searchTerm && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilters((prev: any) => ({ ...prev, search: '' }));
              }}
              className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-700 hover:border-[#ff6600] transition-all group"
            >
              Search: {searchTerm}
              <X size={12} className="text-gray-300 group-hover:text-[#ff6600]" />
            </button>
          )}
          {filters.categories.map(cat => (
            <button 
              key={cat}
              onClick={() => removeFilter('categories', cat)}
              className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-700 hover:border-[#ff6600] transition-all group"
            >
              {cat}
              <X size={12} className="text-gray-300 group-hover:text-[#ff6600]" />
            </button>
          ))}
          {filters.brands.map(brand => (
            <button 
              key={brand}
              onClick={() => removeFilter('brands', brand)}
              className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-700 hover:border-[#ff6600] transition-all group"
            >
              {brand}
              <X size={12} className="text-gray-300 group-hover:text-[#ff6600]" />
            </button>
          ))}
          {filters.stockStatus.map(status => (
            <button 
              key={status}
              onClick={() => removeFilter('stockStatus', status)}
              className="flex items-center gap-2 bg-white border border-gray-100 px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-700 hover:border-[#ff6600] transition-all group"
            >
              {status}
              <X size={12} className="text-gray-300 group-hover:text-[#ff6600]" />
            </button>
          ))}
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={onOpenFilters}
            className="lg:hidden flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl text-gray-900 border border-gray-100 shadow-sm transition-all active:scale-95"
          >
            <Filter size={14} className="text-[#ff6600]" />
            <span className="font-bold uppercase text-[11px] tracking-tight">Filters</span>
          </button>
          <div className="hidden md:flex flex-col">
            <h1 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-0.5">
              Premium Collection
            </h1>
            <p className="text-[15px] font-bold text-gray-900">
              {sortedProducts.length} <span className="text-gray-400 font-medium text-[13px]">Products Available</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72 group">
            <input 
              type="text" 
              placeholder="Search by brand or product..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6600]/5 focus:border-[#ff6600] text-[12px] font-medium transition-all placeholder:text-gray-300"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff6600] transition-colors" size={14} />
          </div>

          {/* Sort */}
          <div className="relative w-full sm:w-56">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-[12px] font-bold text-gray-700 focus:outline-none focus:border-[#ff6600] transition-all cursor-pointer shadow-sm"
            >
              <option value="latest">Sort: Newest Arrival</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="best-selling">Most Popular</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 max-w-xs mx-auto">We couldn't find any products matching your current filters or search term.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 text-[#ff6600] font-bold text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
