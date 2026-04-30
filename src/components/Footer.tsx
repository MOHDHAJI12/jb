import { Facebook, Twitter, Instagram, Youtube, Send, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Logo & About */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">JB</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-bold tracking-tight text-white uppercase">JB</span>
                <span className="text-xs font-medium tracking-widest text-green-500 uppercase">FRUITS</span>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              We provide the best quality organic food products for your healthy life. Our products are 100% natural and source-local.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-gray-400 hover:text-green-500 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <a href="https://wa.me/919885170407" target="_blank" rel="noopener noreferrer" className="text-sm font-medium">
                    WhatsApp: +91 9885170407
                  </a>
                </div>
                <div className="flex items-center gap-3 text-gray-400 hover:text-green-500 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <a href="https://maps.app.goo.gl/SXnjmZDCvMYadLAr8" target="_blank" rel="noopener noreferrer" className="text-sm font-medium">
                    Our Location: Click to View map
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-8">Quick Links</h4>
            <ul className="flex flex-col gap-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-green-500 transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Shop</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Contact</a></li>
              <li><Link to="/admin" className="hover:text-green-500 transition-colors">Admin Dashboard</Link></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-lg font-bold mb-8">Information</h4>
            <ul className="flex flex-col gap-4 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-green-500 transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Gift Cards</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-green-500 transition-colors">Order Status</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-8">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-6">
              Subscribe to stay updated with new collections and offers.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-gray-800 border-transparent rounded-full py-4 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            © 2024 JB Fruits. All rights reserved.
          </p>
          <div className="flex gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 grayscale opacity-50 hover:opacity-100 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 grayscale opacity-50 hover:opacity-100 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 grayscale opacity-50 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </footer>
  );
}
