'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useProducts } from '@/context/ProductsContext';
import { Product } from '@/data/dummyProducts';
import { createProduct, updateProduct, deleteProduct, reseedDatabase } from '@/services/firestore';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Search, Plus, Edit2, Trash2, X, Image as ImageIcon, RotateCcw, Filter, RefreshCw } from 'lucide-react';
import CloudinaryImage from '@/components/shared/CloudinaryImage';

const CATEGORIES = ['All', 'Solar Panels', 'Solar Inverters', 'Lithium Batteries', 'AC/DC Breakers', 'Wires/Cables', 'Accessories'];

const TableSkeleton = () => (
  <div className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm animate-pulse">
    <div className="p-4 bg-gray-55 border-b border-gray-100 hidden md:grid grid-cols-7 gap-4">
      <div className="h-4 bg-gray-200 rounded col-span-2" />
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded text-center" />
      <div className="h-4 bg-gray-200 rounded text-center" />
      <div className="h-4 bg-gray-200 rounded text-center" />
      <div className="h-4 bg-gray-200 rounded text-right" />
    </div>
    <div className="divide-y divide-gray-50">
      {[...Array(5)].map((_, idx) => (
        <div key={idx} className="p-6 flex flex-col md:grid md:grid-cols-7 gap-4 md:items-center">
          <div className="col-span-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0" />
            <div className="space-y-2 flex-grow">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-3 bg-gray-200 rounded w-12" />
          </div>
          <div className="flex md:justify-center">
            <div className="w-16 h-8 bg-gray-200 rounded-lg" />
          </div>
          <div className="flex md:justify-center">
            <div className="w-10 h-6 bg-gray-200 rounded-full" />
          </div>
          <div className="flex md:justify-center">
            <div className="w-10 h-6 bg-gray-200 rounded-full" />
          </div>
          <div className="flex md:justify-end gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function ProductsManagement() {
  const { products, isLoading, refreshProducts } = useProducts();
  const [optimisticProducts, setOptimisticProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Debounce search changes to prevent redundant render cycles
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    category: 'Solar Panels',
    brand: '',
    price: 0,
    comparePrice: 0,
    stock: 0,
    stockStatus: 'In Stock',
    shortDescription: '',
    description: '',
    images: ['/placeholder.png'],
    cloudinaryPublicIds: [],
    featured: false,
    bestseller: false,
    rating: 5,
    reviewsCount: 0,
    highlights: [],
    features: [],
    specs: [],
    shippingCharge: 0
  });

  // Sync optimistic local state instantly with context data
  useEffect(() => {
    setOptimisticProducts(products);
  }, [products]);

  // Optimized list compiling with useMemo for high-performance rendering
  const filteredProducts = useMemo(() => {
    const searchVal = debouncedSearch.toLowerCase().trim();
    return optimisticProducts.filter(p => {
      const matchesSearch = !searchVal ||
                            p.title.toLowerCase().includes(searchVal) ||
                            p.category.toLowerCase().includes(searchVal) ||
                            p.brand.toLowerCase().includes(searchVal);
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [optimisticProducts, debouncedSearch, categoryFilter]);

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setFormData({
        ...product,
        cloudinaryPublicIds: product.cloudinaryPublicIds || []
      });
      setEditingId(product.id);
    } else {
      setFormData({
        title: '', category: 'Solar Panels', brand: '', price: 0, comparePrice: 0, stock: 10,
        stockStatus: 'In Stock', shortDescription: '', description: '', images: ['/placeholder.png'],
        cloudinaryPublicIds: [],
        featured: false, bestseller: false, rating: 5, reviewsCount: 0, highlights: [], features: [], specs: [],
        shippingCharge: 0
      });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    // Graceful fallback to Firebase Storage
    if (!cloudName || !uploadPreset) {
      console.warn("Cloudinary not configured. Falling back to Firebase Storage.");
      try {
        const storageRef = ref(storage, `products/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          () => {},
          (error) => {
            console.error("Firebase upload failed:", error);
            alert("Upload failed. Configure Cloudinary credentials in .env.local for optimized image management.");
            setIsUploading(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setFormData(prev => {
              const currentImages = prev.images?.filter(img => img !== '/placeholder.png') || [];
              const currentIds = prev.cloudinaryPublicIds || [];
              return { 
                ...prev, 
                images: [...currentImages, downloadURL],
                cloudinaryPublicIds: [...currentIds, `fb_${Date.now()}`]
              };
            });
            setIsUploading(false);
          }
        );
      } catch (err) {
        console.error(err);
        setIsUploading(false);
      }
      return;
    }

    // Cloudinary Direct Unsigned Upload
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formDataUpload,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Upload failed: ${errText}`);
      }

      const data = await res.json();
      const downloadURL = data.secure_url;
      const publicId = data.public_id;

      setFormData(prev => {
        const currentImages = prev.images?.filter(img => img !== '/placeholder.png') || [];
        const currentIds = prev.cloudinaryPublicIds || [];
        return { 
          ...prev, 
          images: [...currentImages, downloadURL],
          cloudinaryPublicIds: [...currentIds, publicId]
        };
      });
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      alert(`Cloudinary Upload Failed: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageReplace = async (file: File, index: number) => {
    if (!file) return;
    setIsUploading(true);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const oldPublicId = formData.cloudinaryPublicIds?.[index];

    // Graceful fallback to Firebase Storage
    if (!cloudName || !uploadPreset) {
      try {
        const storageRef = ref(storage, `products/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          () => {},
          (error) => {
            console.error("Firebase replace failed:", error);
            setIsUploading(false);
            setReplacingIndex(null);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setFormData(prev => {
              const newImages = [...(prev.images || [])];
              const newIds = [...(prev.cloudinaryPublicIds || [])];
              newImages[index] = downloadURL;
              newIds[index] = `fb_${Date.now()}`;
              return { ...prev, images: newImages, cloudinaryPublicIds: newIds };
            });
            setIsUploading(false);
            setReplacingIndex(null);
          }
        );
      } catch (err) {
        console.error(err);
        setIsUploading(false);
        setReplacingIndex(null);
      }
      return;
    }

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formDataUpload,
      });

      if (!res.ok) throw new Error("Replace upload failed");

      const data = await res.json();
      const downloadURL = data.secure_url;
      const publicId = data.public_id;

      setFormData(prev => {
        const newImages = [...(prev.images || [])];
        const newIds = [...(prev.cloudinaryPublicIds || [])];
        newImages[index] = downloadURL;
        newIds[index] = publicId;
        return { ...prev, images: newImages, cloudinaryPublicIds: newIds };
      });

      // Securely delete old asset on Cloudinary server-side
      if (oldPublicId && !oldPublicId.startsWith('fb_')) {
        fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: oldPublicId })
        }).catch(err => console.error("Cloudinary old asset delete error:", err));
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to replace image: " + (err.message || err));
    } finally {
      setIsUploading(false);
      setReplacingIndex(null);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const targetPublicId = formData.cloudinaryPublicIds?.[index];

    setFormData(prev => {
      const newImages = prev.images?.filter((_, i) => i !== index) || [];
      const newIds = prev.cloudinaryPublicIds?.filter((_, i) => i !== index) || [];
      return { 
        ...prev, 
        images: newImages.length ? newImages : ['/placeholder.png'],
        cloudinaryPublicIds: newIds
      };
    });

    if (targetPublicId && !targetPublicId.startsWith('fb_')) {
      try {
        await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: targetPublicId })
        });
      } catch (err) {
        console.error("Background deletion error:", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Save original state for instant recovery on error
    const originalProducts = optimisticProducts;
    
    const { id, createdAt, updatedAt, ...cleanData } = formData;
    const dataToSave = {
      ...cleanData,
      slug: formData.title?.toLowerCase().replace(/\s+/g, '-'),
      stockStatus: (formData.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'
    } as Omit<Product, 'id'>;

    // Instantly close form slider for high UI fluid responsiveness
    setIsFormOpen(false);
    setIsSubmitting(false);

    try {
      if (editingId) {
        // 1. Optimistic Update (Immediate 0ms change)
        setOptimisticProducts(prev => 
          prev.map(p => p.id === editingId ? { ...p, ...dataToSave } : p)
        );
        await updateProduct(editingId, dataToSave);
      } else {
        // 1. Optimistic Append with temporary ID
        const tempId = `temp_${Date.now()}`;
        const tempProduct = { id: tempId, ...dataToSave } as Product;
        setOptimisticProducts(prev => [tempProduct, ...prev]);
        await createProduct(dataToSave);
      }
      await refreshProducts(true);
    } catch (error) {
      console.error("Failed to save product:", error);
      // Revert optimistic layout on database failure
      setOptimisticProducts(originalProducts);
      alert("Failed to save product.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const originalProducts = optimisticProducts;
      
      // 1. Optimistic Filter (Instant fade-away)
      setOptimisticProducts(prev => prev.filter(p => p.id !== id));
      
      try {
        await deleteProduct(id);
        await refreshProducts(true);
      } catch (err) {
        console.error("Failed to delete product:", err);
        // Revert local state
        setOptimisticProducts(originalProducts);
        alert("Failed to delete product.");
      }
    }
  };

  const handleStockUpdate = async (id: string, currentStock: number, increment: number) => {
    const newStock = Math.max(0, currentStock + increment);
    const newStatus = newStock > 0 ? 'In Stock' : 'Out of Stock';
    const originalProducts = optimisticProducts;

    // 1. Optimistic Local Stock Update (Immediate button reaction)
    setOptimisticProducts(prev => 
      prev.map(p => p.id === id ? { ...p, stock: newStock, stockStatus: newStatus } : p)
    );

    try {
      await updateProduct(id, { 
        stock: newStock, 
        stockStatus: newStatus 
      });
      await refreshProducts(true);
    } catch (err) {
      console.error("Failed to update stock:", err);
      // Revert stock representation
      setOptimisticProducts(originalProducts);
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    const originalProducts = optimisticProducts;

    // 1. Optimistic switch slide (Immediate On/Off visual reaction)
    setOptimisticProducts(prev => 
      prev.map(p => p.id === id ? { ...p, featured: !currentFeatured } : p)
    );

    try {
      await updateProduct(id, { featured: !currentFeatured });
      await refreshProducts(true);
    } catch (err) {
      console.error("Failed to toggle homepage status:", err);
      // Revert switch layout
      setOptimisticProducts(originalProducts);
      alert("Failed to toggle homepage status.");
    }
  };

  const toggleBestseller = async (id: string, currentBestseller: boolean) => {
    const originalProducts = optimisticProducts;

    // 1. Optimistic switch slide (Immediate On/Off visual reaction)
    setOptimisticProducts(prev => 
      prev.map(p => p.id === id ? { ...p, bestseller: !currentBestseller } : p)
    );

    try {
      await updateProduct(id, { bestseller: !currentBestseller });
      await refreshProducts(true);
    } catch (err) {
      console.error("Failed to toggle bestseller status:", err);
      // Revert switch layout
      setOptimisticProducts(originalProducts);
      alert("Failed to toggle bestseller status.");
    }
  };

  if (isFormOpen) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm animate-fade-in">
        <div className="flex justify-between items-center mb-8 border-b border-gray-55 pb-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-xs text-gray-400 font-medium mt-1">Configure product specs, stock status, and pricing.</p>
          </div>
          <button onClick={() => setIsFormOpen(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Info details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-55 pb-3">General Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Product Title</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl py-3.5 px-5 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300 text-sm focus:ring-4 focus:ring-[#ff6600]/5" placeholder="e.g. Longi Hi-MO 6 Solar Panel 550W" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Category</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl py-3.5 px-5 outline-none font-bold text-gray-900 transition-all text-sm focus:ring-4 focus:ring-[#ff6600]/5">
                        <option>Solar Panels</option>
                        <option>Solar Inverters</option>
                        <option>Lithium Batteries</option>
                        <option>AC/DC Breakers</option>
                        <option>Wires/Cables</option>
                        <option>Accessories</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Brand</label>
                      <select required value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl py-3.5 px-5 outline-none font-bold text-gray-900 transition-all text-sm focus:ring-4 focus:ring-[#ff6600]/5">
                        <option value="" disabled>Select a brand</option>
                        <option value="Coretech">Coretech</option>
                        <option value="Sunwooda">Sunwooda</option>
                        <option value="Phoenix">Phoenix</option>
                        <option value="Inverex">Inverex</option>
                        <option value="Sunflx">Sunflx</option>
                        <option value="Solis">Solis</option>
                        <option value="Jinko">Jinko</option>
                        <option value="Longi">Longi</option>
                        <option value="Mora">Mora</option>
                        <option value="Itel">Itel</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Price (PKR)</label>
                      <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl py-3.5 px-5 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300 text-sm focus:ring-4 focus:ring-[#ff6600]/5" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Compare Price (Optional)</label>
                      <input type="number" value={formData.comparePrice} onChange={e => setFormData({...formData, comparePrice: Number(e.target.value)})} className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl py-3.5 px-5 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300 text-sm focus:ring-4 focus:ring-[#ff6600]/5" placeholder="0" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Stock Quantity</label>
                      <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl py-3.5 px-5 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300 text-sm focus:ring-4 focus:ring-[#ff6600]/5" placeholder="10" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Rating (1 to 5)</label>
                      <input required type="number" min="1" max="5" step="0.1" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl py-3.5 px-5 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300 text-sm focus:ring-4 focus:ring-[#ff6600]/5" placeholder="5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Shipping Charge (PKR) — Set 0 for Free Shipping</label>
                      <input 
                        required
                        type="number" 
                        min="0" 
                        placeholder="e.g. 250" 
                        value={formData.shippingCharge === undefined || formData.shippingCharge === null ? 0 : formData.shippingCharge} 
                        onChange={e => setFormData({...formData, shippingCharge: Number(e.target.value)})} 
                        className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl py-3.5 px-5 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300 text-sm focus:ring-4 focus:ring-[#ff6600]/5" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Short Description</label>
                    <textarea rows={3} required value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} className="w-full bg-gray-55 border-2 border-transparent focus:border-[#ff6600]/20 focus:bg-white rounded-2xl py-3.5 px-5 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300 text-sm focus:ring-4 focus:ring-[#ff6600]/5" placeholder="Brief outline of key features..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Media & Flags */}
            <div className="space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Media Assets</h3>
                  {!!(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) ? (
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-100 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Cloudinary Engine Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-100 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                      Firebase Fallback active
                    </span>
                  )}
                </div>
                
                {/* Hidden replace image file input */}
                <input 
                  type="file" 
                  id="replace-image-input" 
                  accept="image/*" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0] && replacingIndex !== null) {
                      handleImageReplace(e.target.files[0], replacingIndex);
                    }
                  }} 
                  className="hidden" 
                />

                <div 
                  className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${dragActive ? 'border-[#ff6600] bg-orange-50/50 scale-98 shadow-inner' : 'border-gray-200 hover:border-[#ff6600]/50'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => e.target.files && e.target.files[0] && handleImageUpload(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isUploading}
                  />
                  {isUploading && replacingIndex === null ? (
                    <div className="flex flex-col items-center justify-center text-gray-500 pointer-events-none py-4">
                      <div className="w-8 h-8 border-4 border-[#ff6600] border-t-transparent rounded-full animate-spin mb-3"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#ff6600]">Uploading File...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 pointer-events-none py-2">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-3 border border-gray-100">
                        <ImageIcon size={20} className="text-gray-400" />
                      </div>
                      <p className="text-xs font-black text-gray-700 uppercase tracking-wider">Drag & Drop Image</p>
                      <p className="text-[10px] text-gray-400 mt-1">or browse locally</p>
                    </div>
                  )}
                </div>

                {/* Uploaded Images Preview Grid */}
                {formData.images && formData.images.length > 0 && formData.images[0] !== '/placeholder.png' && (
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square bg-gray-55 rounded-2xl border border-gray-100 p-2 flex items-center justify-center overflow-hidden group shadow-sm hover:border-[#ff6600]/25 transition-all duration-300">
                        <img src={img} alt="Product preview" className="max-w-full max-h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2.5 p-2 rounded-2xl">
                          <span className="text-[8px] font-black text-white uppercase tracking-widest bg-black/30 px-2 py-1 rounded-md">
                            Image {idx + 1}
                          </span>
                          <div className="flex gap-2">
                            <button 
                              type="button" 
                              title="Replace Image"
                              onClick={() => {
                                setReplacingIndex(idx);
                                document.getElementById('replace-image-input')?.click();
                              }}
                              className="w-8 h-8 rounded-xl bg-white text-gray-900 flex items-center justify-center hover:bg-[#ff6600] hover:text-white transition-all cursor-pointer shadow-md active:scale-90"
                            >
                              <RefreshCw size={14} className={isUploading && replacingIndex === idx ? "animate-spin" : ""} />
                            </button>
                            <button 
                              type="button" 
                              title="Delete Image"
                              onClick={() => handleRemoveImage(idx)}
                              className="w-8 h-8 rounded-xl bg-white text-gray-900 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-md active:scale-90"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-55 pb-3">Visibility & Status</h3>
                
                <div className="flex items-center justify-between p-4 bg-gray-55/50 rounded-2xl border border-gray-100/50">
                  <div>
                    <span className="text-xs font-black text-gray-700 block uppercase tracking-wider">Homepage</span>
                    <span className="text-[10px] text-gray-400">Featured collection</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, featured: !formData.featured})}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-all duration-300 focus:outline-none ${formData.featured ? 'bg-[#ff6600] border-[#ff6600]' : 'bg-gray-100 border-gray-300'} cursor-pointer`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.featured ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-55/50 rounded-2xl border border-gray-100/50">
                  <div>
                    <span className="text-xs font-black text-gray-700 block uppercase tracking-wider">Bestseller</span>
                    <span className="text-[10px] text-gray-400">Popularity highlights</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, bestseller: !formData.bestseller})}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-all duration-300 focus:outline-none ${formData.bestseller ? 'bg-[#ff6600] border-[#ff6600]' : 'bg-gray-100 border-gray-300'} cursor-pointer`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${formData.bestseller ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest text-white bg-[#ff6600] hover:bg-orange-600 transition-colors disabled:opacity-50 shadow-lg shadow-orange-100 cursor-pointer">
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm animate-fade-in">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Products Catalog</h2>
          <p className="text-gray-500 text-sm mt-1">Manage real-time inventory, pricing structures, and highlights.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Reset Button */}
          <button 
            disabled={isResetting || isLoading}
            onClick={async () => {
              if (confirm("This will clear all custom edits and restore the 100% compliant, high-density sample products in Firestore. Proceed?")) {
                setIsResetting(true);
                try {
                  await reseedDatabase();
                  await refreshProducts();
                  alert("Database reset and sample products seeded successfully!");
                } catch (err) {
                  console.error("Failed to reset database:", err);
                  alert("Failed to reset database.");
                } finally {
                  setIsResetting(false);
                }
              }
            }}
            className="border border-gray-200 text-gray-700 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50 cursor-pointer shadow-sm shrink-0"
          >
            <RotateCcw size={14} className={isResetting ? "animate-spin" : ""} /> 
            {isResetting ? "Resetting..." : "Reset Data"}
          </button>

          {/* Search Box */}
          <div className="relative flex-grow md:flex-grow-0 md:w-64">
            <input 
              type="text" 
              placeholder="Search by title, brand..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-transparent bg-gray-55 rounded-2xl text-sm focus:border-[#ff6600]/10 focus:bg-white outline-none font-bold text-gray-900 transition-all"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Category Filter */}
          <div className="relative flex-grow md:flex-grow-0 md:w-48">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-transparent bg-gray-55 rounded-2xl text-sm focus:border-[#ff6600]/10 focus:bg-white outline-none font-bold text-gray-900 transition-all cursor-pointer appearance-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Add Product Button */}
          <button 
            onClick={() => handleOpenForm()}
            className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#ff6600] transition-colors whitespace-nowrap cursor-pointer shadow-md shadow-gray-200"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {isLoading && optimisticProducts.length === 0 ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product info</th>
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price details</th>
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Stock Manager</th>
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Homepage</th>
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Bestseller</th>
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Badges</th>
                  <th className="py-5 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-orange-50/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-sm group-hover:border-orange-100 transition-colors">
                          <CloudinaryImage src={product.images[0]} alt={product.title} width={100} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-900 group-hover:text-[#ff6600] transition-colors">{product.title}</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[9px] bg-gray-100 text-gray-500 font-black uppercase tracking-wider px-2 py-0.5 rounded">
                              {product.category}
                            </span>
                            <span className="text-[9px] bg-orange-50 text-[#ff6600] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                              {product.brand}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-sm text-gray-900">PKR {product.price.toLocaleString()}</div>
                      {product.comparePrice ? (
                        <div className="text-[10px] text-gray-400 line-through mt-0.5">PKR {product.comparePrice.toLocaleString()}</div>
                      ) : null}
                      {product.shippingCharge !== undefined && product.shippingCharge !== null && product.shippingCharge > 0 ? (
                        <span className="inline-block text-[8px] bg-amber-50 text-amber-700 border border-amber-200/50 font-black uppercase tracking-widest px-1.5 py-0.5 rounded mt-1">
                          Shipping: Rs. {product.shippingCharge.toLocaleString()}
                        </span>
                      ) : (
                        <span className="inline-block text-[8px] bg-green-50 text-green-700 border border-green-200/50 font-black uppercase tracking-widest px-1.5 py-0.5 rounded mt-1">
                          Free Shipping
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleStockUpdate(product.id, product.stock || 0, -1)} className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-[#ff6600]/10 hover:text-[#ff6600] border border-transparent hover:border-[#ff6600]/25 flex items-center justify-center text-gray-500 font-bold transition-all cursor-pointer shadow-sm">-</button>
                        <span className="font-black text-sm w-8 text-center text-gray-900">{product.stock || 0}</span>
                        <button onClick={() => handleStockUpdate(product.id, product.stock || 0, 1)} className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-[#ff6600]/10 hover:text-[#ff6600] border border-transparent hover:border-[#ff6600]/25 flex items-center justify-center text-gray-500 font-bold transition-all cursor-pointer shadow-sm">+</button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => toggleFeatured(product.id, !!product.featured)}
                          title={product.featured ? "Remove from homepage" : "Show on homepage"}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-all duration-300 focus:outline-none ${product.featured ? 'bg-[#ff6600] border-[#ff6600] shadow-md shadow-orange-100' : 'bg-gray-100 border-gray-300'} cursor-pointer`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${product.featured ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => toggleBestseller(product.id, !!product.bestseller)}
                          title={product.bestseller ? "Remove from bestsellers" : "Mark as bestseller"}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-all duration-300 focus:outline-none ${product.bestseller ? 'bg-[#ff6600] border-[#ff6600] shadow-md shadow-orange-100' : 'bg-gray-100 border-gray-300'} cursor-pointer`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${product.bestseller ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {(product.stock || 0) > 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            In Stock
                          </span>
                        ) : (
                          <span className="text-red-700 bg-red-50 border border-red-100 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Sold Out
                          </span>
                        )}
                        {product.featured && (
                          <span className="text-[#ff6600] bg-orange-50 border border-orange-100 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6600]" />
                            Featured
                          </span>
                        )}
                        {product.bestseller && (
                          <span className="text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Bestseller
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleOpenForm(product)} className="w-8 h-8 rounded-xl bg-gray-55 hover:bg-blue-55 text-gray-400 hover:text-blue-500 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-blue-100"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(product.id)} className="w-8 h-8 rounded-xl bg-gray-55 hover:bg-red-55 text-gray-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-red-100"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-white">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400 border border-gray-100">
                <Search size={24} />
              </div>
              <p className="font-bold text-gray-700 uppercase text-sm tracking-wider">No matching products</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search keywords.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
