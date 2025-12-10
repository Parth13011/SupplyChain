# ✅ Project Setup Complete!

## 🚀 What's Running

1. **Hardhat Local Node** - Running on `http://localhost:8545`
   - Provides test accounts with fake ETH
   - Chain ID: 1337

2. **Smart Contracts Deployed:**
   - UserRegistry: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
   - ProductRegistry: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
   - SupplyChain: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`

3. **Next.js Frontend** - Running on `http://localhost:3000`

## 📝 How to Use the System

### Step 1: Open the Frontend
Open your browser and go to: **http://localhost:3000**

### Step 2: Connect MetaMask

1. **Add Local Network to MetaMask:**
   - Open MetaMask
   - Click network dropdown → "Add Network" → "Add a network manually"
   - Enter:
     - Network Name: `Hardhat Local`
     - RPC URL: `http://localhost:8545`
     - Chain ID: `1337`
     - Currency Symbol: `ETH`

2. **Import Test Account:**
   - When you started `npm run node`, it showed test account private keys
   - Import the first account (Government account) into MetaMask
   - This account has the Government role automatically

3. **Connect Wallet:**
   - Click "Connect MetaMask" on the website
   - Approve the connection

### Step 3: Test the System

#### As Government (First Account):
1. You'll see the Government Dashboard
2. Register test users:
   - Copy addresses from Hardhat node output (accounts 1-4)
   - Register them as Manufacturer, Distributor, Retailer, Customer

#### As Manufacturer:
1. Switch to Manufacturer account in MetaMask
2. Create a product
3. Ship it to Distributor (use Distributor's address)

#### As Distributor:
1. Switch to Distributor account
2. Receive the product (enter Product ID)
3. Ship to Retailer

#### As Retailer:
1. Switch to Retailer account
2. Receive from Distributor
3. Sell to Customer

#### As Customer:
1. Switch to Customer account
2. Confirm delivery

#### Track Products:
- Use the Product Tracker at the bottom
- Enter any Product ID to see its complete journey
- View the visual supply chain flow diagram

## 🔄 Restarting the System

If you need to restart:

1. **Stop all processes** (Ctrl+C in terminals)

2. **Start Hardhat Node:**
   ```bash
   npm run node
   ```
   (Keep this terminal open)

3. **In a NEW terminal, deploy contracts:**
   ```bash
   npm run deploy:local
   ```
   (Update .env with new addresses if they change)

4. **Start Frontend:**
   ```bash
   npm run dev
   ```

## 🌐 Deploying to Professor's VM (Custom Network)

When ready to deploy to the custom network:

1. **Update .env:**
   ```env
   NEXT_PUBLIC_RPC=https://eth.didlab.org
   NEXT_PUBLIC_CHAIN_ID=252501
   ```

2. **Deploy contracts:**
   ```bash
   hardhat run scripts/deploy.js --network custom
   ```

3. **Update contract addresses in .env**

4. **Make sure MetaMask is connected to the custom network**

## 🔐 Security Reminders

- ✅ `.env` is in `.gitignore` - your private key is safe
- ⚠️ Never commit `.env` to git
- ⚠️ Never share your private key publicly
- ⚠️ Use test accounts for development, real accounts for production

## 📊 Test Accounts from Hardhat Node

When you run `npm run node`, it shows accounts like:
- Account #0: Government (deployer)
- Account #1: Use for Manufacturer
- Account #2: Use for Distributor
- Account #3: Use for Retailer
- Account #4: Use for Customer

Each has 10000 ETH for testing!

## 🎯 Quick Test Flow

1. Government registers all users
2. Manufacturer creates Product #1
3. Manufacturer ships Product #1 to Distributor
4. Distributor receives Product #1
5. Distributor ships Product #1 to Retailer
6. Retailer receives Product #1
7. Retailer sells Product #1 to Customer
8. Customer confirms delivery
9. Track Product #1 to see complete history!

Enjoy testing your blockchain supply chain system! 🚀

