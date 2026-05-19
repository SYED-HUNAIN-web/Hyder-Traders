'use client';

import React from 'react';
import ProductCard from './ProductCard';
import { useProducts } from '@/context/ProductsContext';

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ currentProductId, category }) => {
  const { products } = useProducts();
  const related = products
    .filter((p) => p.category === category && p.id !== currentProductId)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {related.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default RelatedProducts;
