'use client';

import React, { useState } from 'react';
import { Product } from '@/data/dummyProducts';
import { Star } from 'lucide-react';

interface ProductTabsProps {
  product: Product;
}

const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

  return (
    <div className="bg-white rounded-3xl border border-gray-100 mt-12 overflow-hidden shadow-sm">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-100 overflow-x-auto custom-scrollbar bg-gray-50/50">
        <button
          onClick={() => setActiveTab('description')}
          className={`flex-1 py-5 px-8 text-center font-black uppercase tracking-[0.2em] text-[11px] transition-all whitespace-nowrap ${
            activeTab === 'description' 
              ? 'text-[#ff6600] border-b-2 border-[#ff6600] bg-white' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab('specifications')}
          className={`flex-1 py-5 px-8 text-center font-black uppercase tracking-[0.2em] text-[11px] transition-all whitespace-nowrap ${
            activeTab === 'specifications' 
              ? 'text-[#ff6600] border-b-2 border-[#ff6600] bg-white' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Specifications
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 py-5 px-8 text-center font-black uppercase tracking-[0.2em] text-[11px] transition-all whitespace-nowrap ${
            activeTab === 'reviews' 
              ? 'text-[#ff6600] border-b-2 border-[#ff6600] bg-white' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Reviews ({product.reviewsCount})
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-8 md:p-12">
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 leading-loose text-lg mb-10">{product.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <div className="w-8 h-[2px] bg-[#ff6600]" />
                  Key Features
                </h3>
                <ul className="space-y-4">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-600">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-200 flex-shrink-0" />
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-orange-50/50 rounded-2xl p-8 border border-orange-100/50">
                <h3 className="text-sm font-black text-[#ff6600] uppercase tracking-widest mb-4">Why Choose This?</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  This product is engineered for durability and high performance in local conditions. Our experts recommend it for long-term solar efficiency and reliable energy management.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === 'specifications' && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {product.specs.map((spec, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                      <th className="py-4 px-6 border-b border-gray-100 font-bold text-gray-900 text-xs uppercase tracking-wider w-1/3">
                        {spec.name}
                      </th>
                      <td className="py-4 px-6 border-b border-gray-100 text-gray-600 font-medium text-sm">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-12 mb-12 pb-12 border-b border-gray-100">
              <div className="flex flex-col items-center text-center px-8 border-r border-gray-100">
                <div className="text-6xl font-black text-gray-900 mb-2 tracking-tighter">{product.rating}</div>
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} strokeWidth={i < Math.floor(product.rating) ? 0 : 2} />
                  ))}
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Rating</div>
              </div>
              
              <div className="flex-1 w-full">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-4 mb-3">
                    <div className="text-[10px] font-black text-gray-400 w-12 flex items-center gap-1">
                      {star} STARS
                    </div>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full" 
                        style={{ width: `${star === 5 ? 85 : star === 4 ? 10 : star === 3 ? 5 : 0}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-black text-gray-400 w-8 text-right">
                      {star === 5 ? '85%' : star === 4 ? '10%' : '5%'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Arsalan Khan', text: 'Amazing build quality. Using it for 3 months now with zero issues. Best in the market.', date: 'Verified Buyer - 2 weeks ago' },
                { name: 'M. Ibrahim', text: 'Hyder Traders never disappoints. The technical support during installation was very helpful.', date: 'Verified Buyer - 1 month ago' }
              ].map((review, idx) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#ff6600] font-black text-xs">
                        {review.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{review.name}</div>
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{review.date}</div>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} fill="currentColor" strokeWidth={0} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed font-medium italic">
                    "{review.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
