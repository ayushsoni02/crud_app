#![allow(clippy::result_large_err)]

use core::str;

use anchor_lang::prelude::*;

declare_id!("GWdouRWPPfWpamJSGM78ZKsGJteroFRGJpgESQqCwhhb");

#[program] 
pub mod anchor {
    use super::*;

    pub fn create_journal_entry(ctx: Context<CreateEntry>,title:String,message:String) -> anchor_lang::Result<()> {
        let journel_entry = &mut ctx.accounts.journal_entry;
         journel_entry.owner = ctx.accounts.owner.key();
         journel_entry.title = title;
         journel_entry.message = message;

        Ok(())
    }

    pub fn update_journal_entry(ctx: Context<UpdateEntry>,_title:String,message:String) -> anchor_lang::Result<()> {
        let journel_entry = &mut ctx.accounts.journal_entry;
        journel_entry.message = message;

        Ok(())
    }

    pub fn delete_journal_entry(_ctx: Context<DeleteEntry>,_title:String) -> anchor_lang::Result<()> {

        Ok(())
    }

}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateEntry<'info> {
 #[account(
    init,
    seeds=[title.as_bytes(),owner.key().as_ref()],
    bump,
    space = 8 + JournelEntryState::INIT_SPACE,
    payer = owner,
 )]
 pub journal_entry: Account<'info, JournelEntryState>,

 #[account(mut)]
 pub owner: Signer<'info>,

 pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateEntry<'info> {
 #[account(
    mut,
    seeds=[title.as_bytes(),owner.key().as_ref()],
    bump,
    realloc = 8 + JournelEntryState::INIT_SPACE,
    realloc::payer = owner,
    realloc::zero = true,
 )]
 pub journal_entry: Account<'info, JournelEntryState>,

#[account(mut)]
 pub owner: Signer<'info>,

 pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
 #[account(
    mut,
    close = owner,
    seeds=[title.as_bytes(),owner.key().as_ref()],
    bump,
 )]
 pub journal_entry: Account<'info, JournelEntryState>,

 #[account(mut)]
 pub owner: Signer<'info>,

 pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
 pub struct JournelEntryState {
    pub owner: Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(1000)]
    pub message: String,
 }
