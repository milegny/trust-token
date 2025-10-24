import { PublicKey } from '@solana/web3.js';

/**
 * Solana Program IDs for deployed smart contracts
 */

// TrustToken Program - Soulbound NFT for user verification
export const TRUST_TOKEN_PROGRAM_ID = new PublicKey(
  process.env.TRUST_TOKEN_PROGRAM_ID || '3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju'
);

// ReputationCard Program - Reputation card system
export const REPUTATION_CARD_PROGRAM_ID = new PublicKey(
  process.env.REPUTATION_CARD_PROGRAM_ID || 'FmZBiFUHHtGQioU11V9asYiJGP5wDdrLqoikzAyEyRtc'
);

/**
 * Solana Network Configuration
 */
export const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'devnet';
export const SOLANA_RPC_URL = 
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

/**
 * Server Configuration
 */
export const PORT = parseInt(process.env.PORT || '3001', 10);
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

/**
 * Database Configuration
 */
export const DATABASE_URL = process.env.DATABASE_URL;

/**
 * Program ID strings for logging or display
 */
export const PROGRAM_IDS = {
  TRUST_TOKEN: TRUST_TOKEN_PROGRAM_ID.toString(),
  REPUTATION_CARD: REPUTATION_CARD_PROGRAM_ID.toString(),
} as const;

/**
 * Card Types for ReputationCard program
 * Must match the enum in the Solana program
 */
export enum CardType {
  Trustworthy = 0,
  QualityProducts = 1,
  FastShipping = 2,
  GoodCommunication = 3,
  FairPricing = 4,
  Reliable = 5,
  Professional = 6,
  Responsive = 7,
}

/**
 * Card Status for ReputationCard program
 * Must match the enum in the Solana program
 */
export enum CardStatus {
  Active = 0,
  Revoked = 1,
  Disputed = 2,
  Suspended = 3,
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
 * Card Status Display Names
 */
export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  [CardStatus.Active]: 'Active',
  [CardStatus.Revoked]: 'Revoked',
  [CardStatus.Disputed]: 'Disputed',
  [CardStatus.Suspended]: 'Suspended',
};

/**
 * Validation Constants
 */
export const VALIDATION = {
  CARD_MESSAGE_MAX_LENGTH: 500,
  REVOCATION_REASON_MAX_LENGTH: 200,
  DISPUTE_REASON_MAX_LENGTH: 500,
  MIN_RATING: 1,
  MAX_RATING: 5,
} as const;
