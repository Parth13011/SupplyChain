# 🔧 Fix Registration Error - Quick Solutions

## ✅ Solution 1: Use Manual Registration Script (Recommended)

The frontend might have RPC issues. Use the script instead:

```bash
# Register a Distributor
USER_ADDRESS=0xe725a54af02a3c964e71047132b7db5d78c9e06e USER_NAME="Test Distributor" USER_ROLE=3 npx hardhat run scripts/register-user-manual.js --network custom
```

**For different roles:**
- Manufacturer: `USER_ROLE=2`
- Distributor: `USER_ROLE=3`
- Retailer: `USER_ROLE=4`
- Customer: `USER_ROLE=5`

**Example - Register all 4 users:**

```bash
# Manufacturer
USER_ADDRESS=0x[MANUFACTURER_ADDRESS] USER_NAME="Test Manufacturer" USER_ROLE=2 npx hardhat run scripts/register-user-manual.js --network custom

# Distributor
USER_ADDRESS=0x[DISTRIBUTOR_ADDRESS] USER_NAME="Test Distributor" USER_ROLE=3 npx hardhat run scripts/register-user-manual.js --network custom

# Retailer
USER_ADDRESS=0x[RETAILER_ADDRESS] USER_NAME="Test Retailer" USER_ROLE=4 npx hardhat run scripts/register-user-manual.js --network custom

# Customer
USER_ADDRESS=0x[CUSTOMER_ADDRESS] USER_NAME="Test Customer" USER_ROLE=5 npx hardhat run scripts/register-user-manual.js --network custom
```

---

## ✅ Solution 2: Fix Frontend Registration

### Option A: Increase Gas Limit in MetaMask

1. When transaction pops up in MetaMask
2. Click "Edit" (or "Advanced")
3. Change "Gas Limit" to `200000`
4. Click "Save" and confirm

### Option B: Refresh and Retry

1. Refresh the page
2. Wait 10 seconds
3. Try registration again
4. Sometimes RPC needs a moment

### Option C: Check Network

1. Make sure you're on **Chain ID 252501** (DIDLab Network)
2. If not, the frontend should auto-switch
3. If it doesn't, manually switch in MetaMask

---

## ✅ Solution 3: Check if Already Registered

Before trying to register, check:

```bash
USER_ADDRESS=0xe725a54af02a3c964e71047132b7db5d78c9e06e npx hardhat run scripts/check-user-registration.js --network custom
```

If already registered, you can skip registration!

---

## 🎯 Recommended Approach

**Use the manual script** - it's more reliable:

1. Get 4 MetaMask addresses
2. Run the script 4 times (once for each role)
3. Then continue with frontend for the rest

**Example:**

```bash
# Step 1: Register Manufacturer
USER_ADDRESS=0xABC... USER_NAME="Manufacturer" USER_ROLE=2 npx hardhat run scripts/register-user-manual.js --network custom

# Step 2: Register Distributor  
USER_ADDRESS=0xDEF... USER_NAME="Distributor" USER_ROLE=3 npx hardhat run scripts/register-user-manual.js --network custom

# Step 3: Register Retailer
USER_ADDRESS=0xGHI... USER_NAME="Retailer" USER_ROLE=4 npx hardhat run scripts/register-user-manual.js --network custom

# Step 4: Register Customer
USER_ADDRESS=0xJKL... USER_NAME="Customer" USER_ROLE=5 npx hardhat run scripts/register-user-manual.js --network custom
```

Then switch to frontend for:
- Creating products
- Shipping products
- Tracking products

---

## 🐛 Why This Error Happens

The error `Internal JSON-RPC error` usually means:

1. **RPC endpoint temporarily busy** - Wait and retry
2. **Gas estimation issue** - Use manual gas limit
3. **Network congestion** - Use script instead (more reliable)

**The script works better** because it:
- Uses explicit gas settings
- Has better error handling
- Retries automatically
- Shows detailed progress

---

## ✅ Quick Fix Right Now

**Just run this:**

```bash
USER_ADDRESS=0xe725a54af02a3c964e71047132b7db5d78c9e06e USER_NAME="Test Distributor" USER_ROLE=3 npx hardhat run scripts/register-user-manual.js --network custom
```

This will register that user. Then continue with frontend for the rest!

---

**Try the script first - it's the most reliable way!** 🚀

