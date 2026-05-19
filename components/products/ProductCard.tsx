import React from 'react';
import Link from 'next/link';
import { Eye, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/data/dummyProducts';
import { useCart } from '@/context/CartContext';

import CloudinaryImage from '@/components/shared/CloudinaryImage';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col h-full relative">
      {/* Image Container */}
      <div className="relative aspect-[4/5] bg-gray-55/50 overflow-hidden flex items-center justify-center group/img">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
          {product.stockStatus === 'Out of Stock' ? (
            <div className="bg-gray-900 text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
              Sold Out
            </div>
          ) : product.stockStatus === 'Low Stock' ? (
            <div className="bg-amber-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
              Low Stock
            </div>
          ) : null}
          
          {product.originalPrice && product.stockStatus !== 'Out of Stock' && (
            <div className="bg-[#ff6600] text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </div>
          )}
        </div>

        <Link href={`/products/${product.id}`} className="block w-full h-full p-8">
          <CloudinaryImage
            src={product.images[0]}
            alt={product.title}
            width={600}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-in-out"
          />
        </Link>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 pointer-events-none" />
        
        <div className="absolute bottom-4 left-0 w-full px-4 flex justify-center gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-30">
          <Link
            href={`/products/${product.id}`}
            className="bg-white text-gray-900 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 shadow-xl border border-gray-100 pointer-events-auto"
            title="Quick View"
          >
            <Eye size={18} />
          </Link>
          <button
            onClick={() => addToCart(product)}
            className="bg-white text-gray-900 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#ff6600] hover:text-white transition-all duration-300 shadow-xl border border-gray-100 disabled:opacity-50 pointer-events-auto"
            disabled={product.stockStatus === 'Out of Stock'}
            title="Add to Cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.brand}</span>
          <div className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded-md">
            <Star size={10} fill="currentColor" className="text-yellow-400" />
            <span className="text-[10px] font-bold text-gray-600">{product.rating}</span>
          </div>
        </div>

        <Link href={`/products/${product.id}`} className="block mb-3 group-hover:text-[#ff6600] transition-colors">
          <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug text-[13px] tracking-tight min-h-[38px]">
            {product.title}
          </h3>
        </Link>
        
        {/* Short Specs/Highlights */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {product.highlights.slice(0, 2).map((h, i) => (
            <span key={i} className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100/50">
              {h}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              {product.originalPrice && (
                <span className="text-[10px] text-gray-400 line-through font-medium mb-0.5">
                  Rs. {product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-[16px] font-black text-[#1a1a1a] leading-none">
                Rs. {product.price.toLocaleString()}
              </span>
            </div>
            
            <button
              onClick={() => addToCart(product)}
              className="bg-[#ff6600] text-white text-[11px] font-bold px-5 py-2.5 rounded-xl hover:bg-black transition-all duration-500 uppercase tracking-wider shadow-md hover:shadow-lg disabled:bg-gray-200 disabled:shadow-none"
              disabled={product.stockStatus === 'Out of Stock'}
            >
              Add To Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
