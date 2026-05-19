import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  addDoc, 
  orderBy, 
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, dummyProducts } from '../data/dummyProducts';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  blocked?: boolean;
  totalOrders?: number;
  totalSpent?: number;
  priceAlertsEnabled?: boolean;
  wishlist?: string[];
  createdAt: any;
  updatedAt?: any;
  addresses?: {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
  }[];
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id?: string;
  userId: string;
  trackingNumber: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: {
    fullName: string;
    email: string;
    phoneNumber: string;
    street: string;
    city: string;
    province: string;
    notes?: string;
  };
  paymentMethod: 'COD' | 'Bank Transfer';
  paymentScreenshot?: string;
  paymentVerified?: boolean;
  paymentVerifiedAt?: any;
  paymentStatus?: 'Unpaid' | 'Paid';
  createdAt: any;
}

export interface Review {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

// ==========================================
// 1. USER PROFILE HELPERS
// ==========================================

/**
 * Creates or updates a user profile document in Firestore
 */
export async function createUserProfile(uid: string, profileData: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const existingDoc = await getDoc(userRef);

  const dataToSave = {
    uid,
    email: profileData.email || '',
    fullName: profileData.fullName || '',
    role: profileData.role || 'user',
    phoneNumber: profileData.phoneNumber || '',
    addresses: profileData.addresses || [],
    priceAlertsEnabled: profileData.priceAlertsEnabled || false,
    updatedAt: serverTimestamp(),
  };

  if (!existingDoc.exists()) {
    // New user signup
    await setDoc(userRef, {
      ...dataToSave,
      createdAt: serverTimestamp(),
    });
    // Trigger automated WhatsApp notification in background
    try {
      const { notifyNewSignup } = await import('@/utils/whatsapp');
      notifyNewSignup(dataToSave.fullName, dataToSave.email).catch(e => 
        console.error('WhatsApp notify error:', e)
      );
    } catch (err) {
      console.error('Failed to load WhatsApp sign-up notifier:', err);
    }
  } else {
    // Existing user update
    await updateDoc(userRef, dataToSave);
  }
}

/**
 * Fetches a user profile document by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  return null;
}

/**
 * Updates specific fields in user profile
 */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Admin: Fetches all registered user profiles
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const usersCol = collection(db, 'users');
  const snapshot = await getDocs(usersCol);
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
}

/**
 * Admin: Blocks or unblocks a user profile in Firestore
 */
export async function blockUserProfile(uid: string, blocked: boolean): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    blocked,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Admin: Changes a user's access role (admin / user)
 */
export async function changeUserRole(uid: string, role: UserProfile['role']): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    role,
    updatedAt: serverTimestamp(),
  });
}

// ==========================================
// 2. PRODUCT CRUD HELPERS
// ==========================================

/**
 * Retrieves all products from Firestore.
 * Automatically seeds the database with dummyProducts if the collection is empty.
 */
export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const snapshot = await getDocs(productsCol);

  // Dynamic self-healing migration: Ensure all 6 standard dummy products exist in Firestore
  try {
    const migrationRef = doc(db, 'metadata', 'migration');
    const migrationDoc = await getDoc(migrationRef);

    if (!migrationDoc.exists()) {
      console.log('Running initial database migration: Seeding all 6 standard dummy products...');
      
      const productsToSeed = dummyProducts.map((product, index) => {
        return {
          ...product,
          featured: index < 3, // First 3 products are featured
          bestseller: index === 1 || index === 2 || index === 4, // Specify some as bestseller
          stock: product.stockStatus === 'Out of Stock' ? 0 : (product.stockStatus === 'Low Stock' ? 2 : 15),
          createdAt: new Date(),
        };
      });

      for (const product of productsToSeed) {
        const { id, ...dataWithoutId } = product;
        const productRef = doc(db, 'products', id);
        const existingDoc = await getDoc(productRef);
        // Only seed if it doesn't already exist to protect user additions
        if (!existingDoc.exists()) {
          await setDoc(productRef, dataWithoutId);
        }
      }

      await setDoc(migrationRef, {
        migratedDummyProducts: true,
        migratedAt: serverTimestamp(),
      });

      // Refetch the snapshot so we return the latest live products list
      const newSnapshot = await getDocs(productsCol);
      return newSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          featured: data.featured === undefined ? false : data.featured,
          bestseller: data.bestseller === undefined ? false : data.bestseller,
          stock: data.stock === undefined ? (data.stockStatus === 'Out of Stock' ? 0 : 10) : data.stock,
          createdAt: data.createdAt || null,
        } as Product;
      });
    }
  } catch (err) {
    console.error('Migration checks failed:', err);
  }

  // Graceful fallback to seeding if the collection is empty for any reason
  if (snapshot.empty) {
    console.log('Products collection is empty. Seeding dummy products...');
    await seedProducts();
    const newSnapshot = await getDocs(productsCol);
    return newSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        featured: data.featured === undefined ? false : data.featured,
        bestseller: data.bestseller === undefined ? false : data.bestseller,
        stock: data.stock === undefined ? (data.stockStatus === 'Out of Stock' ? 0 : 10) : data.stock,
        createdAt: data.createdAt || null,
      } as Product;
    });
  }

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      featured: data.featured === undefined ? false : data.featured,
      bestseller: data.bestseller === undefined ? false : data.bestseller,
      stock: data.stock === undefined ? (data.stockStatus === 'Out of Stock' ? 0 : 10) : data.stock,
      createdAt: data.createdAt || null,
    } as Product;
  });
}

/**
 * Fetches a single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const productRef = doc(db, 'products', id);
  const productDoc = await getDoc(productRef);
  if (productDoc.exists()) {
    return { id: productDoc.id, ...productDoc.data() } as Product;
  }
  return null;
}

/**
 * Admin: Add a new product
 */
export async function createProduct(productData: Omit<Product, 'id'>): Promise<string> {
  const productsCol = collection(db, 'products');
  const docRef = await addDoc(productsCol, {
    ...productData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Admin: Update an existing product
 */
export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
  const productRef = doc(db, 'products', id);
  await updateDoc(productRef, {
    ...productData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Admin: Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  const productRef = doc(db, 'products', id);
  await deleteDoc(productRef);
}

/**
 * Admin: Delete an order
 */
export async function deleteOrder(id: string): Promise<void> {
  const orderRef = doc(db, 'orders', id);
  await deleteDoc(orderRef);
}

/**
 * Admin: Delete a user profile
 */
export async function deleteUserProfile(id: string): Promise<void> {
  const userRef = doc(db, 'users', id);
  await deleteDoc(userRef);
}

/**
 * Database Seeder Utility
 */
export async function seedProducts(): Promise<void> {
  const productsToSeed = dummyProducts.map((product, index) => {
    return {
      ...product,
      featured: index < 3, // First 3 products are featured
      bestseller: index === 1 || index === 2 || index === 4, // Specify some as bestseller
      stock: product.stockStatus === 'Out of Stock' ? 0 : (product.stockStatus === 'Low Stock' ? 2 : 15),
      createdAt: new Date(),
    };
  });

  for (const product of productsToSeed) {
    const { id, ...dataWithoutId } = product;
    // Set explicit document IDs based on dummy dataset IDs for consistency
    const productRef = doc(db, 'products', id);
    await setDoc(productRef, dataWithoutId);
  }
  console.log('Seeding completed successfully!');
}

/**
 * Admin: Clear products collection and re-seed with clean default dummy products
 */
export async function reseedDatabase(): Promise<void> {
  const productsCol = collection(db, 'products');
  const snapshot = await getDocs(productsCol);
  
  // Delete all existing products in parallel
  await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
  
  // Seed default products
  await seedProducts();
}

// ==========================================
// 3. ORDER HELPERS
// ==========================================

/**
 * Places a new order
 */
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  // Double-wall security: Abort if user profile is blocked in Firestore
  if (orderData.userId && orderData.userId !== 'guest') {
    const userRef = doc(db, 'users', orderData.userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists() && userDoc.data().blocked) {
      throw new Error("This user account is blocked and cannot place orders.");
    }
  }

  const ordersCol = collection(db, 'orders');
  const docRef = await addDoc(ordersCol, {
    ...orderData,
    createdAt: serverTimestamp(),
  });

  // Dynamically increment customer statistics in Firestore users collection
  if (orderData.userId && orderData.userId !== 'guest') {
    const userRef = doc(db, 'users', orderData.userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentOrders = userData.totalOrders || 0;
      const currentSpent = userData.totalSpent || 0;
      await updateDoc(userRef, {
        totalOrders: currentOrders + 1,
        totalSpent: currentSpent + orderData.total,
        updatedAt: serverTimestamp()
      });
    }
  }

  // Trigger automated WhatsApp notifications in background
  try {
    const { notifyNewOrder, notifyPaymentScreenshot } = await import('@/utils/whatsapp');
    
    // 1. Send Order Details Notification
    notifyNewOrder(orderData, orderData.trackingNumber).catch(e => 
      console.error('WhatsApp notify order error:', e)
    );

    // 2. Send Payment Screenshot Notification if bank transfer with screenshot
    if (orderData.paymentMethod === 'Bank Transfer' && orderData.paymentScreenshot) {
      notifyPaymentScreenshot(
        orderData.shippingAddress?.fullName || 'Guest Customer',
        orderData.trackingNumber
      ).catch(e => 
        console.error('WhatsApp notify screenshot error:', e)
      );
    }
  } catch (err) {
    console.error('Failed to load WhatsApp order notifiers:', err);
  }

  return docRef.id;
}

/**
 * Fetches all orders placed by a specific user
 */
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const ordersCol = collection(db, 'orders');
  const q = query(ordersCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

/**
 * Fetches single order details by tracking number
 */
export async function getOrderByTrackingNumber(trackingNumber: string): Promise<Order | null> {
  const ordersCol = collection(db, 'orders');
  const q = query(ordersCol, where('trackingNumber', '==', trackingNumber));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Order;
  }
  return null;
}

/**
 * Fetches single order details by ID
 */
export async function getOrderById(id: string): Promise<Order | null> {
  const orderRef = doc(db, 'orders', id);
  const orderDoc = await getDoc(orderRef);
  if (orderDoc.exists()) {
    return { id: orderDoc.id, ...orderDoc.data() } as Order;
  }
  return null;
}

/**
 * Admin: Update order shipping / processing status
 */
export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const orderRef = doc(db, 'orders', id);
  await updateDoc(orderRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Admin: Update order payment details (receipt, verified, status)
 */
export async function updateOrderPaymentDetails(
  id: string,
  paymentData: {
    paymentScreenshot?: string;
    paymentVerified?: boolean;
    paymentStatus?: 'Unpaid' | 'Paid';
  }
): Promise<void> {
  const orderRef = doc(db, 'orders', id);
  await updateDoc(orderRef, {
    ...paymentData,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Admin: Fetches all orders placed in the system
 */
export async function getAllOrders(): Promise<Order[]> {
  const ordersCol = collection(db, 'orders');
  const snapshot = await getDocs(ordersCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
}

// ==========================================
// 4. REVIEW HELPERS
// ==========================================

/**
 * Submits a new review for a product
 */
export async function addProductReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
  const reviewsCol = collection(db, 'reviews');
  const docRef = await addDoc(reviewsCol, {
    ...reviewData,
    createdAt: serverTimestamp(),
  });

  // Automatically update the product's ratings & reviewsCount in background
  const productRef = doc(db, 'products', reviewData.productId);
  const productDoc = await getDoc(productRef);
  if (productDoc.exists()) {
    const product = productDoc.data() as Product;
    const currentCount = product.reviewsCount || 0;
    const currentRating = product.rating || 5.0;
    
    const newCount = currentCount + 1;
    const newRating = parseFloat(((currentRating * currentCount + reviewData.rating) / newCount).toFixed(1));

    await updateDoc(productRef, {
      rating: newRating,
      reviewsCount: newCount
    });
  }

  return docRef.id;
}

/**
 * Fetches reviews for a specific product
 */
export async function getProductReviews(productId: string): Promise<Review[]> {
  const reviewsCol = collection(db, 'reviews');
  const q = query(reviewsCol, where('productId', '==', productId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
}

// ==========================================
// 5. SHIPPING SETTINGS HELPERS
// ==========================================

export interface ShippingSettings {
  type: 'free' | 'fixed';
  amount: number;
  thresholdEnabled?: boolean;
  thresholdAmount?: number;
}

/**
 * Fetches the global shipping settings from Firestore settings/shipping document.
 */
export async function getShippingSettings(): Promise<ShippingSettings> {
  try {
    const docRef = doc(db, 'settings', 'shipping');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ShippingSettings;
    }
  } catch (err) {
    console.error("Error reading shipping settings:", err);
  }
  // Default to Free Shipping with no threshold if settings document does not exist yet
  return { type: 'free', amount: 0, thresholdEnabled: false, thresholdAmount: 0 };
}

/**
 * Updates the global shipping settings in Firestore settings/shipping document.
 */
export async function updateShippingSettings(settings: ShippingSettings): Promise<void> {
  const docRef = doc(db, 'settings', 'shipping');
  await setDoc(docRef, settings);
}

