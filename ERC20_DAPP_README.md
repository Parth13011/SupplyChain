# ERC-20 Token DApp

This is a standalone ERC-20 token DApp based on your professor's example, adapted for your supply chain project.

## 🎯 What's Included

1. **SimpleToken.sol** - A simple ERC-20 token contract
2. **deploy-token.js** - Deployment script for the token
3. **erc20-dapp.html** - Standalone HTML DApp (no build step, uses ESM CDN imports)

## ✅ Deployment Status

**Token Deployed Successfully!**

- **Token Address:** `0x17C21838Eb3b1577710B051c1092047caa65dE77`
- **Network:** Custom Network (didlab.org)
- **Chain ID:** 252501
- **Token Name:** SupplyChain Token
- **Symbol:** SCT
- **Decimals:** 18
- **Total Supply:** 1,000,000 SCT
- **Explorer:** https://explorer.didlab.org/address/0x17C21838Eb3b1577710B051c1092047caa65dE77

## 🚀 How to Use the DApp

### Option 1: Serve Locally (Recommended)

```bash
# Python 3
python3 -m http.server 8000

# Or Node.js
npx http-server -p 8000
```

Then open: **http://localhost:8000/erc20-dapp.html**

### Option 2: Open Directly

If your browser allows file:// module imports, you can open `erc20-dapp.html` directly.

## 📝 Usage Instructions

1. **Connect & Switch Network**
   - Click "1) Connect & Switch Network"
   - Approve MetaMask connection
   - Approve network switch/add if prompted

2. **Load Token**
   - Paste the token address: `0x17C21838Eb3b1577710B051c1092047caa65dE77`
   - Click "2) Load Token"
   - You'll see token name, symbol, decimals, and your balance

3. **Transfer Tokens**
   - Enter recipient address (0x...)
   - Enter amount in human units (e.g., 12.34)
   - Click "Send"
   - Approve transaction in MetaMask

4. **Add to MetaMask**
   - Click "Add Token to MetaMask" to see balance in your wallet

5. **Refresh Balance**
   - Click "Refresh Balance" to update your token balance

## 🔄 Deploy Your Own Token

If you want to deploy a new token:

```bash
# Deploy to custom network
npx hardhat run scripts/deploy-token.js --network custom

# Deploy to localhost (for testing)
npx hardhat run scripts/deploy-token.js --network localhost
```

After deployment, copy the token address and paste it into the DApp.

## 🌐 Network Configuration

The DApp supports two networks:

1. **Custom Network (didlab.org)**
   - RPC: https://eth.didlab.org
   - Chain ID: 252501
   - Explorer: https://explorer.didlab.org

2. **Localhost (Hardhat)**
   - RPC: http://127.0.0.1:8545
   - Chain ID: 1337
   - For local testing

## 🛠️ Troubleshooting

- **Nothing happens on connect** → Make sure MetaMask is installed and you're not in a private window
- **Wrong network** → Approve the network add/switch prompt in MetaMask
- **Returned no data (0x)** → Token address is wrong or contract doesn't exist on the selected network
- **Insufficient funds** → You don't have token balance; the deployer has all 1M tokens initially

## 📦 Token Contract Details

The `SimpleToken` contract implements standard ERC-20 functions:
- `transfer(address to, uint256 amount)` - Transfer tokens
- `balanceOf(address account)` - Check balance
- `name()` - Token name
- `symbol()` - Token symbol
- `decimals()` - Token decimals
- `totalSupply()` - Total supply

## 💡 Tips

- Values persist in localStorage (token address, network selection)
- The DApp automatically watches for Transfer events and refreshes balance
- You can use the same flow for any ERC-20 token on the network



