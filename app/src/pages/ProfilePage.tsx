import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import SoulboundTokenDisplay from '../components/SoulboundTokenDisplay';
import ReputationCards from '../components/ReputationCards';
import RequestRecommendation from '../components/RequestRecommendation';
import MintButton from '../components/MintButton';

const ProfilePage: React.FC = () => {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'overview' | 'cards' | 'issue'>('overview');

  if (!publicKey) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}>
          <h1 style={{ marginBottom: '20px' }}>Your Profile</h1>
          <p style={{ marginBottom: '30px', color: '#666' }}>
            Connect your wallet to view your profile, TrustToken, and reputation cards
          </p>
          <WalletMultiButton style={{ margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          padding: '30px',
          backgroundColor: 'white',
          borderRadius: '16px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: '0 0 10px 0' }}>Your Profile</h1>
              <p style={{ margin: 0, color: '#666', fontSize: '14px', fontFamily: 'monospace' }}>
                {publicKey.toString()}
              </p>
            </div>
            <WalletMultiButton />
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '2px solid #ddd',
        }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '15px 30px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '3px solid #9945FF' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'overview' ? 'bold' : 'normal',
              color: activeTab === 'overview' ? '#9945FF' : '#666',
              fontSize: '16px',
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            style={{
              padding: '15px 30px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'cards' ? '3px solid #9945FF' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'cards' ? 'bold' : 'normal',
              color: activeTab === 'cards' ? '#9945FF' : '#666',
              fontSize: '16px',
            }}
          >
            Reputation Cards
          </button>
          <button
            onClick={() => setActiveTab('issue')}
            style={{
              padding: '15px 30px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'issue' ? '3px solid #9945FF' : 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'issue' ? 'bold' : 'normal',
              color: activeTab === 'issue' ? '#9945FF' : '#666',
              fontSize: '16px',
            }}
          >
            Issue Card
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <SoulboundTokenDisplay />
                
                <div style={{
                  padding: '20px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid #ddd',
                }}>
                  <h3 style={{ margin: '0 0 15px 0' }}>Get Verified</h3>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                    Mint a TrustToken to become a verified seller on The Bit Central marketplace.
                    Your token is soulbound and cannot be transferred.
                  </p>
                  <MintButton />
                </div>
              </div>

              {/* Right Column */}
              <div>
                <ReputationCards />
              </div>
            </div>
          )}

          {activeTab === 'cards' && (
            <div style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #ddd',
            }}>
              <ReputationCards />
            </div>
          )}

          {activeTab === 'issue' && (
            <div style={{ maxWidth: '600px' }}>
              <RequestRecommendation />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #ddd',
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>About Your Profile</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>🎫 TrustToken</h4>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                Your TrustToken is a soulbound NFT that proves your verified identity.
                It cannot be transferred or sold, ensuring it always represents you.
              </p>
            </div>
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>⭐ Reputation Cards</h4>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                Reputation cards are issued by other users based on their experience with you.
                They help build trust and credibility in the marketplace.
              </p>
            </div>
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>🔒 Soulbound</h4>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                Soulbound tokens are permanently linked to your wallet. They cannot be
                transferred, ensuring authentic identity verification.
              </p>
            </div>
            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>💬 Issue Cards</h4>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                After completing transactions, you can issue reputation cards to other users.
                Choose from 8 different types and add a personal message.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
