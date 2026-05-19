'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Container from '@/components/shared/Container';
import ProductFilters from '@/components/products/ProductFilters';
import ProductGrid from '@/components/products/ProductGrid';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    stockStatus: [] as string[],
    priceRange: { min: 0, max: 1000000 },
    search: searchParams.get('search') || ''
  });

  // Sync search filter when URL param changes
  useEffect(() => {
    const search = searchParams.get('search') || '';
    setFilters(prev => ({ ...prev, search }));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Breadcrumb / Page Header */}
      <div className="bg-white border-b border-gray-100">
        <Container>
          <div className="py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <Link href="/" className="hover:text-[#ff6600] transition-colors">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href="/products" className="text-gray-900">Products</Link>
            <span className="text-gray-300">/</span>
            <span className="text-[#ff6600]">Solar Solutions</span>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <Container>
          <div className="flex flex-col lg:flex-row gap-8 relative">
            <ProductFilters 
              isMobileOpen={isMobileFiltersOpen} 
              setIsMobileOpen={setIsMobileFiltersOpen}
              filters={filters}
              setFilters={setFilters}
            />
            <ProductGrid 
              onOpenFilters={() => setIsMobileFiltersOpen(true)} 
              filters={filters}
              setFilters={setFilters}
            />
          </div>
        </Container>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ProductsContent />
    </Suspense>
  );
}
