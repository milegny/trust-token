import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  PremiumFeature,
  PREMIUM_FEATURE_PRICES,
  PremiumFeaturePurchase,
} from '../types/treasury';

export const PremiumFeatures: React.FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [activePurchases, setActivePurchases] = useState<PremiumFeaturePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<PremiumFeature | null>(null);

  useEffect(() => {
    if (publicKey) {
      fetchActivePurchases();
    }
  }, [publicKey]);

  const fetchActivePurchases = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/premium/active/${publicKey.toBase58()}`);
      const data = await response.json();
      setActivePurchases(data);
    } catch (error) {
      console.error('Error fetching active purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (feature: PremiumFeature) => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setPurchasing(feature);
      const price = PREMIUM_FEATURE_PRICES[feature];
      const lamports = price * LAMPORTS_PER_SOL;

      // Get treasury wallet from backend
      const configResponse = await fetch('/api/config/treasury-wallet');
      const { treasuryWallet } = await configResponse.json();

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryWallet,
          lamports,
        })
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      // Record purchase in backend
      const response = await fetch('/api/premium/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          feature,
          price,
          txSignature: signature,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record purchase');
      }

      alert(`Successfully purchased ${getFeatureName(feature)}!`);
      fetchActivePurchases();
    } catch (error: any) {
      console.error('Error purchasing feature:', error);
      alert(`Failed to purchase: ${error.message}`);
    } finally {
      setPurchasing(null);
    }
  };

  const getFeatureName = (feature: PremiumFeature): string => {
    const names = {
      [PremiumFeature.VERIFICATION_PLUS]: 'Verification Plus',
      [PremiumFeature.ANALYTICS_PRO]: 'Analytics Pro',
      [PremiumFeature.REPUTATION_BOOST]: 'Reputation Boost',
    };
    return names[feature];
  };

  const getFeatureDescription = (feature: PremiumFeature): string => {
    const descriptions = {
      [PremiumFeature.VERIFICATION_PLUS]: 'Enhanced verification badge with priority support and exclusive features',
      [PremiumFeature.ANALYTICS_PRO]: 'Advanced analytics dashboard with detailed insights and export capabilities',
      [PremiumFeature.REPUTATION_BOOST]: 'Boost your reputation visibility for 30 days with featured placement',
    };
    return descriptions[feature];
  };

  const getFeatureBenefits = (feature: PremiumFeature): string[] => {
    const benefits = {
      [PremiumFeature.VERIFICATION_PLUS]: [
        'Enhanced verification badge',
        'Priority customer support',
        'Exclusive marketplace features',
        'Lower commission rates (4% → 3%)',
        'One-time payment, lifetime access',
      ],
      [PremiumFeature.ANALYTICS_PRO]: [
        'Advanced analytics dashboard',
        'Detailed transaction insights',
        'Export data to CSV/PDF',
        'Custom reports',
        'Real-time notifications',
        'Monthly subscription',
      ],
      [PremiumFeature.REPUTATION_BOOST]: [
        'Featured placement in search',
        'Highlighted reputation badge',
        'Increased visibility',
        'Priority in recommendations',
        'Active for 30 days',
      ],
    };
    return benefits[feature];
  };

  const getFeatureIcon = (feature: PremiumFeature): string => {
    const icons = {
      [PremiumFeature.VERIFICATION_PLUS]: '✨',
      [PremiumFeature.ANALYTICS_PRO]: '📊',
      [PremiumFeature.REPUTATION_BOOST]: '🚀',
    };
    return icons[feature];
  };

  const isFeatureActive = (feature: PremiumFeature): boolean => {
    return activePurchases.some((p) => p.feature === feature && p.active);
  };

  const getFeatureExpiry = (feature: PremiumFeature): Date | null => {
    const purchase = activePurchases.find((p) => p.feature === feature && p.active);
    return purchase?.expiresAt ? new Date(purchase.expiresAt) : null;
  };

  const formatSOL = (amount: number) => `${amount} SOL`;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!publicKey) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-600">Please connect your wallet to view premium features</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Premium Features</h1>
        <p className="text-gray-600 mt-1">Unlock powerful features with one-time or monthly payments</p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(PremiumFeature).map((feature) => {
          const isActive = isFeatureActive(feature);
          const expiry = getFeatureExpiry(feature);
          const price = PREMIUM_FEATURE_PRICES[feature];

          return (
            <div
              key={feature}
              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                isActive ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <div className="text-5xl mb-3">{getFeatureIcon(feature)}</div>
                <h3 className="text-xl font-bold">{getFeatureName(feature)}</h3>
                <p className="text-purple-100 text-sm mt-2">{getFeatureDescription(feature)}</p>
              </div>

              {/* Body */}
              <div className="p-6">
                {/* Price */}
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{formatSOL(price)}</span>
                  {feature === PremiumFeature.ANALYTICS_PRO && (
                    <span className="text-gray-600 text-sm ml-2">/month</span>
                  )}
                  {feature === PremiumFeature.REPUTATION_BOOST && (
                    <span className="text-gray-600 text-sm ml-2">/30 days</span>
                  )}
                </div>

                {/* Benefits */}
                <ul className="space-y-2 mb-6">
                  {getFeatureBenefits(feature).map((benefit, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Status & Action */}
                {isActive ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-sm font-medium">✓ Active</p>
                      {expiry && (
                        <p className="text-green-600 text-xs mt-1">
                          Expires: {formatDate(expiry)}
                        </p>
                      )}
                    </div>
                    {expiry && (
                      <button
                        onClick={() => handlePurchase(feature)}
                        disabled={purchasing !== null}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        Renew Now
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handlePurchase(feature)}
                    disabled={purchasing !== null}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50"
                  >
                    {purchasing === feature ? 'Processing...' : 'Purchase Now'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Features Summary */}
      {activePurchases.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Active Features</h2>
          <div className="space-y-3">
            {activePurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFeatureIcon(purchase.feature)}</span>
                  <div>
                    <p className="font-medium text-gray-900">{getFeatureName(purchase.feature)}</p>
                    <p className="text-sm text-gray-600">
                      Purchased: {formatDate(new Date(purchase.purchasedAt))}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      purchase.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {purchase.active ? 'Active' : 'Expired'}
                  </span>
                  {purchase.expiresAt && purchase.active && (
                    <p className="text-xs text-gray-500 mt-1">
                      Until {formatDate(new Date(purchase.expiresAt))}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">How do premium features work?</h3>
            <p className="text-sm text-gray-600">
              Premium features are purchased with SOL. Some are one-time payments (Verification Plus),
              while others are recurring (Analytics Pro) or time-limited (Reputation Boost).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Can I cancel anytime?</h3>
            <p className="text-sm text-gray-600">
              Yes! For recurring features, simply don't renew when they expire. One-time features
              are yours forever.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Are payments refundable?</h3>
            <p className="text-sm text-gray-600">
              Due to the nature of blockchain transactions, payments are non-refundable. However,
              you'll receive full access for the purchased period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatures;
