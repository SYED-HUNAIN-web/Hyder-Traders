'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Container from '@/components/shared/Container';
import ProductGallery from '@/components/products/ProductGallery';
import ProductInfo from '@/components/products/ProductInfo';
import ProductTabs from '@/components/products/ProductTabs';
import RelatedProducts from '@/components/products/RelatedProducts';
import { useProducts } from '@/context/ProductsContext';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-12 h-12 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <Link 
          href="/products"
          className="bg-[#ff6600] text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <Container>
          <div className="py-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <Link href="/" className="hover:text-[#ff6600] transition-colors flex items-center gap-1">
              <Home size={10} /> Home
            </Link>
            <ChevronRight size={10} className="text-gray-300" />
            <Link href="/products" className="hover:text-[#ff6600] transition-colors">
              Products
            </Link>
            <ChevronRight size={10} className="text-gray-300" />
            <span className="text-gray-900">{product.category}</span>
            <ChevronRight size={10} className="text-gray-300" />
            <span className="text-[#ff6600] truncate max-w-[200px]">{product.title}</span>
          </div>
        </Container>
      </div>

      <Container>
        {/* Main Product Section */}
        <div className="mt-8 bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Left: Gallery */}
            <div className="w-full lg:w-[45%]">
              <ProductGallery images={[product.images[0], ...product.images.slice(1)]} />
            </div>

            {/* Right: Info */}
            <div className="w-full lg:w-[55%]">
              <ProductInfo product={product} />
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <ProductTabs product={product} />

        {/* Related Products */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Related Products</h2>
              <div className="w-12 h-1 bg-[#ff6600] rounded-full"></div>
            </div>
            <Link href="/products" className="text-[11px] font-bold uppercase tracking-widest text-[#ff6600] hover:underline">
              View All Products
            </Link>
          </div>
          <RelatedProducts currentProductId={product.id} category={product.category} />
        </div>
      </Container>
    </div>
  );
}
