# 🚀 START HERE - Quick Setup Guide

## ✅ Current Status

**Contracts Deployed Successfully!**

- ✅ Hardhat node is running
- ✅ Contracts deployed to new addresses
- ✅ Default users registered
- ⚠️ **You need to restart Next.js frontend** to pick up new addresses

## 🔄 Next Steps (REQUIRED)

### Step 1: Restart Next.js Frontend

**IMPORTANT:** Next.js caches environment variables. You MUST restart:

1. **Stop the frontend** (Ctrl+C in terminal running `npm run dev`)
2. **Restart it:**
   ```bash
   npm run dev
   ```

### Step 2: Hard Refresh Browser

After restarting Next.js:
- Press **Ctrl+Shift+R** (or Cmd+Shift+R on Mac)
- Or: DevTools (F12) → Right-click refresh → "Empty Cache and Hard Reload"

### Step 3: Connect with Registered Account

Use one of these **pre-registered accounts**:

**Manufacturer (Recommended):**
- Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

**Government:**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

**Import to MetaMask:**
1. MetaMask → Account icon → "Import Account"
2. Paste private key
3. Connect to network: `http://localhost:8545` (Chain ID: 1337)

## 📋 Current Contract Addresses

```
UserRegistry:    0x610178dA211FEF7D417bC0e6FeD39F05609AD788
ProductRegistry: 0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e
SupplyChain:     0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0
```

These are already in your `.env` file!

## ✅ Verification

After restarting, you should see:
- ✅ No errors in browser console
- ✅ Connected account shows correct role
- ✅ Can create products (as Manufacturer)
- ✅ Can track products

## 🧪 Quick Test

1. Connect as **Manufacturer**
2. Create a product → Get Product ID
3. Use **Product Tracker** → Enter Product ID
4. Should show product info!

## 🐛 If Still Having Issues

1. **Check Hardhat node is running:**
   ```bash
   npm run verify
   ```
   Should show ✅ for all contracts

2. **Redeploy if needed:**
   ```bash
   npm run deploy:local
   ```
   (Update .env with new addresses)

3. **Restart everything:**
   - Stop Hardhat node
   - Stop Next.js
   - Start Hardhat node: `npm run node`
   - Wait 5 seconds
   - Deploy: `npm run deploy:local`
   - Update .env
   - Start Next.js: `npm run dev`

---

**The main issue was: Hardhat node wasn't running + old contract addresses!**

Now it's fixed - just restart Next.js and refresh browser! 🎉


