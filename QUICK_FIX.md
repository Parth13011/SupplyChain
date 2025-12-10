# 🔧 Quick Fix Guide

## Issue: "You are not registered in the system"

### Solution: Use One of the Default Registered Accounts

The system has **5 pre-registered accounts**. You need to use one of these:

### Default Accounts (Auto-Registered):

1. **Government** (Account #0)
   - Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

2. **Manufacturer** (Account #1)
   - Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
   - Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

3. **Distributor** (Account #2)
   - Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
   - Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

4. **Retailer** (Account #3)
   - Address: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
   - Private Key: `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`

5. **Customer** (Account #4)
   - Address: `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`
   - Private Key: `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f4c98bc0e0c0c`

### Steps to Fix:

1. **Import Account to MetaMask:**
   - Open MetaMask
   - Click account icon → "Import Account"
   - Paste one of the private keys above
   - The account will appear in MetaMask

2. **Make Sure You're on Local Network:**
   - Network: `http://localhost:8545`
   - Chain ID: `1337`

3. **Connect to Frontend:**
   - Go to `http://localhost:3000`
   - Click "Connect MetaMask"
   - Select the imported account
   - You should now see the correct dashboard!

---

## Issue: Product Tracker Error

### Solution: Product Doesn't Exist

The error "could not decode result data" means the product ID doesn't exist.

### To Fix:

1. **First, create a product:**
   - Connect as **Manufacturer** (Account #1)
   - Use the Manufacturer Dashboard
   - Create a product
   - Note the Product ID (e.g., #1)

2. **Then track it:**
   - Use Product Tracker
   - Enter the Product ID you just created
   - It should work now!

### Test Product Available:

If you ran `npm run test:flow`, there's already a test product:
- **Product ID: 1**
- Try tracking this product ID!

---

## Quick Test Flow:

1. Import **Manufacturer** account to MetaMask
2. Connect to frontend → Should see "Manufacturer Dashboard"
3. Create a product → Get Product ID
4. Track the product → Should show product info

**OR**

1. Import any default account
2. Use Product Tracker
3. Enter Product ID: **1** (from test)
4. Should show complete history!

---

## Still Having Issues?

1. **Check Hardhat Node is Running:**
   ```bash
   npm run node
   ```

2. **Redeploy Contracts:**
   ```bash
   npm run deploy:local
   ```
   (This auto-registers all default users)

3. **Check .env File:**
   Make sure contract addresses match deployment output

4. **Restart Frontend:**
   ```bash
   npm run dev
   ```

