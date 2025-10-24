import React from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { publicKey } = useWallet();
  const { getTotalItems } = useCart();

  return (
    <nav
      style={{
        padding: '15px 30px',
        backgroundColor: '#1a1a1a',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <Link
          to="/"
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#9945FF',
            textDecoration: 'none',
          }}
        >
          🎫 The Bit Central
        </Link>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link
            to="/"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Products
          </Link>
          
          {publicKey && (
            <>
              <Link
                to="/orders"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                My Orders
              </Link>
              
              <Link
                to="/sell"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Sell
              </Link>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link
          to="/cart"
          style={{
            color: 'white',
            textDecoration: 'none',
            position: 'relative',
            fontSize: '24px',
          }}
        >
          🛒
          {getTotalItems() > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#9945FF',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              {getTotalItems()}
            </span>
          )}
        </Link>

        <WalletMultiButton style={{ backgroundColor: '#9945FF' }} />
      </div>
    </nav>
  );
};

export default Navbar;
