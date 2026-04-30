import { Product, BlogItem, ShowcaseItem } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy
} from 'firebase/firestore';

export const api = {
  async getProducts(): Promise<Product[]> {
    const path = 'products';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getShowcaseItems(): Promise<ShowcaseItem[]> {
    const path = 'showcase';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShowcaseItem));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addShowcaseItem(item: Omit<ShowcaseItem, 'id'>) {
    const path = 'showcase';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...item,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteShowcaseItem(id: string) {
    const path = `showcase/${id}`;
    try {
      await deleteDoc(doc(db, 'showcase', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async getBlogs(): Promise<BlogItem[]> {
    const path = 'blogs';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogItem));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async createOrder(order: { items: unknown[], total: number }) {
    const path = 'orders';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...order,
        createdAt: new Date().toISOString() // Or serverTimestamp() if rules are updated to check for it
      });
      return { id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Note: For now, we still have the local API for login if we haven't migrated Auth
  // But since we are moving to Firebase, I'll recommend using Firebase Auth directly in the UI.
  async adminLogin(password: string) {
    // Legacy API call - might still be needed if server.ts is running
    const res = await fetch(`/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  async getAdminOrders() {
    const path = 'orders';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addProduct(product: Omit<Product, 'id'>) {
    const path = 'products';
    try {
      const docRef = await addDoc(collection(db, path), product);
      return { id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteProduct(id: string) {
    const path = `products/${id}`;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
