use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod insurance_pool {
    use super::*;

    /// Initialize the insurance pool
    pub fn initialize(ctx: Context<Initialize>, coverage_limit: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.total_balance = 0;
        pool.total_claims = 0;
        pool.approved_claims = 0;
        pool.rejected_claims = 0;
        pool.total_paid_out = 0;
        pool.coverage_limit = coverage_limit;
        pool.bump = ctx.bumps.pool;
        
        msg!("Insurance pool initialized with coverage limit: {}", coverage_limit);
        Ok(())
    }

    /// Deposit funds into the insurance pool
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        
        // Transfer SOL from depositor to pool
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.depositor.key(),
            &pool.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.depositor.to_account_info(),
                pool.to_account_info(),
            ],
        )?;

        pool.total_balance = pool.total_balance.checked_add(amount).unwrap();
        
        msg!("Deposited {} lamports to insurance pool", amount);
        Ok(())
    }

    /// Create a new insurance claim
    pub fn create_claim(
        ctx: Context<CreateClaim>,
        order_id: String,
        amount: u64,
        reason: String,
    ) -> Result<()> {
        require!(amount >= 100_000_000, ErrorCode::ClaimTooSmall); // 0.1 SOL minimum
        require!(amount <= ctx.accounts.pool.coverage_limit, ErrorCode::ExceedsCoverageLimit);
        
        let claim = &mut ctx.accounts.claim;
        let pool = &mut ctx.accounts.pool;
        
        claim.claimant = ctx.accounts.claimant.key();
        claim.order_id = order_id;
        claim.amount = amount;
        claim.reason = reason;
        claim.status = ClaimStatus::Pending;
        claim.votes_for = 0;
        claim.votes_against = 0;
        claim.created_at = Clock::get()?.unix_timestamp;
        claim.voting_deadline = Clock::get()?.unix_timestamp + (72 * 3600); // 72 hours
        claim.bump = ctx.bumps.claim;
        
        pool.total_claims = pool.total_claims.checked_add(1).unwrap();
        
        msg!("Insurance claim created for {} lamports", amount);
        Ok(())
    }

    /// Vote on an insurance claim
    pub fn vote_on_claim(ctx: Context<VoteOnClaim>, approve: bool) -> Result<()> {
        let claim = &mut ctx.accounts.claim;
        let vote = &mut ctx.accounts.vote;
        
        require!(claim.status == ClaimStatus::Pending, ErrorCode::ClaimNotPending);
        require!(
            Clock::get()?.unix_timestamp <= claim.voting_deadline,
            ErrorCode::VotingPeriodEnded
        );
        
        vote.voter = ctx.accounts.voter.key();
        vote.claim = claim.key();
        vote.approved = approve;
        vote.voted_at = Clock::get()?.unix_timestamp;
        vote.bump = ctx.bumps.vote;
        
        if approve {
            claim.votes_for = claim.votes_for.checked_add(1).unwrap();
        } else {
            claim.votes_against = claim.votes_against.checked_add(1).unwrap();
        }
        
        msg!("Vote recorded: {}", if approve { "FOR" } else { "AGAINST" });
        Ok(())
    }

    /// Finalize a claim after voting period
    pub fn finalize_claim(ctx: Context<FinalizeClaim>) -> Result<()> {
        let claim = &mut ctx.accounts.claim;
        let pool = &mut ctx.accounts.pool;
        
        require!(claim.status == ClaimStatus::Pending, ErrorCode::ClaimNotPending);
        require!(
            Clock::get()?.unix_timestamp > claim.voting_deadline,
            ErrorCode::VotingPeriodNotEnded
        );
        
        let total_votes = claim.votes_for + claim.votes_against;
        require!(total_votes >= 3, ErrorCode::InsufficientVotes); // Minimum 3 votes
        
        let approval_percentage = (claim.votes_for as f64) / (total_votes as f64);
        
        if approval_percentage >= 0.66 {
            // Claim approved
            claim.status = ClaimStatus::Approved;
            pool.approved_claims = pool.approved_claims.checked_add(1).unwrap();
            msg!("Claim approved with {}% approval", (approval_percentage * 100.0) as u64);
        } else {
            // Claim rejected
            claim.status = ClaimStatus::Rejected;
            pool.rejected_claims = pool.rejected_claims.checked_add(1).unwrap();
            msg!("Claim rejected with only {}% approval", (approval_percentage * 100.0) as u64);
        }
        
        claim.resolved_at = Some(Clock::get()?.unix_timestamp);
        Ok(())
    }

    /// Pay out an approved claim
    pub fn payout_claim(ctx: Context<PayoutClaim>) -> Result<()> {
        let claim = &mut ctx.accounts.claim;
        let pool = &mut ctx.accounts.pool;
        
        require!(claim.status == ClaimStatus::Approved, ErrorCode::ClaimNotApproved);
        require!(pool.total_balance >= claim.amount, ErrorCode::InsufficientPoolBalance);
        
        // Transfer from pool to claimant
        **pool.to_account_info().try_borrow_mut_lamports()? -= claim.amount;
        **ctx.accounts.claimant.try_borrow_mut_lamports()? += claim.amount;
        
        claim.status = ClaimStatus::Paid;
        pool.total_balance = pool.total_balance.checked_sub(claim.amount).unwrap();
        pool.total_paid_out = pool.total_paid_out.checked_add(claim.amount).unwrap();
        
        msg!("Claim paid out: {} lamports", claim.amount);
        Ok(())
    }

    /// Update coverage limit (authority only)
    pub fn update_coverage_limit(ctx: Context<UpdateCoverageLimit>, new_limit: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.coverage_limit = new_limit;
        
        msg!("Coverage limit updated to: {}", new_limit);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + InsurancePool::INIT_SPACE,
        seeds = [b"insurance_pool"],
        bump
    )]
    pub pool: Account<'info, InsurancePool>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"insurance_pool"],
        bump = pool.bump
    )]
    pub pool: Account<'info, InsurancePool>,
    
    #[account(mut)]
    pub depositor: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(order_id: String)]
pub struct CreateClaim<'info> {
    #[account(
        init,
        payer = claimant,
        space = 8 + Claim::INIT_SPACE,
        seeds = [b"claim", claimant.key().as_ref(), order_id.as_bytes()],
        bump
    )]
    pub claim: Account<'info, Claim>,
    
    #[account(
        mut,
        seeds = [b"insurance_pool"],
        bump = pool.bump
    )]
    pub pool: Account<'info, InsurancePool>,
    
    #[account(mut)]
    pub claimant: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VoteOnClaim<'info> {
    #[account(mut)]
    pub claim: Account<'info, Claim>,
    
    #[account(
        init,
        payer = voter,
        space = 8 + Vote::INIT_SPACE,
        seeds = [b"vote", claim.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote: Account<'info, Vote>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeClaim<'info> {
    #[account(mut)]
    pub claim: Account<'info, Claim>,
    
    #[account(
        mut,
        seeds = [b"insurance_pool"],
        bump = pool.bump
    )]
    pub pool: Account<'info, InsurancePool>,
}

#[derive(Accounts)]
pub struct PayoutClaim<'info> {
    #[account(
        mut,
        constraint = claim.claimant == claimant.key() @ ErrorCode::InvalidClaimant
    )]
    pub claim: Account<'info, Claim>,
    
    #[account(
        mut,
        seeds = [b"insurance_pool"],
        bump = pool.bump
    )]
    pub pool: Account<'info, InsurancePool>,
    
    /// CHECK: Verified by claim.claimant constraint
    #[account(mut)]
    pub claimant: AccountInfo<'info>,
    
    #[account(
        constraint = authority.key() == pool.authority @ ErrorCode::Unauthorized
    )]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateCoverageLimit<'info> {
    #[account(
        mut,
        seeds = [b"insurance_pool"],
        bump = pool.bump,
        constraint = authority.key() == pool.authority @ ErrorCode::Unauthorized
    )]
    pub pool: Account<'info, InsurancePool>,
    
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct InsurancePool {
    pub authority: Pubkey,
    pub total_balance: u64,
    pub total_claims: u64,
    pub approved_claims: u64,
    pub rejected_claims: u64,
    pub total_paid_out: u64,
    pub coverage_limit: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Claim {
    pub claimant: Pubkey,
    #[max_len(64)]
    pub order_id: String,
    pub amount: u64,
    #[max_len(500)]
    pub reason: String,
    pub status: ClaimStatus,
    pub votes_for: u32,
    pub votes_against: u32,
    pub created_at: i64,
    pub voting_deadline: i64,
    pub resolved_at: Option<i64>,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Vote {
    pub voter: Pubkey,
    pub claim: Pubkey,
    pub approved: bool,
    pub voted_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum ClaimStatus {
    Pending,
    Approved,
    Rejected,
    Paid,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Claim amount is below minimum (0.1 SOL)")]
    ClaimTooSmall,
    #[msg("Claim amount exceeds coverage limit")]
    ExceedsCoverageLimit,
    #[msg("Claim is not in pending status")]
    ClaimNotPending,
    #[msg("Voting period has ended")]
    VotingPeriodEnded,
    #[msg("Voting period has not ended yet")]
    VotingPeriodNotEnded,
    #[msg("Insufficient votes to finalize claim")]
    InsufficientVotes,
    #[msg("Claim is not approved")]
    ClaimNotApproved,
    #[msg("Insufficient balance in insurance pool")]
    InsufficientPoolBalance,
    #[msg("Invalid claimant")]
    InvalidClaimant,
    #[msg("Unauthorized")]
    Unauthorized,
}
