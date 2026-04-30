import { motion } from 'motion/react';

const CATEGORIES = [
  {
    title: 'Fresh Juice',
    subtitle: 'Healthy Life',
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=400',
    color: 'bg-[#B4E4D7]'
  },
  {
    title: 'Fresh Healthy Food',
    subtitle: 'Best Quality',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
    color: 'bg-[#FFDEB4]'
  },
  {
    title: 'Summer Food',
    subtitle: 'Refreshing',
    image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80&w=400',
    color: 'bg-[#FFCACC]'
  }
];

export default function Categories() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {CATEGORIES.map((cat, index) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={`${cat.color} rounded-[40px] p-8 relative overflow-hidden group cursor-pointer h-64 flex flex-col justify-center`}
            >
              <div className="relative z-10">
                <span className="text-sm font-semibold uppercase tracking-wider text-gray-800 mb-2 block">
                  {cat.subtitle}
                </span>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">{cat.title}</h3>
                <button className="text-sm font-bold text-gray-900 underline underline-offset-4 decoration-2 hover:text-green-700 transition-colors">
                  SHOP NOW
                </button>
              </div>
              
              <motion.img
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.5 }}
                src={cat.image}
                alt={cat.title}
                className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
