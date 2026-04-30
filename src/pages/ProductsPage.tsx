import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Heart, Eye, Loader2, Trash2, ChevronLeft, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

export default function ProductsPage() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const ensureAdminRecord = async () => {
    if (!auth.currentUser) return;
    try {
      const { doc, getDoc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const adminDoc = await getDoc(doc(db, 'admins', auth.currentUser.uid));
      if (!adminDoc.exists() && auth.currentUser.email?.toLowerCase() === 'mohdhaji0112@gmail.com') {
        console.log('Registering official admin record...');
        await setDoc(doc(db, 'admins', auth.currentUser.uid), {
          email: auth.currentUser.email,
          role: 'owner',
          createdAt: new Date().toISOString()
        });
        return true;
      }
    } catch (e) {
      console.error('Failed to register admin record:', e);
    }
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        console.log('User status:', {
          email: u.email,
          uid: u.uid,
          emailVerified: u.emailVerified
        });
        await ensureAdminRecord();
      }
    });
    
    api.getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Initiating delete for product:', id);
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        console.log('Delete successful for ID:', id);
        setProducts(products.filter(p => p.id !== id));
        alert('Product deleted successfully.');
      } catch (error) {
        console.error('Delete operation failed:', error);
        
        let detailedError = "Unknown error occurred";
        if (error instanceof Error) {
          try {
            // Attempt to parse our custom JSON error
            const info = JSON.parse(error.message);
            detailedError = `${info.error}`;
          } catch {
            detailedError = error.message;
          }
        }
        
        alert(`Failed to delete product: ${detailedError}`);
      }
    }
  };

  const categories = ['All', 'Fruit', 'Vegetable', 'Nuts', 'Juice'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Check if user is the specific admin email
  const isAdmin = user?.email?.toLowerCase() === 'mohdhaji0112@gmail.com';

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-green-600 font-medium mb-4 transition-colors"
                id="back-button"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <div className="flex items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
                  Our Fresh <span className="text-green-600 italic font-serif">Products</span>
                </h1>
                {isAdmin && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-green-200">
                    Admin Mode
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all w-full sm:w-64"
                />
              </div>
              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-transparent">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      selectedCategory === cat 
                        ? 'bg-white text-green-600 shadow-sm' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
              <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Harvesting inventory...</p>
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-40 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">No products found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:border-green-100 hover:shadow-2xl transition-all relative overflow-hidden flex flex-col"
                        id={`product-page-item-${product.id}`}
                      >
                        {product.isNew && (
                          <span className="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10">
                            NEW
                          </span>
                        )}

                        {isAdmin && (
                          <button 
                            onClick={(e) => handleDelete(product.id, e)}
                            className="absolute top-4 right-4 bg-red-50 text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        
                        <div className="relative aspect-square mb-6 overflow-hidden rounded-2xl bg-gray-50">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* Overlay actions */}
                          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3 translate-y-20 group-hover:translate-y-0 transition-transform duration-300">
                            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:text-white transition-all text-gray-700">
                              <Heart className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => addToCart(product)}
                              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:text-white transition-all text-gray-700"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:text-white transition-all text-gray-700">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-center flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1 block">
                              {product.category}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-2 line-clamp-1">
                              {product.name}
                            </h3>
                          </div>
                          <p className="text-2xl font-black text-gray-900 mt-2">{product.price}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
