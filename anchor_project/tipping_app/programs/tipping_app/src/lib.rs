use anchor_lang::prelude::*;

declare_id!("6JxyCFracCZ6ydBYQcZNB3aFJmvi8fgSVGHcTQerNyYo");

#[program]
pub mod tipping_app {
    use super::*;

    pub fn initialize_tip_jar(ctx: Context<InitializeTipJar>) -> Result<()> {
        let tip_jar = &mut ctx.accounts.tip_jar;
        tip_jar.owner = ctx.accounts.owner.key();
        tip_jar.total_tips = 0;
        tip_jar.created_at = Clock::get()?.unix_timestamp;
        
        msg!("Tip jar initialized for: {:?}", ctx.accounts.owner.key());
        Ok(())
    }

    pub fn send_tip(ctx: Context<SendTip>, amount: u64) -> Result<()> {
        // Transfer SOL from tipper to tip jar
        let transfer_instruction = anchor_lang::system_program::Transfer {
            from: ctx.accounts.tipper.to_account_info(),
            to: ctx.accounts.tip_jar.to_account_info(),
        };
        
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_instruction,
        );
        
        anchor_lang::system_program::transfer(cpi_context, amount)?;
        
        // Update tip jar stats
        let tip_jar = &mut ctx.accounts.tip_jar;
        tip_jar.total_tips = tip_jar.total_tips.checked_add(amount).unwrap();
        
        msg!("Tip of {} lamports sent to {:?}", amount, tip_jar.owner);
        Ok(())
    }

    pub fn withdraw_tips(ctx: Context<WithdrawTips>, amount: u64) -> Result<()> {
        // Check if the tip jar has enough balance
        let tip_jar_lamports = ctx.accounts.tip_jar.to_account_info().lamports();
        require!(tip_jar_lamports >= amount, CustomError::InsufficientFunds);
        
        // Transfer SOL from tip jar to owner
        **ctx.accounts.tip_jar.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? += amount;
        
        msg!("Withdrew {} lamports from tip jar", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeTipJar<'info> {
    #[account(
        init,
        payer = owner,
        space = TipJar::LEN,
        seeds = [b"tip_jar", owner.key().as_ref()],
        bump
    )]
    pub tip_jar: Account<'info, TipJar>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendTip<'info> {
    #[account(
        mut,
        seeds = [b"tip_jar", tip_jar.owner.as_ref()],
        bump
    )]
    pub tip_jar: Account<'info, TipJar>,
    #[account(mut)]
    pub tipper: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawTips<'info> {
    #[account(
        mut,
        seeds = [b"tip_jar", owner.key().as_ref()],
        bump,
        has_one = owner
    )]
    pub tip_jar: Account<'info, TipJar>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[account]
pub struct TipJar {
    pub owner: Pubkey,      // The wallet that owns this tip jar
    pub total_tips: u64,    // Total amount of tips received (in lamports)
    pub created_at: i64,    // Unix timestamp when tip jar was created
}

impl TipJar {
    const LEN: usize = 8 + // discriminator
        32 + // owner
        8 +  // total_tips
        8;   // created_at
}

#[error_code]
pub enum CustomError {
    #[msg("Insufficient funds in tip jar")]
    InsufficientFunds,
}
