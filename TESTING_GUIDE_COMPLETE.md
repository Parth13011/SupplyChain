# 🧪 Complete Testing Guide - Supply Chain Flow

This guide will walk you through testing the entire supply chain system from registration to product delivery.

---

## 📋 Prerequisites

1. ✅ Contracts deployed on DIDLab network
2. ✅ Frontend running (`npm run dev`)
3. ✅ MetaMask installed and connected
4. ✅ Government account: `0xf00Be00c35e6Dd57cd8e7eeb33D17211e854AD86`

---

## 🎯 Step-by-Step Testing Flow

### Step 1: Connect as Government

1. Open http://localhost:3000
2. Click "Connect MetaMask"
3. Approve network switch (if needed)
4. **Verify**: You should see "Role: Government" and Government Dashboard

---

### Step 2: Register Test Users

You'll need **4 different MetaMask accounts** for testing:
- 1 Manufacturer
- 1 Distributor  
- 1 Retailer
- 1 Customer

#### Option A: Use MetaMask Multiple Accounts

1. In MetaMask, click account icon → "Create Account"
2. Create 4 new accounts
3. Copy their addresses

#### Option B: Use Test Addresses

If you have test addresses, use those.

#### Register Each User:

**As Government**, in the Government Dashboard:

1. **Register Manufacturer:**
   - User Address: `[Manufacturer's MetaMask address]`
   - User Name: `Test Manufacturer`
   - Role: `🏭 Manufacturer`
   - Click "Register User"
   - ✅ Wait for success message

2. **Register Distributor:**
   - User Address: `[Distributor's MetaMask address]`
   - User Name: `Test Distributor`
   - Role: `🚚 Distributor`
   - Click "Register User"
   - ✅ Wait for success message

3. **Register Retailer:**
   - User Address: `[Retailer's MetaMask address]`
   - User Name: `Test Retailer`
   - Role: `🏪 Retailer`
   - Click "Register User"
   - ✅ Wait for success message

4. **Register Customer:**
   - User Address: `[Customer's MetaMask address]`
   - User Name: `Test Customer`
   - Role: `👤 Customer`
   - Click "Register User"
   - ✅ Wait for success message

---

### Step 3: Create a Product (As Manufacturer)

1. **Switch to Manufacturer account** in MetaMask
2. Refresh the page (or it should auto-update)
3. **Verify**: You should see "Role: Manufacturer" and Manufacturer Dashboard

4. **Create Product:**
   - Product Name: `Laptop Model X`
   - Description: `High-performance gaming laptop`
   - Metadata: `SKU-12345` (optional)
   - Click "Create Product"
   - ✅ Wait for success message
   - **Note the Product ID** (e.g., #1)

5. **Verify**: Product should appear in "My Products" section

---

### Step 4: Ship to Distributor (As Manufacturer)

1. **Still as Manufacturer**, find your product in "My Products"
2. Enter **Distributor's address** in the input field
3. Click "🚚 Ship to Distributor"
4. ✅ Wait for success message
5. **Verify**: Product status should change

---

### Step 5: Receive from Manufacturer (As Distributor)

1. **Switch to Distributor account** in MetaMask
2. Refresh the page
3. **Verify**: You should see "Role: Distributor" and Distributor Dashboard
4. Find the product in "Products to Receive"
5. Click "✅ Receive from Manufacturer"
6. ✅ Wait for success message

---

### Step 6: Ship to Retailer (As Distributor)

1. **Still as Distributor**, find the product
2. Enter **Retailer's address** in the input field
3. Click "🚚 Ship to Retailer"
4. ✅ Wait for success message

---

### Step 7: Receive from Distributor (As Retailer)

1. **Switch to Retailer account** in MetaMask
2. Refresh the page
3. **Verify**: You should see "Role: Retailer" and Retailer Dashboard
4. Find the product in "Products to Receive"
5. Click "✅ Receive from Distributor"
6. ✅ Wait for success message

---

### Step 8: Sell to Customer (As Retailer)

1. **Still as Retailer**, find the product
2. Enter **Customer's address** in the input field
3. Click "💰 Sell to Customer"
4. ✅ Wait for success message

---

### Step 9: Confirm Delivery (As Customer)

1. **Switch to Customer account** in MetaMask
2. Refresh the page
3. **Verify**: You should see "Role: Customer" and Customer Dashboard
4. Find the product in "My Purchases"
5. Click "✅ Confirm Delivery"
6. ✅ Wait for success message

---

### Step 10: Test Product Tracking

#### ✅ Test 1: Manufacturer can track their product

1. **As Manufacturer**, scroll to Product Tracker
2. Enter the Product ID (e.g., `1`)
3. Click "🔍 Track Product"
4. ✅ Should show complete product history

#### ✅ Test 2: Distributor can track products they handled

1. **As Distributor**, use Product Tracker
2. Enter the same Product ID
3. Click "🔍 Track Product"
4. ✅ Should show product history (they're involved)

#### ✅ Test 3: Unauthorized user cannot track

1. **Create a new MetaMask account** (not registered)
2. Connect to the frontend
3. Try to track the product
4. ✅ Should show: "You must be a registered user to track products"

#### ✅ Test 4: Registered but not involved user cannot track

1. **As a different registered user** (e.g., another Manufacturer)
2. Try to track a product they didn't create and aren't involved in
3. ✅ Should show: "You are not authorized to track this product"

#### ✅ Test 5: Government can track any product

1. **As Government**, use Product Tracker
2. Enter any Product ID
3. Click "🔍 Track Product"
4. ✅ Should show complete history (Government has full access)

---

## 🎉 Complete Flow Summary

```
Government → Registers Users
    ↓
Manufacturer → Creates Product #1
    ↓
Manufacturer → Ships to Distributor
    ↓
Distributor → Receives from Manufacturer
    ↓
Distributor → Ships to Retailer
    ↓
Retailer → Receives from Distributor
    ↓
Retailer → Sells to Customer
    ↓
Customer → Confirms Delivery
    ↓
✅ Product Journey Complete!
```

---

## 🔍 Verification Checklist

After completing the flow, verify:

- [ ] All users registered successfully
- [ ] Product created with correct details
- [ ] Product shipped through all stages
- [ ] Each stage shows correct status
- [ ] Product Tracker shows complete history
- [ ] Authorization works (only authorized users can track)
- [ ] Unauthorized access is blocked

---

## 🐛 Troubleshooting

### "User already registered"
- User is already in the system
- Try with a different address

### "Only Manufacturer can perform this action"
- Make sure you're connected with the correct account
- Check your role in the top right

### "Product not received by distributor"
- Make sure previous step completed successfully
- Check product status in Product Tracker

### "You are not authorized to track this product"
- This is correct behavior! Only involved parties can track
- Government can always track any product

### Transaction fails
- Check you have enough ETH for gas
- Make sure you're on the correct network (Chain ID 252501)
- Verify contract addresses in `.env.local`

---

## 📝 Notes

- **Product IDs** start from 1 and increment
- Each transaction creates a new transaction ID
- Product status updates automatically after each action
- Product Tracker shows complete history with timestamps
- All actions require MetaMask transaction approval

---

## 🎯 Quick Test Script

For quick testing, you can:

1. Register 4 users (5 minutes)
2. Create 1 product (1 minute)
3. Complete full flow (5 minutes)
4. Test tracking authorization (3 minutes)

**Total time: ~15 minutes for complete test**

---

## ✅ Success Criteria

The system is working correctly if:

1. ✅ All users can be registered
2. ✅ Products can be created
3. ✅ Products flow through all stages
4. ✅ Product Tracker shows complete history
5. ✅ Only authorized users can track products
6. ✅ Unauthorized access is properly blocked

---

**Happy Testing! 🚀**


