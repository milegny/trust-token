import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [category, search, page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts({
        category: category || undefined,
        search: search || undefined,
        page,
        limit: 12,
      });
      setProducts(data.products);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSearchParams({ category: cat, page: '1' });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get('search') as string;
    setSearchParams({ search: searchTerm, page: '1' });
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>The Bit Central Marketplace</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          name="search"
          placeholder="Search products..."
          defaultValue={search}
          style={{
            padding: '10px',
            width: '300px',
            marginRight: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#9945FF',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </form>

      {/* Categories */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => handleCategoryChange('')}
          style={{
            padding: '8px 16px',
            margin: '5px',
            backgroundColor: !category ? '#9945FF' : '#f0f0f0',
            color: !category ? 'white' : 'black',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => handleCategoryChange(cat.name)}
            style={{
              padding: '8px 16px',
              margin: '5px',
              backgroundColor: category === cat.name ? '#9945FF' : '#f0f0f0',
              color: category === cat.name ? 'white' : 'black',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
            }}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'white',
              }}
            >
              <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <img
                  src={product.images[0] || 'https://via.placeholder.com/280x200'}
                  alt={product.name}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
                <div style={{ padding: '15px' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{product.name}</h3>
                  <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                    {product.description.substring(0, 80)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#9945FF' }}>
                      {product.price} {product.currency}
                    </span>
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      Stock: {product.stock}
                    </span>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    Seller: {product.seller.username || product.seller.walletAddress.substring(0, 8)}
                    {product.seller.isVerified && (
                      <span style={{ color: '#14F195', marginLeft: '5px' }}>✓ Verified</span>
                    )}
                  </div>
                </div>
              </Link>
              <div style={{ padding: '0 15px 15px' }}>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: product.stock > 0 ? '#9945FF' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
