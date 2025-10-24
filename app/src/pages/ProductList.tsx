import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import SellerReputationBadge from '../components/SellerReputationBadge';
import { sortByReputation, filterByMinReputation, getReputationIcon } from '../utils/reputationCalculator';

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
  const sortBy = searchParams.get('sortBy') || '';
  const minReputation = parseFloat(searchParams.get('minReputation') || '0');

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
      
      let filteredProducts = data.products;
      
      // Apply reputation filter
      if (minReputation > 0) {
        filteredProducts = filterByMinReputation(filteredProducts, minReputation);
      }
      
      // Apply sorting
      if (sortBy === 'reputation-high') {
        filteredProducts = sortByReputation(filteredProducts, 'desc');
      } else if (sortBy === 'reputation-low') {
        filteredProducts = sortByReputation(filteredProducts, 'asc');
      }
      
      setProducts(filteredProducts);
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

  const handleSortChange = (sort: string) => {
    const params: any = { page: '1' };
    if (category) params.category = category;
    if (search) params.search = search;
    if (minReputation > 0) params.minReputation = minReputation.toString();
    if (sort) params.sortBy = sort;
    setSearchParams(params);
  };

  const handleReputationFilter = (minRep: number) => {
    const params: any = { page: '1' };
    if (category) params.category = category;
    if (search) params.search = search;
    if (sortBy) params.sortBy = sortBy;
    if (minRep > 0) params.minReputation = minRep.toString();
    setSearchParams(params);
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

      {/* Filters and Sorting */}
      <div style={{ marginBottom: '30px' }}>
        {/* Categories */}
        <div style={{ marginBottom: '15px' }}>
          <strong style={{ marginRight: '10px' }}>Category:</strong>
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

        {/* Reputation Filter */}
        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <strong>Min Reputation:</strong>
          <button
            onClick={() => handleReputationFilter(0)}
            style={{
              padding: '6px 12px',
              backgroundColor: minReputation === 0 ? '#9945FF' : '#f0f0f0',
              color: minReputation === 0 ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            All
          </button>
          <button
            onClick={() => handleReputationFilter(3.0)}
            style={{
              padding: '6px 12px',
              backgroundColor: minReputation === 3.0 ? '#9945FF' : '#f0f0f0',
              color: minReputation === 3.0 ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            👌 3.0+
          </button>
          <button
            onClick={() => handleReputationFilter(4.0)}
            style={{
              padding: '6px 12px',
              backgroundColor: minReputation === 4.0 ? '#9945FF' : '#f0f0f0',
              color: minReputation === 4.0 ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ⭐ 4.0+
          </button>
          <button
            onClick={() => handleReputationFilter(4.5)}
            style={{
              padding: '6px 12px',
              backgroundColor: minReputation === 4.5 ? '#9945FF' : '#f0f0f0',
              color: minReputation === 4.5 ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            🌟 4.5+
          </button>
        </div>

        {/* Sort Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <strong>Sort by:</strong>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <option value="">Default</option>
            <option value="reputation-high">Reputation: High to Low</option>
            <option value="reputation-low">Reputation: Low to High</option>
          </select>
        </div>
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
                  <div style={{ marginTop: '10px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <span style={{ color: '#666' }}>
                        Seller: {product.seller.username || product.seller.walletAddress.substring(0, 8)}
                      </span>
                      {product.seller.isVerified && (
                        <span style={{ color: '#14F195' }}>✓</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{getReputationIcon(product.seller.reputationScore)}</span>
                      <span style={{ fontWeight: '600', color: '#9945FF' }}>
                        {product.seller.reputationScore.toFixed(1)}
                      </span>
                      <span style={{ color: '#999', fontSize: '11px' }}>
                        reputation
                      </span>
                    </div>
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
