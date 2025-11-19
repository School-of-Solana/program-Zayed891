# Solana Tipping App - Anchor Program

This directory contains the Solana program (smart contract) for the decentralized tipping application.

## Features
- Initialize personal tip jars using PDAs
- Send tips between users
- Withdraw earnings from tip jars
- Proper ownership validation and error handling

## Program Structure
- **Program ID**: `AxT1CnBJd6rcfhpU41nZSgDfDWtjUJjXUVuxMdt2hbHJ`
- **Instructions**: `initialize_tip_jar`, `send_tip`, `withdraw_tips`
- **Accounts**: `TipJar` struct with owner, total_tips, and created_at fields

## Development

### Prerequisites
- Rust and Cargo
- Solana CLI
- Anchor CLI

### Build
```bash
cd anchor_project/tipping_app
anchor build
```

### Test
```bash
anchor test
```

### Deploy
```bash
anchor deploy --provider.cluster devnet
```

## Testing
Comprehensive test suite covering:
- Happy path scenarios (initialize, tip, withdraw)
- Error cases (unauthorized access, insufficient funds, duplicate initialization)
- Edge cases (non-existent accounts)

All tests pass with proper error handling and validation.