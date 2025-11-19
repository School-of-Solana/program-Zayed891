# Project Description

**Deployed Frontend URL:** [Frontend built and ready for deployment - can be deployed to Vercel]

**Solana Program ID (Devnet):** `AxT1CnBJd6rcfhpU41nZSgDfDWtjUJjXUVuxMdt2hbHJ`

## Project Overview

### Description
A decentralized tipping application built on Solana that allows users to create personal tip jars, receive tips from others, and withdraw their earnings. The application demonstrates core Solana programming concepts including PDAs (Program Derived Addresses), cross-program invocations, and state management. Users can create their own tip jar, send tips to other users' public keys, and manage their earnings through a clean, user-friendly interface. **Configured for Solana Devnet deployment.**

### Key Features
- **Create Tip Jar**: Initialize a personal tip jar account linked to your wallet address
- **Send Tips**: Send SOL tips to other users by entering their public key and desired amount
- **Withdraw Earnings**: Withdraw accumulated tips from your tip jar to your wallet
- **Real-time Balance**: View total tips received and tip jar creation date
- **Demo Functionality**: Test the app by tipping yourself for demonstration purposes

### How to Use the dApp
1. **Connect Wallet** - Connect your Solana wallet (Phantom, Solflare, etc.)
2. **Create Tip Jar** - Click "Create Tip Jar" to initialize your personal tipping account
3. **Send Tips** - Enter a recipient's public key and tip amount, then click "Send Tip"
4. **View Earnings** - See your total tips received and creation date in the tip jar section
5. **Withdraw Funds** - Enter withdrawal amount and click "Withdraw" to transfer tips to your wallet
6. **Demo Feature** - Use "Demo: Tip Yourself" to test the functionality

## Program Architecture
The Tipping App uses a simple yet effective architecture with one main account type (TipJar) and three core instructions. The program leverages Solana's PDA system to create deterministic, user-specific tip jar accounts while ensuring proper ownership and access control.

### PDA Usage
The program uses Program Derived Addresses to create unique, deterministic tip jar accounts for each user, ensuring data isolation and preventing conflicts.

**PDAs Used:**
- **Tip Jar PDA**: Derived from seeds `["tip_jar", user_wallet_pubkey]` - creates a unique tip jar account for each user that only they can control and withdraw from. This PDA ensures deterministic account generation and prevents users from interfering with each other's tip jars.

### Program Instructions
**Instructions Implemented:**
- **initialize_tip_jar**: Creates a new tip jar account for the user with initial values (total_tips: 0, creation timestamp). The account is owned by the calling wallet and uses the user's public key as a seed for the PDA.
- **send_tip**: Transfers SOL from the tipper's wallet to a recipient's tip jar account and updates the tip jar's total_tips counter. Handles cross-program invocation to the System Program for the actual SOL transfer.
- **withdraw_tips**: Allows tip jar owners to withdraw SOL from their tip jar to their wallet. Includes proper validation to ensure only the owner can withdraw and sufficient funds exist.

### Account Structure
```rust
#[account]
pub struct TipJar {
    pub owner: Pubkey,        // The wallet that owns this tip jar (32 bytes)
    pub total_tips: u64,      // Total amount of tips received in lamports (8 bytes)
    pub created_at: i64,      // Unix timestamp when tip jar was created (8 bytes)
}
```

### Error Handling
The program includes custom error handling:
- **InsufficientFunds**: Thrown when attempting to withdraw more than the available balance in the tip jar

### Security Features
- **Ownership Validation**: Only tip jar owners can withdraw funds using Anchor's `has_one` constraint
- **PDA Seeds**: Deterministic account generation prevents account collisions
- **Amount Validation**: Checks for sufficient funds before withdrawal operations
- **Signer Requirements**: All operations require appropriate wallet signatures

### Testing Coverage
Comprehensive test suite includes both happy path and error scenarios:

**Happy Path Tests:**
- Initialize tip jar successfully
- Send tips between accounts
- Withdraw tips as owner

**Unhappy Path Tests:**
- Prevent duplicate tip jar initialization
- Block withdrawals exceeding available balance
- Reject unauthorized withdrawal attempts
- Handle interactions with non-existent tip jars

### Technical Implementation Details
- **Language**: Rust with Anchor framework v0.31.1
- **Network**: Designed for Solana Devnet
- **Frontend**: React with TypeScript using Solana wallet adapter
- **Dependencies**: @coral-xyz/anchor, @solana/web3.js, @solana/wallet-adapter
- **Build Tool**: Vite for modern frontend bundling

### Development Environment
- **Anchor CLI**: Used for program development, testing, and deployment
- **Solana CLI**: For keypair management and network configuration
- **Node.js/npm**: Frontend package management and build process
- **TypeScript**: Type-safe development for both tests and frontend

This project demonstrates practical Solana development skills including account management, PDAs, cross-program invocations, error handling, and frontend integration with modern Web3 tooling.
pub struct YourAccountName {
    // Describe each field
}
```

## Testing

### Test Coverage
[TODO: Describe your testing approach and what scenarios you covered]

**Happy Path Tests:**
- Test 1: [Description]
- Test 2: [Description]
- ...

**Unhappy Path Tests:**
- Test 1: [Description of error scenario]
- Test 2: [Description of error scenario]
- ...

### Running Tests
```bash
# Commands to run your tests
anchor test
```

### Additional Notes for Evaluators

[TODO: Add any specific notes or context that would help evaluators understand your project better]