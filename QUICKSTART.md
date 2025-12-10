# Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment

Create a `.env` file in the root directory with your configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_RPC=https://eth.didlab.org
NEXT_PUBLIC_CHAIN_ID=252501
NEXT_PUBLIC_USER_REGISTRY=
NEXT_PUBLIC_PRODUCT_REGISTRY=
NEXT_PUBLIC_SUPPLY_CHAIN=
PRIVATE_KEY=your_private_key_here
```

## Step 3: Compile Contracts

```bash
npm run compile
```

## Step 4: Deploy Contracts

### Option A: Local Development (Recommended for Testing)

1. **Start Hardhat Node** (in terminal 1):
```bash
npm run node
```

2. **Deploy Contracts** (in terminal 2):
```bash
npm run deploy:local
```

3. **Copy the contract addresses** from the output to your `.env` file:
```
NEXT_PUBLIC_USER_REGISTRY=0x...
NEXT_PUBLIC_PRODUCT_REGISTRY=0x...
NEXT_PUBLIC_SUPPLY_CHAIN=0x...
```

4. **Setup Test Users** (optional, for local testing):
```bash
npm run setup:local
```

### Option B: Custom Network (Professor's VM)

1. Make sure your `.env` has the correct network settings
2. Add your private key to `.env` (NEVER commit this!)
3. Deploy:
```bash
hardhat run scripts/deploy.js --network custom
```

4. Copy contract addresses to `.env`

## Step 5: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Connect MetaMask

1. **For Local Development:**
   - Add network: `http://localhost:8545` (Chain ID: 1337)
   - Import one of the test accounts from Hardhat node output
   - The first account is automatically the Government

2. **For Custom Network:**
   - Make sure MetaMask is connected to the network with Chain ID: 252501
   - Use your MetaMask account with tokens

## Step 7: Start Using the System

1. **As Government:**
   - Register users with different roles
   - Assign Manufacturer, Distributor, Retailer, and Customer roles

2. **As Manufacturer:**
   - Create products
   - Ship products to distributors

3. **As Distributor:**
   - Receive products from manufacturers
   - Ship products to retailers

4. **As Retailer:**
   - Receive products from distributors
   - Sell products to customers

5. **As Customer:**
   - Confirm delivery of purchased products

6. **Track Products:**
   - Use the Product Tracker to view any product's history
   - Enter a Product ID to see all transactions

## Troubleshooting

### MetaMask Connection Issues
- Make sure MetaMask is installed
- Check that you're on the correct network
- Try refreshing the page

### Contract Not Found Errors
- Make sure contracts are compiled: `npm run compile`
- Verify contract addresses in `.env` are correct
- Check that you deployed to the correct network

### Transaction Failures
- Ensure you have enough tokens for gas
- Check that your account has the correct role
- Verify the product/transaction exists

### Network Issues
- For localhost: Make sure Hardhat node is running
- For custom network: Verify RPC URL and Chain ID in `.env`

## Next Steps

- Deploy to IPFS for decentralized storage
- Add more features like product images
- Implement batch operations
- Add event listeners for real-time updates

