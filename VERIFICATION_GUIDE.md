# How to Verify Contract Deployment

There are multiple ways to verify that your contracts are deployed and working on the DIDLab network.

## Method 1: Using Verification Script (Easiest)

Run the verification script:

```bash
npx hardhat run scripts/verify-deployment.js --network custom
```

Or the quick check:

```bash
npx hardhat run scripts/check-contract-on-explorer.js --network custom
```

This will:
- ✅ Check if contracts exist at the addresses
- ✅ Verify contract links (ProductRegistry → UserRegistry, etc.)
- ✅ Check if deployer is registered as Government
- ✅ Show contract state (total products, transactions, etc.)

---

## Method 2: Check on Blockchain Explorer (Visual)

Visit the DIDLab Explorer and check each contract:

### UserRegistry
**Address:** `0xCB4d0df4f7631eC70ad66D02269ef3f944404e34`
**Link:** https://explorer.didlab.org/address/0xCB4d0df4f7631eC70ad66D02269ef3f944404e34

**What to check:**
- ✅ Contract shows "Contract" label (not just "Address")
- ✅ You can see contract code
- ✅ Check "Read Contract" tab - should show `government` address
- ✅ Check "Transactions" tab - should show deployment transaction

### ProductRegistry
**Address:** `0x066669570E938881d61fD6bf3b325E382fA0F23a`
**Link:** https://explorer.didlab.org/address/0x066669570E938881d61fD6bf3b325E382fA0F23a

**What to check:**
- ✅ Contract code visible
- ✅ "Read Contract" shows `userRegistry` address
- ✅ `productCounter` should be 0 (or higher if products created)

### SupplyChain
**Address:** `0x537605c994Ec50Fb92773237Cb9d06eAD09E2dCa`
**Link:** https://explorer.didlab.org/address/0x537605c994Ec50Fb92773237Cb9d06eAD09E2dCa

**What to check:**
- ✅ Contract code visible
- ✅ "Read Contract" shows linked `userRegistry` and `productRegistry`
- ✅ `transactionCounter` should be 0 (or higher if transactions exist)

---

## Method 3: Using Hardhat Console (Interactive)

Start Hardhat console connected to custom network:

```bash
npx hardhat console --network custom
```

Then in the console, try:

```javascript
// Get contract factories
const UserRegistry = await ethers.getContractFactory("UserRegistry");
const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
const SupplyChain = await ethers.getContractFactory("SupplyChain");

// Attach to deployed addresses
const userRegistry = UserRegistry.attach("0xCB4d0df4f7631eC70ad66D02269ef3f944404e34");
const productRegistry = ProductRegistry.attach("0x066669570E938881d61fD6bf3b325E382fA0F23a");
const supplyChain = SupplyChain.attach("0x537605c994Ec50Fb92773237Cb9d06eAD09E2dCa");

// Check UserRegistry
const gov = await userRegistry.government();
console.log("Government:", gov);

// Check ProductRegistry
const totalProducts = await productRegistry.getTotalProducts();
console.log("Total Products:", totalProducts.toString());

// Check SupplyChain
const totalTx = await supplyChain.getTotalTransactions();
console.log("Total Transactions:", totalTx.toString());

// Check if deployer is registered
const [deployer] = await ethers.getSigners();
const isRegistered = await userRegistry.isUserRegistered(deployer.address);
console.log("Deployer registered:", isRegistered);
```

---

## Method 4: Check Contract Code on Explorer

1. Go to any contract address on explorer
2. Click on "Contract" tab
3. You should see:
   - ✅ Contract source code (if verified)
   - ✅ Or bytecode (if not verified, but still proves contract exists)
   - ✅ Contract creation transaction

---

## Method 5: Try Calling a Read Function

Use any tool that can call contract functions:

### Using Hardhat Script:

```javascript
// In a script file
const userRegistry = await ethers.getContractAt(
  "UserRegistry",
  "0xCB4d0df4f7631eC70ad66D02269ef3f944404e34"
);

// Try reading
const gov = await userRegistry.government();
console.log("Government address:", gov);
```

### Using MetaMask + Frontend:

1. Connect MetaMask to Chain ID 252501
2. In your frontend, try to read contract state
3. If it works, contracts are deployed!

---

## Method 6: Check Deployment Transaction

Each contract has a deployment transaction. Check them:

1. **UserRegistry Deployment:**
   - TX: `0x99c94f49de8dcea7490fce205c584431943c14805a5e0790c48868ac5d3ffbf6`
   - Link: https://explorer.didlab.org/tx/0x99c94f49de8dcea7490fce205c584431943c14805a5e0790c48868ac5d3ffbf6

2. **ProductRegistry Deployment:**
   - TX: `0xfad4f596ed7230a42c9c0dae7afad614b05c791a75151578ab1faa8b15f05d02`
   - Link: https://explorer.didlab.org/tx/0xfad4f596ed7230a42c9c0dae7afad614b05c791a75151578ab1faa8b15f05d02

3. **SupplyChain Deployment:**
   - TX: `0x651bdc7cce9586fb4a263ee1dd3fd4e596e2179c04476fa87a343cc2e5f15f29`
   - Link: https://explorer.didlab.org/tx/0x651bdc7cce9586fb4a263ee1dd3fd4e596e2179c04476fa87a343cc2e5f15f29

If these transactions show "Success" status, contracts are deployed!

---

## Quick Verification Checklist

- [ ] Run verification script - all checks pass
- [ ] Explorer shows contracts (not just addresses)
- [ ] Can read contract state (government, counters, etc.)
- [ ] Deployment transactions show "Success"
- [ ] Contracts are linked correctly (ProductRegistry → UserRegistry)
- [ ] Deployer is registered as Government

---

## What If Verification Fails?

If verification fails, check:

1. **Network connection:** Are you connected to the right network?
   ```bash
   # Check network config
   npx hardhat run scripts/check-network.js --network custom
   ```

2. **Contract addresses:** Are addresses correct in scripts?

3. **RPC endpoint:** Is `https://eth.didlab.org` accessible?

4. **Gas/balance:** Does deployer account have enough balance?

---

## Expected Results

When everything is working, you should see:

✅ **UserRegistry:**
- Government: `0xf00Be00c35e6Dd57cd8e7eeb33D17211e854AD86`
- Deployer registered: `true`

✅ **ProductRegistry:**
- Total Products: `0` (or higher)
- Linked UserRegistry: `0xCB4d0df4f7631eC70ad66D02269ef3f944404e34`

✅ **SupplyChain:**
- Total Transactions: `0` (or higher)
- Linked UserRegistry: `0xCB4d0df4f7631eC70ad66D02269ef3f944404e34`
- Linked ProductRegistry: `0x066669570E938881d61fD6bf3b325E382fA0F23a`

---

## Summary

**Easiest way:** Run the verification script
```bash
npx hardhat run scripts/verify-deployment.js --network custom
```

**Visual way:** Check on explorer
- Visit contract addresses on https://explorer.didlab.org
- Look for "Contract" label and readable state

**Interactive way:** Use Hardhat console
- Connect and try calling contract functions

All methods should confirm your contracts are deployed and working! 🎉



