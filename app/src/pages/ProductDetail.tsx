import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, getUserReviews } from '../services/api';
import { Product, Review } from '../types';
import { useCart } from '../context/CartContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProduct(id!);
      setProduct(data);
      
      // Load seller reviews
      const reviewsData = await getUserReviews(data.sellerId);
      setReviews(reviewsData);
      
      setError(null);
    } catch (err) {
      setError('Failed to load product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert('Added to cart!');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <p>{error || 'Product not found'}</p>
        <Link to="/" style={{ color: '#9945FF' }}>Back to Products</Link>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Link to="/" style={{ color: '#9945FF', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Products
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
        {/* Images */}
        <div>
          <img
            src={product.images[selectedImage] || 'https://via.placeholder.com/600x400'}
            alt={product.name}
            style={{ width: '100%', borderRadius: '8px', marginBottom: '10px' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product.name} ${idx + 1}`}
                onClick={() => setSelectedImage(idx)}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: selectedImage === idx ? '2px solid #9945FF' : '1px solid #ddd',
                }}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 style={{ margin: '0 0 10px 0' }}>{product.name}</h1>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9945FF', margin: '10px 0' }}>
            {product.price} {product.currency}
          </div>
          
          <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Seller Information</h3>
            <Link to={`/profile/${product.seller.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <p style={{ margin: '5px 0' }}>
                <strong>{product.seller.username || product.seller.walletAddress.substring(0, 16)}</strong>
                {product.seller.isVerified && (
                  <span style={{ color: '#14F195', marginLeft: '10px' }}>✓ Verified</span>
                )}
              </p>
              <p style={{ margin: '5px 0' }}>
                Reputation: {product.seller.reputationScore.toFixed(1)} ⭐
              </p>
              <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                {reviews.length} reviews
              </p>
            </Link>
          </div>

          <div style={{ margin: '20px 0' }}>
            <h3>Description</h3>
            <p style={{ lineHeight: '1.6', color: '#333' }}>{product.description}</p>
          </div>

          <div style={{ margin: '20px 0' }}>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Stock Available:</strong> {product.stock}</p>
          </div>

          {/* Add to Cart */}
          <div style={{ margin: '30px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
              <label>Quantity:</label>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                style={{
                  padding: '8px',
                  width: '80px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: product.stock > 0 ? '#9945FF' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: '60px' }}>
        <h2>Seller Reviews ({reviews.length})</h2>
        {averageRating > 0 && (
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>
            Average Rating: {averageRating.toFixed(1)} ⭐
          </p>
        )}
        
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {reviews.slice(0, 5).map((review) => (
              <div
                key={review.id}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong>{review.reviewer.username || review.reviewer.walletAddress.substring(0, 16)}</strong>
                  <span>{'⭐'.repeat(review.rating)}</span>
                </div>
                {review.comment && <p style={{ margin: 0, color: '#666' }}>{review.comment}</p>}
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
