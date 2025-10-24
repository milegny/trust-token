import React, { useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletContextProvider } from './components/WalletProvider';
import { TrustTokenDisplay } from './components/TrustTokenDisplay';
import { MintButton } from './components/MintButton';
import './App.css';

function AppContent() {
  const { publicKey } = useWallet();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleMintSuccess = () => {
    // Refresh the TrustToken display
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="logo-section">
            <h1 className="app-title">🎫 TrustToken</h1>
            <p className="app-subtitle">Verified Identity for The Bit Central</p>
          </div>
          <WalletMultiButton />
        </div>
      </header>

      <main className="App-main">
        <div className="hero-section">
          <h2 className="hero-title">Get Verified to Sell</h2>
          <p className="hero-description">
            TrustToken is your verified identity NFT on The Bit Central marketplace.
            Only verified sellers can list items for sale.
          </p>
        </div>

        <div className="content-section" key={refreshKey}>
          <TrustTokenDisplay />
          
          {publicKey && (
            <MintButton onMintSuccess={handleMintSuccess} />
          )}
        </div>

        <div className="features-section">
          <h3>Why TrustToken?</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h4>Secure</h4>
              <p>Blockchain-verified identity stored on Solana</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h4>Instant</h4>
              <p>Get verified and start selling immediately</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h4>NFT-Based</h4>
              <p>Your verification is a unique NFT you own</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="App-footer">
        <p>Built on Solana • Powered by Anchor</p>
        <p className="network-badge">🌐 Devnet</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <WalletContextProvider>
      <AppContent />
    </WalletContextProvider>
  );
}

export default App;
