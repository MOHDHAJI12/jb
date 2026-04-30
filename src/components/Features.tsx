import { Leaf, Truck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const FEATURES = [
  {
    icon: Leaf,
    title: '100% NATURAL',
    desc: 'Pure organic products'
  },
  {
    icon: Truck,
    title: 'FAST SHIPPING',
    desc: 'Worldwide delivery'
  },
  {
    icon: Zap,
    title: 'RAPIDO SERVICE',
    desc: 'Quick local delivery'
  }
];

export default function Features() {
  return (
    <section className="py-20 border-y border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                <feature.icon className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
