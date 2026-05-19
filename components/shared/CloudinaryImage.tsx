import React from 'react';

interface CloudinaryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  width?: number;
  quality?: string;
}

/**
 * Parses any incoming image source URL and appends optimized Cloudinary transformation parameters
 * if it matches a Cloudinary hosted asset.
 */
export const getOptimizedImageUrl = (src: string, width = 800, quality = 'auto') => {
  if (!src) return '/placeholder.png';
  
  // Check if it is a Cloudinary hosted asset
  if (src.includes('res.cloudinary.com') && src.includes('/image/upload/')) {
    const parts = src.split('/image/upload/');
    // Inject: f_auto (format), q_auto (quality compression), w_XXX (responsive boundary)
    // We use a clean replace strategy to prevent duplicate injections if the URL already has transformations
    if (parts[1].startsWith('f_auto') || parts[1].includes('/f_')) {
      return src; // Already transformed, return as is
    }
    return `${parts[0]}/image/upload/f_auto,q_${quality},w_${width}/${parts[1]}`;
  }
  
  return src;
};

const CloudinaryImage: React.FC<CloudinaryImageProps> = ({ 
  src, 
  width = 800, 
  quality = 'auto', 
  alt = 'Product Image', 
  loading = 'lazy',
  className = '',
  ...props 
}) => {
  const optimizedSrc = getOptimizedImageUrl(src, width, quality);
  
  return (
    <img 
      src={optimizedSrc} 
      alt={alt} 
      loading={loading} 
      className={className} 
      {...props} 
    />
  );
};

export default CloudinaryImage;
