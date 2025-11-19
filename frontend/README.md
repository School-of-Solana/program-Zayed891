# Solana Tipping App - Frontend

A React TypeScript frontend for the Solana Tipping dApp, built with Vite and modern Web3 tooling.

## Features
- Solana wallet integration (Phantom, Solflare, etc.)
- Create and manage personal tip jars
- Send tips to other users via public key
- Real-time balance updates
- Withdraw earnings to wallet
- Responsive design with Tailwind CSS

## Tech Stack
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Solana Integration**: @solana/wallet-adapter, @coral-xyz/anchor
- **Network**: Solana Devnet

## Development

### Prerequisites
- Node.js and npm
- Solana wallet browser extension

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Usage
1. Connect your Solana wallet
2. Create a tip jar to start receiving tips
3. Send tips to others using their public key
4. Withdraw your earnings when ready
5. Use the demo feature to test functionality

## Deployment
Built and ready for deployment to Vercel, Netlify, or any static hosting service.

The frontend connects to the Solana program at ID: `AxT1CnBJd6rcfhpU41nZSgDfDWtjUJjXUVuxMdt2hbHJ`

## Getting Started

### Installation

#### Download the template

```shell
npx create-solana-dapp@latest -t gh:solana-foundation/templates/gill/frontend
```

#### Install Dependencies

```shell
npm install
```

### Start the app

```shell
npm run dev
```
