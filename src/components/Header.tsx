import { Search, ShoppingBag, User, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { itemCount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg md:text-xl">JB</span>
            </div>
            <div className="flex flex-col leading-none hidden xs:flex">
              <span className="text-lg md:text-xl font-bold tracking-tight text-gray-900">JB</span>
              <span className="text-[10px] md:text-xs font-medium tracking-widest text-green-600 uppercase">FRUITS</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {['Home', 'Pages', 'Portfolio', 'Blog', 'Shop', 'Contact'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
                id={`nav-${item.toLowerCase()}`}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Social & Tools */}
          <div className="flex items-center gap-2 md:gap-6">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all w-32 lg:w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-1 md:gap-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-gray-600 hover:text-green-600 relative group" 
                id="cart-btn"
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={itemCount}
                    className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 text-[10px] font-bold text-white rounded-full flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </button>
              <button className="p-2 text-gray-600 hover:text-green-600" id="user-btn">
                <User className="w-5 h-5" />
              </button>
              <button className="md:hidden p-2 text-gray-600" id="mobile-menu-btn">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
