'use client';

import React, { useState } from 'react';
import CloudinaryImage from '../shared/CloudinaryImage';

interface ProductGalleryProps {
  images: string[];
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images }) => {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-6">
      {/* Main Image */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden aspect-square flex items-center justify-center p-12 relative group shadow-sm hover:shadow-md transition-shadow">
        <CloudinaryImage 
          src={activeImage} 
          alt="Product" 
          width={1000}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-125 cursor-zoom-in"
        />
        
        {/* Zoom Hint */}
        <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
          Hover to zoom
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 px-1">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(img)}
            className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all duration-300 ${
              activeImage === img ? 'border-[#ff6600] scale-105 shadow-md' : 'border-gray-100 hover:border-gray-200 bg-white'
            } p-2`}
          >
            <CloudinaryImage src={img} alt={`Thumbnail ${idx + 1}`} width={160} className="w-full h-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
