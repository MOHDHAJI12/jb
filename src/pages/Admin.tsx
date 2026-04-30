import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ShoppingBag, Package, Trash2, Plus, LogOut, ChevronLeft, LogIn, Database, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ShowcaseItem } from '../types';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [orders, setOrders] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<Product[]>([]);
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'showcase'>('orders');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingShowcase, setIsAddingShowcase] = useState(false);
  const [error, setError] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    image: '',
    category: 'Fruit',
    isNew: false
  });

  const [newShowcaseItem, setNewShowcaseItem] = useState({
    image: '',
    title: '',
    description: ''
  });

  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [showcaseToDelete, setShowcaseToDelete] = useState<string | null>(null);

  const loadData = async () => {
    try {
      console.log('Loading admin data for user:', auth.currentUser?.email);
      const [receivedOrders, receivedProducts, receivedShowcase] = await Promise.all([
        api.getAdminOrders(),
        api.getProducts(),
        api.getShowcaseItems()
      ]);
      console.log('Admin data loaded successfully');
      setOrders(receivedOrders);
      setProducts(receivedProducts);
      setShowcaseItems(receivedShowcase);
    } catch (error) {
      console.error("Failed to load admin data:", error);
      setError('Failed to load admin data. You may not have permissions.');
    }
  };

  const ensureAdminRecord = async () => {
    if (!auth.currentUser) return;
    try {
      const adminDoc = await getDoc(doc(db, 'admins', auth.currentUser.uid));
      const email = auth.currentUser.email?.toLowerCase();
      const isAdminEmail = email === 'mohdhaji0112@gmail.com' || email === 'syedimran1029@gmail.com';
      
      if (!adminDoc.exists() && isAdminEmail) {
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

  const handleSeedData = async () => {
    if (!window.confirm('This will populate the database with sample products. Continue?')) return;
    setIsSeeding(true);
    try {
      const { PRODUCTS } = await import('../constants');
      for (const p of PRODUCTS) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...data } = p;
        await api.addProduct(data);
      }
      alert('Sample data added successfully!');
      loadData();
    } catch (error) {
      console.error('Seeding failed:', error);
      setError('Seeding failed. See console for details.');
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        console.log('User signed in:', u.email, 'UID:', u.uid);
        const newlyPromoted = await ensureAdminRecord();
        if (newlyPromoted) {
          console.log('Successfully promoted to admin');
        }
        loadData();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch {
      setError('Login failed');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to ~800KB to stay safe within Firestore 1MB document limit)
    if (file.size > 800000) {
      alert('File is too large. Please choose an image under 800KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleShowcaseImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800000) {
      alert('File is too large. Please choose an image under 800KB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewShowcaseItem(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addProduct(newProduct);
      setIsAddingProduct(false);
      setNewProduct({ name: '', price: '', image: '', category: 'Fruit', isNew: false });
      loadData();
    } catch {
      setError('Failed to add product');
    }
  };

  const handleAddShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addShowcaseItem(newShowcaseItem);
      setIsAddingShowcase(false);
      setNewShowcaseItem({ image: '', title: '', description: '' });
      loadData();
    } catch {
      setError('Failed to add showcase item');
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    const id = productToDelete;
    console.log('Admin: confirmed deletion for ID:', id);
    try {
      setError('');
      await api.deleteProduct(id);
      console.log('Product deleted from admin successfully:', id);
      setProducts(prev => prev.filter(p => p.id !== id));
      alert('Product deleted successfully.');
    } catch (error) {
      console.error('Failed to delete product from admin:', error);
      let msg = 'Failed to delete product.';
      if (error instanceof Error) {
        try {
          const info = JSON.parse(error.message);
          msg = `Delete Failed: ${info.error}`;
        } catch {
          msg = error.message;
        }
      }
      setError(msg);
      alert(msg);
    } finally {
      setProductToDelete(null);
    }
  };

  const confirmDeleteShowcase = async () => {
    if (!showcaseToDelete) return;
    const id = showcaseToDelete;
    try {
      await api.deleteShowcaseItem(id);
      setShowcaseItems(prev => prev.filter(p => p.id !== id));
      alert('Showcase item deleted successfully.');
    } catch (error) {
      console.error('Failed to delete showcase item:', error);
      alert('Failed to delete showcase item');
    } finally {
      setShowcaseToDelete(null);
    }
  };

  const handleDeleteProduct = (id: string) => {
    console.log('Admin: handleDeleteProduct called with id:', id);
    setProductToDelete(id);
  };

  const handleDeleteShowcase = (id: string) => {
    setShowcaseToDelete(id);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-3xl">JB</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center">Admin Access</h1>
            <p className="text-gray-500 text-sm mb-2">Please sign in with Google to continue</p>
            {user && (
              <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-xs font-medium">
                Logged in as: {user.email}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white border-2 border-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-3"
            >
              <LogIn className="w-5 h-5 text-green-600" />
              Sign in with Google
            </button>
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xl">JB</span>
          </div>
          <span className="font-bold text-xl tracking-tight">Admin</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'orders' ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          >
            <ShoppingBag className="w-5 h-5" />
            Orders
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'products' ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          >
            <Package className="w-5 h-5" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('showcase')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'showcase' ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
          >
            <Upload className="w-5 h-5" />
            Showcase
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 capitalize">{activeTab}</h2>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
            <div className="flex gap-4">
              {products.length === 0 && (
                <button
                  onClick={handleSeedData}
                  disabled={isSeeding}
                  className="bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-100 transition-all disabled:opacity-50"
                >
                  <Database className={`w-5 h-5 ${isSeeding ? 'animate-pulse' : ''}`} />
                  {isSeeding ? 'Seeding...' : 'Seed Initial Data'}
                </button>
              )}
              {activeTab === 'products' && (
                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all"
                >
                  <Plus className="w-5 h-5" /> Add Product
                </button>
              )}
              {activeTab === 'showcase' && (
                <button
                  onClick={() => setIsAddingShowcase(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all"
                >
                  <Plus className="w-5 h-5" /> Add Showcase Item
                </button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'orders' ? (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden"
              >
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-8 py-6 text-sm font-bold text-gray-500 uppercase tracking-widest">Order ID</th>
                      <th className="px-8 py-6 text-sm font-bold text-gray-500 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-6 text-sm font-bold text-gray-500 uppercase tracking-widest">Items</th>
                      <th className="px-8 py-6 text-sm font-bold text-gray-500 uppercase tracking-widest text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">No orders yet</td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-6 font-bold text-gray-900">#{order.id}</td>
                          <td className="px-8 py-6 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="px-8 py-6 text-gray-500">
                            {order.items.length} items
                          </td>
                          <td className="px-8 py-6 font-bold text-green-600 text-right">₹{order.total.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </motion.div>
            ) : activeTab === 'products' ? (
              <motion.div
                key="products"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {products.map((product) => (
                  <div key={product.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex gap-4 group">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                        <p className="text-sm text-green-600 font-semibold">{product.price}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border px-2 py-1 rounded-full">{product.category}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Admin: Delete button clicked for product', product.id);
                            handleDeleteProduct(product.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer z-20"
                          title="Delete Product"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="showcase"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {showcaseItems.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-4 group">
                    <div className="relative aspect-video">
                      <img
                        src={item.image}
                        alt={item.title || 'Showcase'}
                        className="w-full h-full rounded-2xl object-cover"
                      />
                      <button
                        onClick={() => handleDeleteShowcase(item.id)}
                        className="absolute bottom-4 right-4 p-2 bg-white/90 text-red-500 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    {item.title && (
                      <div>
                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                        {item.description && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.description}</p>}
                      </div>
                    )}
                  </div>
                ))}
                {showcaseItems.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-400 italic">No showcase items yet</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddingProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingProduct(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 m-auto w-full max-w-xl h-fit bg-white rounded-[40px] shadow-2xl z-[201] p-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Add New Product</h3>
                <button onClick={() => setIsAddingProduct(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Name</label>
                    <input
                      type="text"
                      required
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                      placeholder="e.g. Fuji Apple"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Price</label>
                    <input
                      type="text"
                      required
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                      placeholder="e.g. ₹12.50/kg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2 block mb-2">Product Image</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* URL Input */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">URL Mode</label>
                      <input
                        type="url"
                        value={newProduct.image.startsWith('data:') ? '' : newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm"
                        placeholder="https://..."
                      />
                    </div>

                    {/* Upload Input */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Device Upload</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full px-6 py-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-3 text-gray-400 group-hover:border-green-500 transition-all">
                          <Upload className="w-5 h-5" />
                          <span className="text-sm font-medium">Choose File</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {newProduct.image && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 relative w-24 h-24 group"
                    >
                      <img 
                        src={newProduct.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-2xl border-2 border-green-500 shadow-lg"
                      />
                      <button 
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, image: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Plus className="w-4 h-4 rotate-45" />
                      </button>
                      <div className="absolute inset-x-0 -bottom-6 flex justify-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Preview</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all appearance-none"
                    >
                      <option>Fruit</option>
                      <option>Vegetable</option>
                      <option>Nuts</option>
                      <option>Juice</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4 pt-8">
                    <input
                      type="checkbox"
                      id="isNew"
                      checked={newProduct.isNew}
                      onChange={(e) => setNewProduct({ ...newProduct, isNew: e.target.checked })}
                      className="w-6 h-6 rounded-lg accent-green-600"
                    />
                    <label htmlFor="isNew" className="font-bold text-gray-900 cursor-pointer">Mark as New Arrival</label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all shadow-xl"
                >
                  Confirm and Add
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Showcase Item Modal */}
      <AnimatePresence>
        {isAddingShowcase && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingShowcase(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 m-auto w-full max-w-xl h-fit bg-white rounded-[40px] shadow-2xl z-[201] p-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Add Showcase Item</h3>
                <button onClick={() => setIsAddingShowcase(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddShowcase} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2 block mb-2">Showcase Image</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">URL Mode</label>
                      <input
                        type="url"
                        value={newShowcaseItem.image.startsWith('data:') ? '' : newShowcaseItem.image}
                        onChange={(e) => setNewShowcaseItem({ ...newShowcaseItem, image: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Device Upload</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleShowcaseImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-full px-6 py-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-3 text-gray-400 group-hover:border-green-500 transition-all">
                          <Upload className="w-5 h-5" />
                          <span className="text-sm font-medium">Choose File</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {newShowcaseItem.image && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 relative aspect-video w-full group">
                      <img src={newShowcaseItem.image} alt="Preview" className="w-full h-full object-cover rounded-2xl border-2 border-green-500" />
                      <button type="button" onClick={() => setNewShowcaseItem({ ...newShowcaseItem, image: '' })} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg">
                        <Plus className="w-4 h-4 rotate-45" />
                      </button>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Title (Optional)</label>
                  <input
                    type="text"
                    value={newShowcaseItem.title}
                    onChange={(e) => setNewShowcaseItem({ ...newShowcaseItem, title: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                    placeholder="e.g. Fresh Seasonal Selection"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Description (Optional)</label>
                  <textarea
                    value={newShowcaseItem.description}
                    onChange={(e) => setNewShowcaseItem({ ...newShowcaseItem, description: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                    placeholder="e.g. Hand-picked fresh from our local farms this morning."
                    rows={3}
                  />
                </div>

                <button type="submit" className="w-full bg-green-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all shadow-xl">
                  Confirm and Add to Showcase
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Delete Showcase */}
      <AnimatePresence>
        {showcaseToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
              onClick={() => setShowcaseToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-white rounded-[40px] shadow-2xl z-[301] p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Showcase?</h3>
              <p className="text-gray-500 mb-8">This item will be removed from the home gallery.</p>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowcaseToDelete(null)} className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all">Cancel</button>
                <button type="button" onClick={confirmDeleteShowcase} className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-200">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Delete */}
      <AnimatePresence>
        {productToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
              onClick={() => setProductToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-sm h-fit bg-white rounded-[40px] shadow-2xl z-[301] p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
              <p className="text-gray-500 mb-8">This action cannot be undone. This product will be permanently removed.</p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 right-8 z-[50]">
        <Link 
          to="/"
          className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold shadow-xl border border-gray-100 flex items-center gap-2 hover:text-green-600 transition-all"
        >
          <ChevronLeft className="w-5 h-5" /> Main Site
        </Link>
      </div>
    </div>
  );
}
