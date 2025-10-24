import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './components/WalletProvider';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import UserProfile from './pages/UserProfile';
import './App.css';

function AppMarketplace() {
  return (
    <WalletProvider>
      <CartProvider>
        <Router>
          <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navbar />
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile/:id" element={<UserProfile />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </WalletProvider>
  );
}

export default AppMarketplace;
