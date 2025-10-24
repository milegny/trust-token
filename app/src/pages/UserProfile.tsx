import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  getUser,
  getUserReputation,
  getUserReviews,
  getUserRecommendations,
  getProducts,
} from '../services/api';
import { User, Review, Recommendation, Product } from '../types';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { publicKey } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [reputation, setReputation] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'recommendations'>('products');

  useEffect(() => {
    if (id) {
      loadUserData();
    }
  }, [id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userData, reputationData, reviewsData, recommendationsData, productsData] = await Promise.all([
        getUser(id!),
        getUserReputation(id!),
        getUserReviews(id!),
        getUserRecommendations(id!, true),
        getProducts({ sellerId: id }),
      ]);

      setUser(userData);
      setReputation(reputationData);
      setReviews(reviewsData);
      setRecommendations(recommendationsData);
      setProducts(productsData.products);
      setError(null);
    } catch (err) {
      setError('Failed to load user profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <p>{error || 'User not found'}</p>
        <Link to="/" style={{ color: '#9945FF' }}>Back to Home</Link>
      </div>
    );
  }

  const isOwnProfile = publicKey && user.walletAddress === publicKey.toString();

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Profile Header */}
      <div
        style={{
          padding: '30px',
          backgroundColor: 'white',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '1px solid #ddd',
        }}
      >
        <div style={{ display: 'flex', gap: '30px', alignItems: 'start' }}>
          <img
            src={user.avatarUrl || 'https://via.placeholder.com/120'}
            alt={user.username || 'User'}
            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
          />
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
              <h1 style={{ margin: 0 }}>{user.username || 'Anonymous User'}</h1>
              {user.isVerified && (
                <span
                  style={{
                    padding: '5px 15px',
                    backgroundColor: '#14F195',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  ✓ Verified
                </span>
              )}
            </div>
            
            <p style={{ color: '#666', margin: '10px 0' }}>
              {user.walletAddress.substring(0, 8)}...{user.walletAddress.substring(user.walletAddress.length - 8)}
            </p>
            
            {user.bio && <p style={{ margin: '15px 0', lineHeight: '1.6' }}>{user.bio}</p>}
            
            {/* Reputation Stats */}
            <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9945FF' }}>
                  {reputation?.reputationScore?.toFixed(1) || '0.0'}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Reputation Score</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9945FF' }}>
                  {reputation?.totalReviews || 0}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Reviews</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9945FF' }}>
                  {recommendations.length}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Recommendations</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9945FF' }}>
                  {products.length}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Products</div>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <Link
              to="/profile/edit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#9945FF',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
              }}
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '15px 30px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'products' ? '3px solid #9945FF' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'products' ? 'bold' : 'normal',
            color: activeTab === 'products' ? '#9945FF' : '#666',
          }}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '15px 30px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'reviews' ? '3px solid #9945FF' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'reviews' ? 'bold' : 'normal',
            color: activeTab === 'reviews' ? '#9945FF' : '#666',
          }}
        >
          Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          style={{
            padding: '15px 30px',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'recommendations' ? '3px solid #9945FF' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'recommendations' ? 'bold' : 'normal',
            color: activeTab === 'recommendations' ? '#9945FF' : '#666',
          }}
        >
          Recommendations ({recommendations.length})
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'products' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '20px',
            }}
          >
            {products.length === 0 ? (
              <p>No products listed yet.</p>
            ) : (
              products.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: 'white',
                    }}
                  >
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/250x180'}
                      alt={product.name}
                      style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '15px' }}>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{product.name}</h3>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#9945FF' }}>
                        {product.price} {product.currency}
                      </div>
                      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                        Stock: {product.stock}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    padding: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong>
                      {review.reviewer.username || review.reviewer.walletAddress.substring(0, 16)}
                    </strong>
                    <span style={{ fontSize: '18px' }}>{'⭐'.repeat(review.rating)}</span>
                  </div>
                  {review.comment && <p style={{ margin: '10px 0', color: '#333' }}>{review.comment}</p>}
                  <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {recommendations.length === 0 ? (
              <p>No recommendations yet.</p>
            ) : (
              recommendations.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    padding: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                      <strong>{rec.issuer.username || rec.issuer.walletAddress.substring(0, 16)}</strong>
                      {rec.issuer.isVerified && (
                        <span style={{ color: '#14F195', marginLeft: '10px' }}>✓ Verified</span>
                      )}
                    </div>
                    <span
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      {rec.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {rec.message && <p style={{ margin: '10px 0', color: '#333' }}>{rec.message}</p>}
                  <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
                    {new Date(rec.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
