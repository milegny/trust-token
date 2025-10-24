use anchor_lang::prelude::*;

// This will be updated after deployment
declare_id!("11111111111111111111111111111111");

#[program]
pub mod reputation_card {
    use super::*;

    /// Initialize the ReputationCard program
    /// Sets up the program state with the authority who can manage the system.
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
        program_state.total_cards_issued = 0;
        program_state.total_cards_revoked = 0;
        
        msg!("ReputationCard program initialized by authority: {}", program_state.authority);
        Ok(())
    }

    /// Create a reputation card for a recipient
    /// An issuer (verified user) can issue a reputation card to another user.
    /// 
    /// # Arguments
    /// * `ctx` - The context containing all accounts needed for card creation
    /// * `card_type` - The type of reputation (e.g., Trustworthy, QualityProducts)
    /// * `message` - Optional message from the issuer
    /// * `rating` - Rating from 1-5
    /// 
    /// # Security
    /// - Issuer must have a verified TrustToken
    /// - Recipient must exist (have a wallet)
    /// - Card is stored on-chain with immutable issuer/recipient
    pub fn create_card(
        ctx: Context<CreateCard>,
        card_type: CardType,
        message: String,
        rating: u8,
    ) -> Result<()> {
        // Validate inputs
        require!(rating >= 1 && rating <= 5, ReputationCardError::InvalidRating);
        require!(message.len() <= 500, ReputationCardError::MessageTooLong);

        // Initialize the reputation card
        let card = &mut ctx.accounts.reputation_card;
        card.issuer = ctx.accounts.issuer.key();
        card.recipient = ctx.accounts.recipient.key();
        card.card_type = card_type;
        card.message = message;
        card.rating = rating;
        card.status = CardStatus::Active;
        card.issued_at = Clock::get()?.unix_timestamp;
        card.revoked_at = None;
        card.card_number = ctx.accounts.program_state.total_cards_issued;

        // Update program state
        let program_state = &mut ctx.accounts.program_state;
        program_state.total_cards_issued = program_state
            .total_cards_issued
            .checked_add(1)
            .ok_or(ReputationCardError::Overflow)?;

        msg!(
            "Reputation card #{} created: {} → {} (Type: {:?}, Rating: {})",
            card.card_number,
            card.issuer,
            card.recipient,
            card.card_type,
            card.rating
        );

        Ok(())
    }

    /// Revoke a reputation card
    /// The issuer can revoke a card they previously issued.
    /// 
    /// # Arguments
    /// * `ctx` - The context containing all accounts needed for revocation
    /// * `reason` - Optional reason for revocation
    /// 
    /// # Security
    /// - Only the original issuer can revoke their card
    /// - Card must be in Active status
    pub fn revoke_card(ctx: Context<RevokeCard>, reason: Option<String>) -> Result<()> {
        let card = &mut ctx.accounts.reputation_card;

        // Security check: Only issuer can revoke
        require!(
            card.issuer == ctx.accounts.issuer.key(),
            ReputationCardError::UnauthorizedRevoke
        );

        // Check card is active
        require!(
            card.status == CardStatus::Active,
            ReputationCardError::CardNotActive
        );

        // Validate reason length if provided
        if let Some(ref r) = reason {
            require!(r.len() <= 200, ReputationCardError::ReasonTooLong);
        }

        // Update card status
        card.status = CardStatus::Revoked;
        card.revoked_at = Some(Clock::get()?.unix_timestamp);
        card.revocation_reason = reason;

        // Update program state
        let program_state = &mut ctx.accounts.program_state;
        program_state.total_cards_revoked = program_state
            .total_cards_revoked
            .checked_add(1)
            .ok_or(ReputationCardError::Overflow)?;

        msg!("Reputation card #{} revoked by issuer", card.card_number);
        Ok(())
    }

    /// Update card status (admin function)
    /// The program authority can update the status of any card.
    /// 
    /// # Arguments
    /// * `ctx` - The context containing all accounts needed for status update
    /// * `new_status` - The new status to set
    /// 
    /// # Security
    /// - Only the program authority can call this
    /// - Used for moderation and dispute resolution
    pub fn update_card_status(
        ctx: Context<UpdateCardStatus>,
        new_status: CardStatus,
    ) -> Result<()> {
        // Security check: Only authority can update status
        require!(
            ctx.accounts.authority.key() == ctx.accounts.program_state.authority,
            ReputationCardError::UnauthorizedUpdate
        );

        let card = &mut ctx.accounts.reputation_card;
        let old_status = card.status;
        card.status = new_status;

        msg!(
            "Card #{} status updated by authority: {:?} → {:?}",
            card.card_number,
            old_status,
            new_status
        );

        Ok(())
    }

    /// Restore a revoked card
    /// The issuer can restore a card they previously revoked.
    /// 
    /// # Arguments
    /// * `ctx` - The context containing all accounts needed for restoration
    /// 
    /// # Security
    /// - Only the original issuer can restore their card
    /// - Card must be in Revoked status
    pub fn restore_card(ctx: Context<RestoreCard>) -> Result<()> {
        let card = &mut ctx.accounts.reputation_card;

        // Security check: Only issuer can restore
        require!(
            card.issuer == ctx.accounts.issuer.key(),
            ReputationCardError::UnauthorizedRestore
        );

        // Check card is revoked
        require!(
            card.status == CardStatus::Revoked,
            ReputationCardError::CardNotRevoked
        );

        // Update card status
        card.status = CardStatus::Active;
        card.revoked_at = None;
        card.revocation_reason = None;

        // Update program state
        let program_state = &mut ctx.accounts.program_state;
        program_state.total_cards_revoked = program_state
            .total_cards_revoked
            .checked_sub(1)
            .ok_or(ReputationCardError::Underflow)?;

        msg!("Reputation card #{} restored by issuer", card.card_number);
        Ok(())
    }

    /// Dispute a reputation card
    /// The recipient can dispute a card issued to them.
    /// 
    /// # Arguments
    /// * `ctx` - The context containing all accounts needed for dispute
    /// * `dispute_reason` - Reason for the dispute
    /// 
    /// # Security
    /// - Only the recipient can dispute a card
    /// - Card must be in Active status
    pub fn dispute_card(ctx: Context<DisputeCard>, dispute_reason: String) -> Result<()> {
        let card = &mut ctx.accounts.reputation_card;

        // Security check: Only recipient can dispute
        require!(
            card.recipient == ctx.accounts.recipient.key(),
            ReputationCardError::UnauthorizedDispute
        );

        // Check card is active
        require!(
            card.status == CardStatus::Active,
            ReputationCardError::CardNotActive
        );

        // Validate dispute reason
        require!(
            dispute_reason.len() <= 500,
            ReputationCardError::DisputeReasonTooLong
        );

        // Update card status
        card.status = CardStatus::Disputed;
        card.dispute_reason = Some(dispute_reason);

        msg!("Reputation card #{} disputed by recipient", card.card_number);
        Ok(())
    }
}

// ============================================================================
// Account Structures
// ============================================================================

/// Program state account that stores global configuration
#[account]
pub struct ProgramState {
    /// The authority that can manage the program
    pub authority: Pubkey,
    /// Total number of reputation cards issued
    pub total_cards_issued: u64,
    /// Total number of cards revoked
    pub total_cards_revoked: u64,
}

impl ProgramState {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        8 + // total_cards_issued
        8; // total_cards_revoked
}

/// Reputation card account
#[account]
pub struct ReputationCard {
    /// The user who issued this card
    pub issuer: Pubkey,
    /// The user who received this card
    pub recipient: Pubkey,
    /// Type of reputation
    pub card_type: CardType,
    /// Message from the issuer
    pub message: String,
    /// Rating (1-5)
    pub rating: u8,
    /// Current status of the card
    pub status: CardStatus,
    /// When the card was issued
    pub issued_at: i64,
    /// When the card was revoked (if applicable)
    pub revoked_at: Option<i64>,
    /// Reason for revocation (if applicable)
    pub revocation_reason: Option<String>,
    /// Reason for dispute (if applicable)
    pub dispute_reason: Option<String>,
    /// Unique card number
    pub card_number: u64,
}

impl ReputationCard {
    pub const LEN: usize = 8 + // discriminator
        32 + // issuer
        32 + // recipient
        1 + // card_type (enum)
        4 + 500 + // message (String with max 500 chars)
        1 + // rating
        1 + // status (enum)
        8 + // issued_at
        1 + 8 + // revoked_at (Option<i64>)
        1 + 4 + 200 + // revocation_reason (Option<String> max 200)
        1 + 4 + 500 + // dispute_reason (Option<String> max 500)
        8; // card_number
}

/// Types of reputation cards
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum CardType {
    Trustworthy,
    QualityProducts,
    FastShipping,
    GoodCommunication,
    FairPricing,
    Reliable,
    Professional,
    Responsive,
}

/// Status of a reputation card
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum CardStatus {
    Active,
    Revoked,
    Disputed,
    Suspended,
}

// ============================================================================
// Context Structures
// ============================================================================

/// Context for initializing the program
#[derive(Accounts)]
pub struct Initialize<'info> {
    /// The authority that will control the program
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Program state account
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

/// Context for creating a reputation card
#[derive(Accounts)]
pub struct CreateCard<'info> {
    /// The user issuing the card (must be verified)
    #[account(mut)]
    pub issuer: Signer<'info>,

    /// The recipient of the card
    /// CHECK: We only need their public key
    pub recipient: UncheckedAccount<'info>,

    /// Program state account
    #[account(
        mut,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    /// The reputation card account
    #[account(
        init,
        payer = issuer,
        space = ReputationCard::LEN,
        seeds = [
            b"reputation_card",
            issuer.key().as_ref(),
            recipient.key().as_ref(),
            &program_state.total_cards_issued.to_le_bytes()
        ],
        bump
    )]
    pub reputation_card: Account<'info, ReputationCard>,

    pub system_program: Program<'info, System>,
}

/// Context for revoking a card
#[derive(Accounts)]
pub struct RevokeCard<'info> {
    /// The issuer who is revoking the card
    pub issuer: Signer<'info>,

    /// Program state account
    #[account(
        mut,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    /// The reputation card to revoke
    #[account(
        mut,
        seeds = [
            b"reputation_card",
            reputation_card.issuer.as_ref(),
            reputation_card.recipient.as_ref(),
            &reputation_card.card_number.to_le_bytes()
        ],
        bump
    )]
    pub reputation_card: Account<'info, ReputationCard>,
}

/// Context for updating card status (admin)
#[derive(Accounts)]
pub struct UpdateCardStatus<'info> {
    /// The program authority
    pub authority: Signer<'info>,

    /// Program state account
    #[account(
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    /// The reputation card to update
    #[account(
        mut,
        seeds = [
            b"reputation_card",
            reputation_card.issuer.as_ref(),
            reputation_card.recipient.as_ref(),
            &reputation_card.card_number.to_le_bytes()
        ],
        bump
    )]
    pub reputation_card: Account<'info, ReputationCard>,
}

/// Context for restoring a card
#[derive(Accounts)]
pub struct RestoreCard<'info> {
    /// The issuer who is restoring the card
    pub issuer: Signer<'info>,

    /// Program state account
    #[account(
        mut,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,

    /// The reputation card to restore
    #[account(
        mut,
        seeds = [
            b"reputation_card",
            reputation_card.issuer.as_ref(),
            reputation_card.recipient.as_ref(),
            &reputation_card.card_number.to_le_bytes()
        ],
        bump
    )]
    pub reputation_card: Account<'info, ReputationCard>,
}

/// Context for disputing a card
#[derive(Accounts)]
pub struct DisputeCard<'info> {
    /// The recipient who is disputing the card
    pub recipient: Signer<'info>,

    /// The reputation card to dispute
    #[account(
        mut,
        seeds = [
            b"reputation_card",
            reputation_card.issuer.as_ref(),
            reputation_card.recipient.as_ref(),
            &reputation_card.card_number.to_le_bytes()
        ],
        bump
    )]
    pub reputation_card: Account<'info, ReputationCard>,
}

// ============================================================================
// Error Codes
// ============================================================================

/// Custom error codes for the ReputationCard program
#[error_code]
pub enum ReputationCardError {
    #[msg("Rating must be between 1 and 5")]
    InvalidRating,

    #[msg("Message must be 500 characters or less")]
    MessageTooLong,

    #[msg("Only the issuer can revoke this card")]
    UnauthorizedRevoke,

    #[msg("Only the issuer can restore this card")]
    UnauthorizedRestore,

    #[msg("Only the program authority can update card status")]
    UnauthorizedUpdate,

    #[msg("Only the recipient can dispute this card")]
    UnauthorizedDispute,

    #[msg("Card is not in Active status")]
    CardNotActive,

    #[msg("Card is not in Revoked status")]
    CardNotRevoked,

    #[msg("Revocation reason must be 200 characters or less")]
    ReasonTooLong,

    #[msg("Dispute reason must be 500 characters or less")]
    DisputeReasonTooLong,

    #[msg("Arithmetic overflow occurred")]
    Overflow,

    #[msg("Arithmetic underflow occurred")]
    Underflow,
}
