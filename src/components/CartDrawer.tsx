import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { useState } from 'react';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, total, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleWhatsAppCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Save order to backend
      const orderData = {
        items: cart,
        total: total,
      };
      await api.createOrder(orderData);

      const phoneNumber = "919885170407"; // Official number
      const cartDetails = cart
        .map((item) => `${item.name} (${item.quantity}x) - ${item.price}`)
        .join('%0A');
      const message = `Hello JB Fruits! I'd like to place an order:%0A%0A${cartDetails}%0A%0A*Total: ₹${total.toFixed(2)}*%0A%0APlease confirm my order.`;
      
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
      
      clearCart();
      setIsCartOpen(false);
    } catch {
      alert('Failed to process order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                id="close-cart-btn"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Cart is empty</h3>
                  <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-green-600 font-semibold">{item.price}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-200 rounded-full px-2 py-1 bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-green-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-green-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-gray-900 ml-auto">
                          ₹{(parseFloat(item.price.replace(/[^\d.]/g, '')) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="text-2xl font-bold text-gray-900">₹{total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-center text-gray-400">
                  Shipping and taxes calculated at checkout
                </p>
                <button
                  onClick={handleWhatsAppCheckout}
                  disabled={isCheckingOut}
                  className={`w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#128C7E] transition-all flex items-center justify-center gap-3 ${isCheckingOut ? 'opacity-70 cursor-not-allowed' : ''}`}
                  id="whatsapp-checkout-btn"
                >
                  {isCheckingOut ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.222-4.032c1.503.893 3.129 1.364 4.789 1.365 5.279 0 9.571-4.292 9.573-9.571a9.516 9.516 0 00-2.809-6.77 9.518 9.518 0 00-6.769-2.808c-5.277 0-9.571 4.293-9.573 9.571-.001 1.767.485 3.491 1.408 4.996l-1.07 3.906 4.044-1.06zM16.435 13.554c-.303-.153-1.797-.887-2.074-.988-.277-.1-.479-.153-.68.153-.202.307-.783 1.006-.959 1.21-.177.204-.352.23-.655.077a8.272 8.272 0 01-2.428-1.5 9.124 9.124 0 01-1.68-2.091c-.176-.304-.019-.468.133-.619.136-.135.303-.353.454-.53.151-.176.202-.303.303-.505.101-.202.05-.378-.025-.53-.076-.153-.681-1.641-.933-2.247-.245-.589-.494-.509-.68-.519l-.58-.01c-.201 0-.529.076-.806.378-.277.303-1.059 1.036-1.059 2.527 0 1.49 1.085 2.93 1.236 3.131.151.202 2.136 3.262 5.176 4.568.723.311 1.288.497 1.727.637.726.231 1.387.198 1.91.12.583-.087 1.797-.735 2.049-1.443.252-.708.252-1.314.176-1.442-.075-.128-.277-.203-.58-.356z" />
                    </svg>
                  )}
                  {isCheckingOut ? 'Ordering...' : 'Order via WhatsApp'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
