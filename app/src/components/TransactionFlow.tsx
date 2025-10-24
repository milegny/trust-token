import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Product } from '../types';
import LeaveReputation from './LeaveReputation';

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING_PAYMENT = 'PROCESSING_PAYMENT',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

interface TransactionFlowProps {
  orderId: string;
  product: Product;
  quantity: number;
  totalAmount: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

export const TransactionFlow: React.FC<TransactionFlowProps> = ({
  orderId,
  product,
  quantity,
  totalAmount,
  onComplete,
  onCancel,
}) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.PENDING);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReputationForm, setShowReputationForm] = useState(false);
  const [reputationSubmitted, setReputationSubmitted] = useState(false);

  const handlePayment = async () => {
    if (!publicKey) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setStatus(TransactionStatus.PROCESSING_PAYMENT);
      setError(null);

      // Create payment transaction
      const sellerPubkey = new PublicKey(product.seller.walletAddress);
      const amountLamports = totalAmount * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: sellerPubkey,
          lamports: amountLamports,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      setTxSignature(signature);

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      // Update order status in backend
      await updateOrderStatus(orderId, 'PAID', signature);

      setStatus(TransactionStatus.PAYMENT_CONFIRMED);
      
      // Simulate shipping notification (in real app, seller would update this)
      setTimeout(() => {
        setStatus(TransactionStatus.SHIPPED);
      }, 2000);

    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setStatus(TransactionStatus.FAILED);
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      await updateOrderStatus(orderId, 'DELIVERED');
      setStatus(TransactionStatus.DELIVERED);
      setShowReputationForm(true);
    } catch (err: any) {
      console.error('Delivery confirmation error:', err);
      setError('Failed to confirm delivery');
    }
  };

  const handleReputationSubmitted = () => {
    setReputationSubmitted(true);
    setStatus(TransactionStatus.COMPLETED);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkipReputation = async () => {
    try {
      await updateOrderStatus(orderId, 'COMPLETED');
      setStatus(TransactionStatus.COMPLETED);
      if (onComplete) {
        onComplete();
      }
    } catch (err: any) {
      console.error('Complete order error:', err);
      setError('Failed to complete order');
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: string,
    txSignature?: string
  ) => {
    // TODO: Implement actual API call
    console.log('Updating order status:', { orderId, status, txSignature });
    // await api.patch(`/orders/${orderId}`, { status, txSignature });
  };

  const getStatusIcon = () => {
    switch (status) {
      case TransactionStatus.PENDING:
        return '⏳';
      case TransactionStatus.PROCESSING_PAYMENT:
        return '💳';
      case TransactionStatus.PAYMENT_CONFIRMED:
        return '✅';
      case TransactionStatus.SHIPPED:
        return '📦';
      case TransactionStatus.DELIVERED:
        return '🎉';
      case TransactionStatus.COMPLETED:
        return '🌟';
      case TransactionStatus.FAILED:
        return '❌';
      case TransactionStatus.CANCELLED:
        return '🚫';
      default:
        return '⏳';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'Pending Payment';
      case TransactionStatus.PROCESSING_PAYMENT:
        return 'Processing Payment...';
      case TransactionStatus.PAYMENT_CONFIRMED:
        return 'Payment Confirmed';
      case TransactionStatus.SHIPPED:
        return 'Order Shipped';
      case TransactionStatus.DELIVERED:
        return 'Order Delivered';
      case TransactionStatus.COMPLETED:
        return 'Order Completed';
      case TransactionStatus.FAILED:
        return 'Transaction Failed';
      case TransactionStatus.CANCELLED:
        return 'Order Cancelled';
      default:
        return 'Unknown Status';
    }
  };

  if (showReputationForm && !reputationSubmitted) {
    return (
      <LeaveReputation
        recipientWallet={product.seller.walletAddress}
        recipientName={product.seller.username || 'Seller'}
        orderId={orderId}
        productName={product.name}
        onSubmit={handleReputationSubmitted}
        onSkip={handleSkipReputation}
      />
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Transaction Status</h2>
          <div style={styles.statusBadge}>
            <span style={styles.statusIcon}>{getStatusIcon()}</span>
            <span style={styles.statusLabel}>{getStatusLabel()}</span>
          </div>
        </div>

        {/* Product Info */}
        <div style={styles.productInfo}>
          <img
            src={product.images[0] || 'https://via.placeholder.com/80'}
            alt={product.name}
            style={styles.productImage}
          />
          <div style={styles.productDetails}>
            <h3 style={styles.productName}>{product.name}</h3>
            <p style={styles.productMeta}>
              Quantity: {quantity} × {product.price} {product.currency}
            </p>
            <p style={styles.productTotal}>
              Total: <strong>{totalAmount.toFixed(2)} {product.currency}</strong>
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div style={styles.progressContainer}>
          <div style={styles.progressSteps}>
            <div style={getStepStyle(TransactionStatus.PENDING)}>
              <div style={styles.stepIcon}>💳</div>
              <div style={styles.stepLabel}>Payment</div>
            </div>
            <div style={styles.progressLine} />
            <div style={getStepStyle(TransactionStatus.PAYMENT_CONFIRMED)}>
              <div style={styles.stepIcon}>✅</div>
              <div style={styles.stepLabel}>Confirmed</div>
            </div>
            <div style={styles.progressLine} />
            <div style={getStepStyle(TransactionStatus.SHIPPED)}>
              <div style={styles.stepIcon}>📦</div>
              <div style={styles.stepLabel}>Shipped</div>
            </div>
            <div style={styles.progressLine} />
            <div style={getStepStyle(TransactionStatus.DELIVERED)}>
              <div style={styles.stepIcon}>🎉</div>
              <div style={styles.stepLabel}>Delivered</div>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        {txSignature && (
          <div style={styles.txDetails}>
            <p style={styles.txLabel}>Transaction Signature:</p>
            <a
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.txLink}
            >
              {txSignature.substring(0, 20)}...{txSignature.substring(txSignature.length - 20)}
            </a>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={styles.error}>
            <span style={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.actions}>
          {status === TransactionStatus.PENDING && (
            <>
              <button onClick={handlePayment} style={styles.primaryButton}>
                Pay {totalAmount.toFixed(2)} {product.currency}
              </button>
              {onCancel && (
                <button onClick={onCancel} style={styles.secondaryButton}>
                  Cancel
                </button>
              )}
            </>
          )}

          {status === TransactionStatus.PROCESSING_PAYMENT && (
            <div style={styles.loading}>
              <div style={styles.spinner} />
              <p>Processing payment...</p>
            </div>
          )}

          {status === TransactionStatus.SHIPPED && (
            <button onClick={handleConfirmDelivery} style={styles.primaryButton}>
              Confirm Delivery
            </button>
          )}

          {status === TransactionStatus.COMPLETED && (
            <div style={styles.success}>
              <span style={styles.successIcon}>🎉</span>
              <p>Transaction completed successfully!</p>
              {reputationSubmitted && (
                <p style={styles.successSubtext}>
                  Thank you for leaving a reputation card!
                </p>
              )}
            </div>
          )}

          {status === TransactionStatus.FAILED && (
            <button onClick={handlePayment} style={styles.primaryButton}>
              Retry Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );

  function getStepStyle(stepStatus: TransactionStatus): React.CSSProperties {
    const isActive = 
      status === stepStatus ||
      (status === TransactionStatus.PROCESSING_PAYMENT && stepStatus === TransactionStatus.PENDING) ||
      (status === TransactionStatus.PAYMENT_CONFIRMED && stepStatus <= TransactionStatus.PAYMENT_CONFIRMED) ||
      (status === TransactionStatus.SHIPPED && stepStatus <= TransactionStatus.SHIPPED) ||
      (status === TransactionStatus.DELIVERED && stepStatus <= TransactionStatus.DELIVERED) ||
      (status === TransactionStatus.COMPLETED && stepStatus <= TransactionStatus.DELIVERED);

    return {
      ...styles.step,
      opacity: isActive ? 1 : 0.4,
    };
  }
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    margin: '0 0 15px 0',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f3f4f6',
    borderRadius: '20px',
  },
  statusIcon: {
    fontSize: '20px',
  },
  statusLabel: {
    fontSize: '14px',
    fontWeight: '600',
  },
  productInfo: {
    display: 'flex',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  productImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '600',
  },
  productMeta: {
    margin: '4px 0',
    fontSize: '14px',
    color: '#6b7280',
  },
  productTotal: {
    margin: '8px 0 0 0',
    fontSize: '16px',
    color: '#9945FF',
  },
  progressContainer: {
    marginBottom: '30px',
  },
  progressSteps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flex: '0 0 auto',
  },
  stepIcon: {
    fontSize: '32px',
  },
  stepLabel: {
    fontSize: '12px',
    fontWeight: '600',
    textAlign: 'center',
  },
  progressLine: {
    flex: 1,
    height: '2px',
    backgroundColor: '#e5e7eb',
    margin: '0 10px',
  },
  txDetails: {
    padding: '15px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  txLabel: {
    margin: '0 0 8px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
  },
  txLink: {
    color: '#9945FF',
    textDecoration: 'none',
    fontSize: '14px',
    wordBreak: 'break-all',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px',
    backgroundColor: '#fee',
    color: '#dc2626',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  errorIcon: {
    fontSize: '20px',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryButton: {
    padding: '15px',
    backgroundColor: '#9945FF',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    padding: '15px',
    backgroundColor: 'white',
    color: '#6b7280',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #9945FF',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  success: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '20px',
    backgroundColor: '#d1fae5',
    borderRadius: '8px',
  },
  successIcon: {
    fontSize: '48px',
  },
  successSubtext: {
    fontSize: '14px',
    color: '#065f46',
    margin: '5px 0 0 0',
  },
};

export default TransactionFlow;
