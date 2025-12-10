# Frontend Setup Guide

## Quick Setup

### 1. Create `.env.local` file

Create a file named `.env.local` in the root directory with:

```env
# Contract Addresses (Deployed on DIDLab Network - Chain ID 252501)
NEXT_PUBLIC_USER_REGISTRY=0x703922e870B095FDfc2b4b0D37d71228356fD3Cb
NEXT_PUBLIC_PRODUCT_REGISTRY=0x5F7DBD43a77407adA1f3DBD2803d3B21E8Bc0531
NEXT_PUBLIC_SUPPLY_CHAIN=0x64e3fDBd9621C1Dd2DeC6C88Fb7d5B1a62Bc91e0

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=252501
NEXT_PUBLIC_RPC_URL=https://eth.didlab.org
NEXT_PUBLIC_EXPLORER_URL=https://explorer.didlab.org
```

### 2. Install Dependencies (if not done)

```bash
npm install
```

### 3. Compile Contracts (if not done)

```bash
npm run compile
```

### 4. Run the Frontend

```bash
npm run dev
```

Then open: http://localhost:3000

---

## How It Works

1. **Connect MetaMask**: Click "Connect MetaMask" button
   - The app will automatically add/switch to DIDLab network (Chain ID 252501)
   - MetaMask will prompt you to approve

2. **Check Your Role**: 
   - If you're the Government account (deployer), you'll see Government dashboard
   - If not registered, you'll see a message to contact Government

3. **Use the System**:
   - Government: Register users (Manufacturer, Distributor, Retailer, Customer)
   - Manufacturer: Create products
   - Distributor: Receive and ship products
   - Retailer: Receive and sell products
   - Customer: Confirm delivery

---

## Network Details

- **Network Name**: DIDLab Network
- **RPC URL**: https://eth.didlab.org
- **Chain ID**: 252501
- **Explorer**: https://explorer.didlab.org

The frontend will automatically add this network to MetaMask if it's not already added.

---

## Troubleshooting

### "MetaMask is not installed"
- Install MetaMask browser extension
- Refresh the page

### "Failed to add network"
- Manually add network in MetaMask:
  - Network Name: DIDLab Network
  - RPC URL: https://eth.didlab.org
  - Chain ID: 252501
  - Currency Symbol: ETH
  - Block Explorer: https://explorer.didlab.org

### "Contract addresses not configured"
- Make sure `.env.local` file exists
- Check that contract addresses are correct
- Restart the dev server: `npm run dev`

### "User not registered"
- Connect with the Government account (deployer): `0xf00Be00c35e6Dd57cd8e7eeb33D17211e854AD86`
- Or ask Government to register your account

---

## Contract Addresses

- **UserRegistry**: `0x703922e870B095FDfc2b4b0D37d71228356fD3Cb`
- **ProductRegistry**: `0x5F7DBD43a77407adA1f3DBD2803d3B21E8Bc0531`
- **SupplyChain**: `0x64e3fDBd9621C1Dd2DeC6C88Fb7d5B1a62Bc91e0`

---

## Ready to Use!

Once setup is complete, the frontend will:
- ✅ Automatically connect to DIDLab network
- ✅ Show your role and dashboard
- ✅ Allow you to interact with contracts
- ✅ Track products through the supply chain

Enjoy! 🚀


