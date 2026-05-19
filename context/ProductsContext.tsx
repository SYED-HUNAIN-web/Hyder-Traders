'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/data/dummyProducts';
import { getProducts } from '@/services/firestore';

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  refreshProducts: (background?: boolean) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProducts = async (background = false) => {
    if (!background) setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products from Firestore:', error);
    } finally {
      if (!background) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, isLoading, refreshProducts: fetchProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
