# Blockchain Supply Chain Management System

A decentralized supply chain management system built on Ethereum using Hardhat and Next.js, with MetaMask wallet integration.

## Features

- **Role-Based Access Control**: Government assigns roles (Manufacturer, Distributor, Retailer, Customer)
- **Unique Product Identity**: Each product gets a unique ID on the blockchain
- **Complete Supply Chain Tracking**: Track products from Manufacturer → Distributor → Retailer → Customer
- **Transaction Verification**: All transactions are visible and verifiable on the blockchain
- **MetaMask Integration**: Users interact with the system using their MetaMask wallets

## Tech Stack

- **Smart Contracts**: Solidity 0.8.20
- **Development Framework**: Hardhat
- **Frontend**: Next.js 14, React, TypeScript
- **Blockchain**: Ethereum (Custom network support)
- **Wallet**: MetaMask
- **Styling**: Tailwind CSS

## Project Structure

```
blockchain_final/
├── contracts/              # Smart contracts
│   ├── UserRegistry.sol    # User role management
│   ├── ProductRegistry.sol # Product identity management
│   └── SupplyChain.sol     # Supply chain transaction tracking
├── scripts/                # Deployment scripts
│   └── deploy.js           # Deploy all contracts
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── GovernmentDashboard.tsx
│   ├── ManufacturerDashboard.tsx
│   ├── DistributorDashboard.tsx
│   ├── RetailerDashboard.tsx
│   ├── CustomerDashboard.tsx
│   └── ProductTracker.tsx
├── lib/                   # Utility functions
│   ├── web3.ts           # Web3/MetaMask utilities
│   └── contracts.ts      # Contract interaction helpers
└── hardhat.config.js     # Hardhat configuration
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:4000

# Blockchain Network
NEXT_PUBLIC_RPC=https://eth.didlab.org
NEXT_PUBLIC_CHAIN_ID=252501

# Contract Addresses (will be populated after deployment)
NEXT_PUBLIC_USER_REGISTRY=
NEXT_PUBLIC_PRODUCT_REGISTRY=
NEXT_PUBLIC_SUPPLY_CHAIN=

# Private Key for deployment (NEVER commit this to git)
PRIVATE_KEY=your_private_key_here
```

### 3. Compile Smart Contracts

```bash
npm run compile
```

### 4. Deploy Contracts

#### For Local Development:

1. Start a local Hardhat node:
```bash
npm run node
```

2. In another terminal, deploy contracts:
```bash
npm run deploy:local
```

3. Copy the deployed contract addresses to your `.env` file.

#### For Custom Network:

```bash
hardhat run scripts/deploy.js --network custom
```

### 5. Run the Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### 1. Connect MetaMask

- Click "Connect MetaMask" button
- Approve the connection in MetaMask
- Make sure you're connected to the correct network (Chain ID: 252501 for custom network, or localhost:8545 for local)

### 2. Government Role

The deployer account is automatically registered as Government. Government can:
- Register new users with roles (Manufacturer, Distributor, Retailer, Customer)
- Update user roles

### 3. Manufacturer

- Create products with unique IDs
- Ship products to distributors

### 4. Distributor

- Receive products from manufacturers
- Ship products to retailers

### 5. Retailer

- Receive products from distributors
- Sell products to customers

### 6. Customer

- Confirm delivery of purchased products

### 7. Product Tracker

Anyone can track any product by entering its Product ID to view:
- Product information
- Complete transaction history
- Current status in the supply chain

## Supply Chain Flow

1. **Manufacturer** creates a product → Product gets unique ID
2. **Manufacturer** ships to **Distributor**
3. **Distributor** receives product
4. **Distributor** ships to **Retailer**
5. **Retailer** receives product
6. **Retailer** sells to **Customer**
7. **Customer** confirms delivery

## Testing

```bash
npm test
```

## Deployment to Production

1. Update `.env` with production network details
2. Deploy contracts to production network
3. Update contract addresses in `.env`
4. Build and deploy frontend:
```bash
npm run build
npm start
```

## IPFS Integration

The system fully supports IPFS for storing product metadata, images, and documents. 

### Features:
- **Automatic File Upload**: Upload product images, PDFs, and documents directly from the Manufacturer Dashboard
- **Drag & Drop Interface**: Easy-to-use drag-and-drop file upload with progress indicators
- **IPFS Metadata Storage**: Automatically creates and stores structured metadata on IPFS
- **Image Display**: Product images stored on IPFS are automatically displayed in the product list
- **Manual IPFS Hash Entry**: You can still manually enter IPFS hashes or JSON metadata if needed

### How to Use:
1. When creating a product, use the file upload area to select images or documents
2. Files are automatically uploaded to IPFS (you'll see upload progress)
3. Metadata is automatically generated and stored on IPFS
4. The IPFS hash is stored in the product's metadata field on the blockchain
5. Images are automatically displayed when viewing products

### IPFS Configuration:
The system uses the DIDLab IPFS gateway by default. You can configure it via environment variables:
```env
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.didlab.org
NEXT_PUBLIC_IPFS_API=https://ipfs.didlab.org/api/v0
```

For more details, see [IPFS_DEPLOYMENT.md](./IPFS_DEPLOYMENT.md)

## Notes

- Make sure you have MetaMask installed in your browser
- Ensure you have enough tokens in your MetaMask wallet for gas fees
- The system uses the custom network specified in your `.env` file
- All transactions are recorded on the blockchain and are immutable

## License

MIT

