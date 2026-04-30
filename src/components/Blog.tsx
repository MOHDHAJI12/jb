import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BlogItem } from '../types';
import { motion } from 'motion/react';
import { Calendar, ArrowRight } from 'lucide-react';

export default function Blog() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);

  useEffect(() => {
    api.getBlogs().then(setBlogs);
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-green-600 font-serif italic text-xl mb-2 block">Read Article Tips</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Latest News & Blog</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {blogs.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[16/10] mb-6 overflow-hidden rounded-[32px]">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-700">
                    {post.date}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-gray-500 mb-6 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors uppercase tracking-widest">
                  Read More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
