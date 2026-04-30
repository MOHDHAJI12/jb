/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Showcase from './components/Showcase';
import Categories from './components/Categories';
import Products from './components/Products';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import Blog from './components/Blog';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { CartProvider } from './context/CartContext';
import Admin from './pages/Admin';
import ProductsPage from './pages/ProductsPage';
import FloatingWhatsApp from './components/FloatingWhatsApp';

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <div className="h-12 bg-white" />
        <Showcase />
        <Categories />
        <Products />
        <Features />
        <Testimonials />
        <Blog />
      </main>
      <Footer />
      <CartDrawer />
      <FloatingWhatsApp />
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen font-sans selection:bg-green-100 selection:text-green-900">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

