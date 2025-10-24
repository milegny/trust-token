import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/api';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    if (!shippingAddress.trim()) {
      alert('Please enter a shipping address');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Group items by seller
    const itemsBySeller = cart.reduce((acc, item) => {
      const sellerId = item.product.sellerId;
      if (!acc[sellerId]) {
        acc[sellerId] = [];
      }
      acc[sellerId].push(item);
      return acc;
    }, {} as Record<string, typeof cart>);

    try {
      setLoading(true);
      setError(null);

      // Create separate orders for each seller
      const orders = await Promise.all(
        Object.entries(itemsBySeller).map(([sellerId, items]) =>
          createOrder({
            buyerId: publicKey.toString(), // This should be the user's DB ID, not wallet address
            sellerId,
            items: items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
            })),
            shippingAddress,
          })
        )
      );

      clearCart();
      alert(`Successfully created ${orders.length} order(s)!`);
      navigate('/orders');
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.error || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <p>Add some products to get started!</p>
        <Link to="/" style={{ color: '#9945FF', textDecoration: 'none', fontSize: '18px' }}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Shopping Cart</h1>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#fee', color: 'red', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Cart Items */}
        <div>
          {cart.map((item) => (
            <div
              key={item.product.id}
              style={{
                display: 'flex',
                gap: '20px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '15px',
                backgroundColor: 'white',
              }}
            >
              <img
                src={item.product.images[0] || 'https://via.placeholder.com/120'}
                alt={item.product.name}
                style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
              />
              
              <div style={{ flex: 1 }}>
                <Link
                  to={`/products/${item.product.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <h3 style={{ margin: '0 0 10px 0' }}>{item.product.name}</h3>
                </Link>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  Seller: {item.product.seller.username || item.product.seller.walletAddress.substring(0, 16)}
                </p>
                <p style={{ margin: '5px 0', fontSize: '18px', fontWeight: 'bold', color: '#9945FF' }}>
                  {item.product.price} {item.product.currency}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
                  <label>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={item.product.stock}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                    style={{
                      padding: '5px',
                      width: '60px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  />
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    style={{
                      padding: '5px 15px',
                      backgroundColor: '#ff4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {(item.product.price * item.quantity).toFixed(2)} {item.product.currency}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div
            style={{
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: 'white',
              position: 'sticky',
              top: '20px',
            }}
          >
            <h2 style={{ margin: '0 0 20px 0' }}>Order Summary</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Items:</span>
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Subtotal:</span>
                <span>{getTotalPrice().toFixed(2)} SOL</span>
              </div>
              <hr style={{ margin: '15px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span style={{ color: '#9945FF' }}>{getTotalPrice().toFixed(2)} SOL</span>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Shipping Address:
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your shipping address..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || !publicKey}
              style={{
                width: '100%',
                padding: '15px',
                marginTop: '20px',
                backgroundColor: loading || !publicKey ? '#ccc' : '#9945FF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading || !publicKey ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {loading ? 'Processing...' : !publicKey ? 'Connect Wallet' : 'Proceed to Checkout'}
            </button>

            {!publicKey && (
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', textAlign: 'center' }}>
                Please connect your wallet to checkout
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
