import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="relative bg-[#FFDA44] overflow-hidden min-h-[500px] lg:min-h-[700px] flex items-center rounded-b-[40px] md:rounded-b-[80px]">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-yellow-400 opacity-20 skew-x-12 -z-0" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block text-xl md:text-2xl font-serif italic text-gray-800 mb-4">
              Organic Food
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-8">
              Fresh Fruits<br />
              <span className="text-white drop-shadow-sm">Summer Sale</span>
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-green-600 text-white px-10 py-5 rounded-full font-bold text-lg shadow-lg hover:bg-green-700 transition-all flex items-center gap-2 group"
              id="shop-now-hero"
            >
              Shop Now
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="group-hover:translate-x-1 transition-transform"
              >
                →
              </motion.span>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1543218191-03c4b721fac4?auto=format&fit=crop&q=80&w=800"
              alt="Organic Juice"
              className="w-full max-w-lg mx-auto drop-shadow-2xl h-auto"
              referrerPolicy="no-referrer"
            />
            
            {/* Floaties */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 hidden lg:block"
            >
              <img src="https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=150&q=80" className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover" referrerPolicy="no-referrer" />
            </motion.div>
            
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 hidden lg:block"
            >
               <div className="bg-white p-6 rounded-3xl shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-gray-800">100% Organic</span>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
