use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3, CreateMasterEditionV3,
        CreateMetadataAccountsV3, Metadata, mpl_token_metadata::types::{Creator, DataV2},
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

declare_id!("3gUohiKvtQGZ2gXdimtvtVxy3JEFC9mTs3fLuo4ox5Ju");

#[program]
pub mod trust_token {
    use super::*;

    /// Initialize the TrustToken program
    /// This function sets up the program state and can only be called once by the authority.
    /// 
    /// # Arguments
    /// * `ctx` - The context containing all accounts needed for initialization
    /// 
    /// # Security
    /// - Only callable once due to the `init` constraint on program_state
    /// - Authority is set to the signer of this transaction
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let program_state = &mut ctx.accounts.program_state;
        program_state.authority = ctx.accounts.authority.key();
        program_state.total_minted = 0;
        
        msg!("TrustToken program initialized by authority: {}", program_state.authority);
        Ok(())
    }

    /// Mint a TrustToken NFT to a user
    /// This function creates a new NFT representing a verified identity for the user.
    /// 
    /// # Arguments
    /// * `ctx` - The context containing all accounts needed for minting
    /// * `name` - The name of the NFT (e.g., "Trust Token #1")
    /// * `symbol` - The symbol of the NFT (e.g., "TRUST")
    /// * `uri` - The metadata URI pointing to off-chain data
    /// 
    /// # Security
    /// - Users can self-mint their own verification tokens
    /// - Each mint creates a unique NFT with supply of 1
    /// - Master edition ensures true NFT (non-fungible) properties
    pub fn mint(
        ctx: Context<MintTrustToken>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        // Validate input lengths to prevent excessive storage costs
        require!(name.len() <= 32, TrustTokenError::NameTooLong);
        require!(symbol.len() <= 10, TrustTokenError::SymbolTooLong);
        require!(uri.len() <= 200, TrustTokenError::UriTooLong);

        // Mint 1 token to the user's associated token account
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.minter.to_account_info(),
            },
        );
        mint_to(cpi_context, 1)?;

        // Create metadata account for the NFT
        let creator = vec![Creator {
            address: ctx.accounts.minter.key(),
            verified: true,
            share: 100,
        }];

        let metadata_data = DataV2 {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 0, // No royalties for identity tokens
            creators: Some(creator),
            collection: None,
            uses: None,
        };

        let cpi_context = CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                mint_authority: ctx.accounts.minter.to_account_info(),
                update_authority: ctx.accounts.minter.to_account_info(),
                payer: ctx.accounts.minter.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        );
        create_metadata_accounts_v3(cpi_context, metadata_data, true, true, None)?;

        // Create master edition to make this a true NFT (supply = 1, no more can be minted)
        let cpi_context = CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: ctx.accounts.master_edition.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                update_authority: ctx.accounts.minter.to_account_info(),
                mint_authority: ctx.accounts.minter.to_account_info(),
                payer: ctx.accounts.minter.to_account_info(),
                metadata: ctx.accounts.metadata.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        );
        create_master_edition_v3(cpi_context, Some(0))?; // max_supply = 0 means only 1 can exist

        // Initialize the TrustToken account data
        let trust_token = &mut ctx.accounts.trust_token;
        trust_token.owner = ctx.accounts.minter.key();
        trust_token.mint = ctx.accounts.mint.key();
        trust_token.is_verified = true; // Set to true upon self-minting
        trust_token.minted_at = Clock::get()?.unix_timestamp;

        // Update program state
        let program_state = &mut ctx.accounts.program_state;
        program_state.total_minted = program_state
            .total_minted
            .checked_add(1)
            .ok_or(TrustTokenError::Overflow)?;

        msg!(
            "TrustToken NFT minted to: {} | Total minted: {}",
            trust_token.owner,
            program_state.total_minted
        );

        Ok(())
    }

    /// Revoke verification status of a TrustToken
    /// This allows the authority to revoke a user's verified status without burning the NFT.
    /// 
    /// # Arguments
    /// * `ctx` - The context containing all accounts needed for revocation
    /// 
    /// # Security
    /// - Only the program authority can revoke verification
    pub fn revoke_verification(ctx: Context<RevokeVerification>) -> Result<()> {
        // Security check: Only authority can revoke
        require!(
            ctx.accounts.authority.key() == ctx.accounts.program_state.authority,
            TrustTokenError::UnauthorizedRevoke
        );

        let trust_token = &mut ctx.accounts.trust_token;
        trust_token.is_verified = false;

        msg!("Verification revoked for TrustToken: {}", trust_token.mint);
        Ok(())
    }

    /// Restore verification status of a TrustToken
    /// This allows the authority to restore a user's verified status.
    /// 
    /// # Arguments
    /// * `ctx` - The context containing all accounts needed for restoration
    /// 
    /// # Security
    /// - Only the program authority can restore verification
    pub fn restore_verification(ctx: Context<RestoreVerification>) -> Result<()> {
        // Security check: Only authority can restore
        require!(
            ctx.accounts.authority.key() == ctx.accounts.program_state.authority,
            TrustTokenError::UnauthorizedRestore
        );

        let trust_token = &mut ctx.accounts.trust_token;
        trust_token.is_verified = true;

        msg!("Verification restored for TrustToken: {}", trust_token.mint);
        Ok(())
    }
}

// ============================================================================
// Account Structures
// ============================================================================

/// Program state account that stores global configuration
#[account]
pub struct ProgramState {
    /// The authority that can mint and manage TrustTokens
    pub authority: Pubkey,
    /// Total number of TrustTokens minted
    pub total_minted: u64,
}

impl ProgramState {
    /// Calculate the space needed for this account
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8; // total_minted
}

/// TrustToken account that stores NFT-specific data
/// This account is created for each minted TrustToken and stores verification status
#[account]
pub struct TrustToken {
    /// The owner of this TrustToken
    pub owner: Pubkey,
    /// The mint address of this TrustToken NFT
    pub mint: Pubkey,
    /// Whether this token represents a verified user
    pub is_verified: bool,
    /// Timestamp when the token was minted
    pub minted_at: i64,
}

impl TrustToken {
    /// Calculate the space needed for this account
    pub const LEN: usize = 8 + // discriminator
        32 + // owner
        32 + // mint
        1 + // is_verified
        8; // minted_at
}

// ============================================================================
// Context Structures
// ============================================================================

/// Context for initializing the TrustToken program
#[derive(Accounts)]
pub struct Initialize<'info> {
    /// The authority that will control the program
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Program state account - stores global configuration
    /// Seeds ensure only one program state can exist
    #[account(
        init,
        payer = authority,
        space = ProgramState::LEN,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    pub system_program: Program<'info, System>,
}

/// Context for minting a TrustToken NFT
#[derive(Accounts)]
pub struct MintTrustToken<'info> {
    /// The user minting the token (pays for everything and receives the NFT)
    #[account(mut)]
    pub minter: Signer<'info>,

    /// Program state account
    #[account(
        mut,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    /// The mint account for the NFT
    /// Each TrustToken gets a unique mint
    #[account(
        init,
        payer = minter,
        mint::decimals = 0,
        mint::authority = minter,
        mint::freeze_authority = minter,
    )]
    pub mint: Account<'info, Mint>,

    /// The token account that will hold the NFT
    /// Uses associated token account for standardization
    #[account(
        init_if_needed,
        payer = minter,
        associated_token::mint = mint,
        associated_token::authority = minter,
    )]
    pub token_account: Account<'info, TokenAccount>,

    /// TrustToken data account
    /// Stores verification status and metadata
    #[account(
        init,
        payer = minter,
        space = TrustToken::LEN,
        seeds = [b"trust_token", mint.key().as_ref()],
        bump
    )]
    pub trust_token: Account<'info, TrustToken>,

    /// Metadata account for the NFT
    /// CHECK: This account is created by the Metaplex program
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// Master edition account for the NFT
    /// CHECK: This account is created by the Metaplex program
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

/// Context for revoking verification
#[derive(Accounts)]
pub struct RevokeVerification<'info> {
    /// The authority that can revoke verification
    pub authority: Signer<'info>,

    /// Program state account
    #[account(
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    /// The TrustToken account to revoke
    #[account(
        mut,
        seeds = [b"trust_token", trust_token.mint.as_ref()],
        bump,
    )]
    pub trust_token: Account<'info, TrustToken>,
}

/// Context for restoring verification
#[derive(Accounts)]
pub struct RestoreVerification<'info> {
    /// The authority that can restore verification
    pub authority: Signer<'info>,

    /// Program state account
    #[account(
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    /// The TrustToken account to restore
    #[account(
        mut,
        seeds = [b"trust_token", trust_token.mint.as_ref()],
        bump,
    )]
    pub trust_token: Account<'info, TrustToken>,
}

// ============================================================================
// Error Codes
// ============================================================================

/// Custom error codes for the TrustToken program
#[error_code]
pub enum TrustTokenError {
    #[msg("Only the program authority can mint TrustTokens")]
    UnauthorizedMint,

    #[msg("Only the program authority can revoke verification")]
    UnauthorizedRevoke,

    #[msg("Only the program authority can restore verification")]
    UnauthorizedRestore,

    #[msg("Name must be 32 characters or less")]
    NameTooLong,

    #[msg("Symbol must be 10 characters or less")]
    SymbolTooLong,

    #[msg("URI must be 200 characters or less")]
    UriTooLong,

    #[msg("Arithmetic overflow occurred")]
    Overflow,
}
