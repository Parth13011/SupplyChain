# 🚀 Deploy to Custom Network (Professor's VM)

## Network Information

- **RPC Endpoint:** `https://eth.didlab.org`
- **Chain ID:** `252501`
- **Native Token:** `Trust (TT)`
- **Explorer:** `https://explorer.didlab.org`
- **Faucet:** `https://faucet.didlab.org`
- **Gas Price:** `1 gwei`

## ⚠️ Before Deploying

### 1. Get Tokens from Faucet

You need tokens to pay for gas fees:

1. Go to: **https://faucet.didlab.org**
2. Enter your wallet address (from private key)
3. Request tokens
4. Wait for tokens to arrive

### 2. Verify Your Wallet Address

Your wallet address (from private key in .env):
- Private Key: `e36896b0b65c5b70bda9011c18a64c9036dd1c9cea762869011c4aabc11bd686`
- Address: (check in MetaMask or calculate from private key)

### 3. Check Balance

You can check your balance on the explorer:
- Go to: `https://explorer.didlab.org`
- Search for your address

## 🚀 Deployment Steps

### Step 1: Deploy Contracts

```bash
npm run deploy:custom
```

This will:
- Deploy UserRegistry
- Deploy ProductRegistry  
- Deploy SupplyChain
- Show contract addresses
- Provide explorer links

### Step 2: Update .env File

After deployment, copy the contract addresses to `.env`:

```env
NEXT_PUBLIC_USER_REGISTRY=0x...
NEXT_PUBLIC_PRODUCT_REGISTRY=0x...
NEXT_PUBLIC_SUPPLY_CHAIN=0x...
```

### Step 3: Verify on Explorer

Visit the explorer links provided after deployment:
- `https://explorer.didlab.org/address/[CONTRACT_ADDRESS]`

You'll see:
- Contract code
- Transactions
- Events
- Contract interactions

## 📋 After Deployment

1. **Register Users:**
   - Connect with Government account (deployer)
   - Register Manufacturer, Distributor, Retailer, Customer

2. **Update Frontend:**
   - Update `.env` with new contract addresses
   - Restart frontend: `npm run dev`
   - Connect MetaMask to custom network (Chain ID: 252501)

3. **Test the System:**
   - Create products
   - Test supply chain flow
   - Track products

## 🔍 Verification

After deployment, verify contracts:

```bash
# Check deployment (will need to update script for custom network)
npm run check
```

Or manually check on explorer:
- Search for contract addresses
- Verify contract code exists
- Check deployment transactions

## ⚠️ Important Notes

- **Gas Fees:** You'll pay gas fees in Trust (TT) tokens
- **Network:** Make sure MetaMask is connected to Chain ID 252501
- **Explorer:** All transactions will be visible on explorer.didlab.org
- **Private Key:** Never share your private key publicly!

---

**Ready to deploy? Run: `npm run deploy:custom`**

