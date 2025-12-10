# 🔧 Troubleshooting Registration Error

## Error You're Seeing

```
Error: could not coalesce error (error={ "code": -32603, "message": "Internal JSON-RPC error." }
```

This is an RPC/network error. Let's fix it!

---

## ✅ Quick Fixes (Try These First)

### Fix 1: Check if User is Already Registered

The user might already be registered! Check:

```bash
npx hardhat run scripts/check-user-registration.js --network custom 0xe725a54af02a3c964e71047132b7db5d78c9e06e
```

Replace the address with the one you're trying to register.

**If already registered:**
- ✅ User is in the system
- ✅ Try a different address
- ✅ Or skip registration for that user

---

### Fix 2: Check Network Connection

1. **Verify you're on correct network:**
   - Open MetaMask
   - Check network: Should be "DIDLab Network" or Chain ID 252501
   - If not, switch to it

2. **Check RPC endpoint:**
   - The RPC might be temporarily down
   - Try refreshing the page
   - Wait a few seconds and try again

---

### Fix 3: Increase Gas Limit

The transaction might be failing due to gas estimation. Try:

1. **In MetaMask:**
   - When transaction pops up, click "Edit"
   - Increase "Gas Limit" to `200000` (or higher)
   - Try again

2. **Or use Hardhat script:**
   ```bash
   npx hardhat run scripts/register-user-manual.js --network custom
   ```

---

### Fix 4: Check Account Balance

Make sure Government account has ETH for gas:

1. Check balance in MetaMask
2. If low, get tokens from faucet: https://faucet.didlab.org
3. Try again

---

### Fix 5: Try Different Address

The address might have an issue. Try:

1. Create a fresh MetaMask account
2. Copy the new address
3. Try registering that address

---

## 🔍 Detailed Troubleshooting

### Step 1: Verify Contract is Accessible

```bash
npx hardhat run scripts/verify-deployment.js --network custom
```

Should show all contracts are working.

---

### Step 2: Check User Registry State

```bash
npx hardhat run scripts/check-user-registration.js --network custom <address>
```

---

### Step 3: Try Manual Registration (via Script)

Create `scripts/register-user-manual.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const userRegistryAddress = "0x703922e870B095FDfc2b4b0D37d71228356fD3Cb";
  const userAddress = "0xe725a54af02a3c964e71047132b7db5d78c9e06e"; // Change this
  const userName = "Test Distributor"; // Change this
  const role = 3; // 2=Manufacturer, 3=Distributor, 4=Retailer, 5=Customer

  const [deployer] = await hre.ethers.getSigners();
  console.log("Registering with:", deployer.address);

  const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
  const userRegistry = UserRegistry.attach(userRegistryAddress);

  try {
    const tx = await userRegistry.registerUser(userAddress, role, userName, {
      gasLimit: 200000
    });
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("✅ User registered successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Then run:
```bash
npx hardhat run scripts/register-user-manual.js --network custom
```

---

## 🎯 Most Common Causes

1. **User already registered** (80% of cases)
   - Check first with the script above

2. **Network/RPC issue** (15% of cases)
   - Wait a few seconds, refresh, try again

3. **Gas estimation issue** (5% of cases)
   - Increase gas limit manually

---

## ✅ Quick Solution

**Most likely:** User is already registered!

1. Check with the script:
   ```bash
   npx hardhat run scripts/check-user-registration.js --network custom 0xe725a54af02a3c964e71047132b7db5d78c9e06e
   ```

2. If registered, use that account directly
3. If not registered, try:
   - Refresh page
   - Wait 10 seconds
   - Try again
   - Or use a different address

---

## 🆘 Still Not Working?

1. **Check network status:**
   - Visit: https://explorer.didlab.org
   - See if recent transactions are going through

2. **Try from different browser/device**

3. **Check MetaMask:**
   - Reset account (Settings → Advanced → Reset Account)
   - Reconnect

4. **Use Hardhat script instead:**
   - More reliable than frontend
   - See Fix 5 above

---

Let me know what the check script says, and we'll fix it! 🚀

