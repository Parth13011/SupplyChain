# 🧪 Complete Testing Guide

## ✅ Quick Test - Verify Everything Works

### Step 1: Run the Full Flow Test

```bash
npm run test:flow
```

This will automatically test the complete supply chain flow:
- ✅ Check user registrations
- ✅ Create a product
- ✅ Ship from Manufacturer → Distributor
- ✅ Receive by Distributor
- ✅ Ship from Distributor → Retailer
- ✅ Receive by Retailer
- ✅ Sell to Customer
- ✅ Confirm delivery
- ✅ Verify final status
- ✅ Show transaction history

**Expected Output:** All steps should show ✅ (green checkmarks)

---

## 🎯 Manual Testing via Frontend

### Prerequisites

1. **Hardhat Node Running:**
   ```bash
   npm run node
   ```
   Keep this terminal open!

2. **Contracts Deployed:**
   ```bash
   npm run deploy:local
   ```
   This automatically registers default users.

3. **Frontend Running:**
   ```bash
   npm run dev
   ```

4. **MetaMask Setup:**
   - Add network: `http://localhost:8545` (Chain ID: 1337)
   - Import test accounts (private keys shown when you run `npm run node`)

---

## 📋 Default Test Accounts

When you run `npm run node`, you'll see accounts like:

```
Account #0: 0x... (Government - 10000 ETH)
Account #1: 0x... (Manufacturer - 10000 ETH)
Account #2: 0x... (Distributor - 10000 ETH)
Account #3: 0x... (Retailer - 10000 ETH)
Account #4: 0x... (Customer - 10000 ETH)
```

**These are automatically registered** when you run `npm run deploy:local`!

---

## 🔄 Complete Manual Test Flow

### Test 1: Government Dashboard ✅

1. Connect with **Account #0** (Government)
2. You should see: "Government Dashboard"
3. ✅ **PASS** if you see the registration form

### Test 2: Create Product ✅

1. Switch to **Account #1** (Manufacturer) in MetaMask
2. Refresh the page
3. You should see: "Manufacturer Dashboard"
4. Fill in:
   - Product Name: "Test Laptop"
   - Description: "High-performance laptop"
   - Metadata: (optional)
5. Click "Create Product"
6. ✅ **PASS** if product appears in "My Products" list
7. **Note the Product ID** (e.g., #1)

### Test 3: Ship to Distributor ✅

1. Still as Manufacturer
2. In the product card, enter Distributor address: **Account #2 address**
3. Click "Ship to Distributor"
4. ✅ **PASS** if you see success message

### Test 4: Receive by Distributor ✅

1. Switch to **Account #2** (Distributor) in MetaMask
2. Refresh the page
3. You should see: "Distributor Dashboard"
4. Enter the Product ID from Test 2
5. Click "Receive Product"
6. ✅ **PASS** if you see success message

### Test 5: Ship to Retailer ✅

1. Still as Distributor
2. Enter:
   - Product ID: (same as before)
   - Retailer Address: **Account #3 address**
3. Click "Ship to Retailer"
4. ✅ **PASS** if you see success message

### Test 6: Receive by Retailer ✅

1. Switch to **Account #3** (Retailer) in MetaMask
2. Refresh the page
3. Enter the Product ID
4. Click "Receive Product"
5. ✅ **PASS** if you see success message

### Test 7: Sell to Customer ✅

1. Still as Retailer
2. Enter:
   - Product ID: (same as before)
   - Customer Address: **Account #4 address**
3. Click "Sell to Customer"
4. ✅ **PASS** if you see success message

### Test 8: Confirm Delivery ✅

1. Switch to **Account #4** (Customer) in MetaMask
2. Refresh the page
3. Enter the Product ID
4. Click "Confirm Delivery"
5. ✅ **PASS** if you see success message

### Test 9: Product Tracker ✅

1. Use **any account** (or stay as Customer)
2. Scroll to "Product Tracker" section
3. Enter the Product ID
4. Click "Track Product"
5. ✅ **PASS** if you see:
   - Product information
   - Visual supply chain flow diagram
   - Complete transaction history (6 transactions)
   - Final status: "Delivered to Customer"

---

## 🎨 Visual Verification Checklist

### Frontend Visual Elements to Check:

- [ ] Connection status card shows your address and role
- [ ] Role-specific dashboard appears based on your account
- [ ] Product cards show with icons and styling
- [ ] Supply chain flow diagram shows progress
- [ ] Transaction history shows with color coding
- [ ] Status badges are color-coded
- [ ] Success/error messages appear correctly
- [ ] Buttons have hover effects
- [ ] Forms are properly styled

---

## 🐛 Troubleshooting

### Issue: "User not registered"
**Solution:** Run `npm run deploy:local` again (it auto-registers users)

### Issue: "Cannot connect to network"
**Solution:** Make sure Hardhat node is running (`npm run node`)

### Issue: "Transaction failed"
**Solution:** 
- Check you're using the correct account for the role
- Make sure previous step was completed
- Check product status matches expected state

### Issue: "Contract not found"
**Solution:** 
- Verify contract addresses in `.env` match deployment output
- Re-deploy contracts: `npm run deploy:local`

### Issue: MetaMask not connecting
**Solution:**
- Make sure you're on the correct network (localhost:8545)
- Refresh the page
- Check MetaMask is unlocked

---

## 📊 Expected Results

After completing the full flow, you should have:

1. **1 Product** created
2. **6 Transactions** in history:
   - Created
   - Shipped to Distributor
   - Received by Distributor
   - Shipped to Retailer
   - Received by Retailer
   - Sold to Customer
   - Delivered to Customer

3. **Final Status:** "Delivered to Customer"

4. **All addresses visible** in transaction history

---

## 🚀 Quick Test Commands

```bash
# 1. Start everything
npm run node              # Terminal 1
npm run deploy:local      # Terminal 2 (after node starts)
npm run dev               # Terminal 3

# 2. Run automated test
npm run test:flow         # Terminal 4 (tests everything)

# 3. Manual testing
# Open http://localhost:3000
# Follow the manual test flow above
```

---

## ✅ Success Criteria

Your system is **fully functional** if:

- ✅ Automated test passes all steps
- ✅ You can create products as Manufacturer
- ✅ You can ship/receive products at each stage
- ✅ Product Tracker shows complete history
- ✅ Visual flow diagram updates correctly
- ✅ All transactions are visible and verifiable
- ✅ Final status shows "Delivered to Customer"

**If all these pass, your blockchain supply chain system is working perfectly!** 🎉

