# 🔧 Fix: Contract Decode Error

## Error Explanation

The error `could not decode result data (value="0x")` means:
- The contract call returned empty data
- This usually means the contract doesn't exist at that address
- OR the frontend hasn't picked up the new .env variables

## Quick Fix Steps

### Step 1: Verify Hardhat Node is Running

```bash
# Check if node is running
# You should see a terminal with "Started HTTP and WebSocket JSON-RPC server"
```

If not running:
```bash
npm run node
```

### Step 2: Verify Contracts are Deployed

```bash
npm run deploy:local
```

**Copy the output addresses** - they should match your .env file!

### Step 3: Restart Next.js Frontend

**IMPORTANT:** Next.js caches environment variables. You MUST restart:

1. **Stop the frontend** (Ctrl+C in the terminal running `npm run dev`)
2. **Restart it:**
   ```bash
   npm run dev
   ```

### Step 4: Verify .env File

Your `.env` should have:
```env
NEXT_PUBLIC_USER_REGISTRY=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_PRODUCT_REGISTRY=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
NEXT_PUBLIC_SUPPLY_CHAIN=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
```

**Note:** These addresses are from the latest deployment. If you redeployed, update them!

### Step 5: Clear Browser Cache

1. Open browser DevTools (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"
3. Or use Ctrl+Shift+R (hard refresh)

### Step 6: Check Browser Console

After restarting, check the browser console. You should see:
- ✅ Contract addresses logged (if configured)
- ❌ Error messages if addresses are missing

## Common Issues

### Issue: "Contract addresses not configured"

**Solution:** 
1. Check `.env` file exists in root directory
2. Verify addresses start with `0x`
3. Restart Next.js dev server

### Issue: "Contract not found at address"

**Solution:**
1. Make sure Hardhat node is running
2. Redeploy contracts: `npm run deploy:local`
3. Update .env with new addresses
4. Restart Next.js

### Issue: Still getting errors after restart

**Solution:**
1. Stop all processes (Hardhat node, Next.js)
2. Start Hardhat node: `npm run node`
3. Wait 5 seconds
4. Deploy: `npm run deploy:local`
5. Update .env
6. Start Next.js: `npm run dev`
7. Hard refresh browser (Ctrl+Shift+R)

## Verification

After fixing, you should see:
- ✅ No errors in browser console
- ✅ Connected account shows correct role (or "None" if not registered)
- ✅ Can create products (as Manufacturer)
- ✅ Can track products

## Still Not Working?

Run this verification script:

```bash
# Check if contracts exist
npx hardhat run --network localhost -c "
const { ethers } = require('hardhat');
const userRegistry = await ethers.getContractAt('UserRegistry', '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9');
console.log('Contract exists:', await userRegistry.getAddress());
"
```

If this fails, the contract doesn't exist at that address - redeploy!

