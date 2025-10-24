import { PublicKey } from '@solana/web3.js';

/**
 * Solana Program IDs for deployed smart contracts
 */

// TrustToken Program - Soulbound NFT for user verification
export const TRUST_TOKEN_PROGRAM_ID = new PublicKey(
  '3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju'
);

// ReputationCard Program - Reputation card system
export const REPUTATION_CARD_PROGRAM_ID = new PublicKey(
  'FmZBiFUHHtGQioU11V9asYiJGP5wDdrLqoikzAyEyRtc'
);

/**
 * Solana Network Configuration
 */
export const SOLANA_NETWORK = process.env.REACT_APP_SOLANA_NETWORK || 'devnet';
export const SOLANA_RPC_URL = 
  process.env.REACT_APP_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

/**
 * API Configuration
 */
export const API_BASE_URL = 
  process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * Program ID strings for environment variables or display
 */
export const PROGRAM_IDS = {
  TRUST_TOKEN: TRUST_TOKEN_PROGRAM_ID.toString(),
  REPUTATION_CARD: REPUTATION_CARD_PROGRAM_ID.toString(),
} as const;

/**
 * Card Types for ReputationCard program
 */
export enum CardType {
  Trustworthy = 'trustworthy',
  QualityProducts = 'qualityProducts',
  FastShipping = 'fastShipping',
  GoodCommunication = 'goodCommunication',
  FairPricing = 'fairPricing',
  Reliable = 'reliable',
  Professional = 'professional',
  Responsive = 'responsive',
}

/**
 * Card Status for ReputationCard program
 */
export enum CardStatus {
  Active = 'active',
  Revoked = 'revoked',
  Disputed = 'disputed',
  Suspended = 'suspended',
}

/**
 * Card Type Display Names
 */
export const CARD_TYPE_LABELS: Record<CardType, string> = {
  [CardType.Trustworthy]: 'Trustworthy',
  [CardType.QualityProducts]: 'Quality Products',
  [CardType.FastShipping]: 'Fast Shipping',
  [CardType.GoodCommunication]: 'Good Communication',
  [CardType.FairPricing]: 'Fair Pricing',
  [CardType.Reliable]: 'Reliable',
  [CardType.Professional]: 'Professional',
  [CardType.Responsive]: 'Responsive',
};

/**
 * Card Type Icons
 */
export const CARD_TYPE_ICONS: Record<CardType, string> = {
  [CardType.Trustworthy]: '🤝',
  [CardType.QualityProducts]: '⭐',
  [CardType.FastShipping]: '🚀',
  [CardType.GoodCommunication]: '💬',
  [CardType.FairPricing]: '💰',
  [CardType.Reliable]: '✅',
  [CardType.Professional]: '👔',
  [CardType.Responsive]: '⚡',
};

/**
 * Card Status Display Names
 */
export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  [CardStatus.Active]: 'Active',
  [CardStatus.Revoked]: 'Revoked',
  [CardStatus.Disputed]: 'Disputed',
  [CardStatus.Suspended]: 'Suspended',
};

/**
 * Card Status Colors (for UI)
 */
export const CARD_STATUS_COLORS: Record<CardStatus, string> = {
  [CardStatus.Active]: 'green',
  [CardStatus.Revoked]: 'gray',
  [CardStatus.Disputed]: 'orange',
  [CardStatus.Suspended]: 'red',
};
