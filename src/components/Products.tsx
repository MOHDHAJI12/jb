import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product } from '../types';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, Eye, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

import { useNavigate } from 'react-router-dom';

import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Trash2 } from 'lucide-react';

export default function Products() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    api.getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = user?.email?.toLowerCase() === 'mohdhaji0112@gmail.com';

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete product. Check console for details.');
      }
    }
  };

  return (
    <section className="py-20 bg-gray-50" id="shop">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-green-600 font-serif italic text-xl mb-2 block">Organic Food</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">New Arrivals</h2>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium tracking-widest uppercase text-xs">Freshing fruits...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-3xl p-6 shadow-sm border border-transparent hover:border-green-100 hover:shadow-xl transition-all relative overflow-hidden"
              id={`product-${product.id}`}
            >
              {product.isNew && (
                <span className="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10">
                  NEW
                </span>
              )}

              {isAdmin && (
                <button 
                  onClick={(e) => handleDelete(product.id, e)}
                  className="absolute top-4 right-4 bg-red-50 text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500 hover:text-white shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <div className="relative aspect-square mb-6 overflow-hidden rounded-2xl">
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

              <div className="text-center">
                <span className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-1 block">
                  {product.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-2">
                  {product.name}
                </h3>
                <p className="text-xl font-bold text-gray-900">{product.price}</p>
              </div>
            </motion.div>
            ))}
          </div>
        )}
        
        <div className="mt-16 text-center">
          <button 
            onClick={() => navigate('/products')}
            className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:bg-green-600 transition-all shadow-lg shadow-gray-200"
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}
