# 🧪 Frontend Testing Guide - Complete Flow

## 📋 Flow Overview

1. ✅ **Government registers users** (Already Done!)
2. 🏭 **Manufacturer creates product** → Gets unique Product ID
3. 📱 **Product ID = QR Code** (This ID can be converted to QR code)
4. 🚚 **Product moves through supply chain** → History updates automatically

---

## 🎯 Step-by-Step Frontend Testing

### **Step 1: Connect as Manufacturer**

1. Open http://localhost:3000
2. In MetaMask, switch to **Manufacturer account**: `0x260117ad7eb22f48479ebceca06521a728961112`
3. Click "Connect MetaMask" (or refresh if already connected)
4. **Verify**: You should see:
   - "Role: Manufacturer" in top right
   - Manufacturer Dashboard appears
   - "Create New Product" section visible

---

### **Step 2: Create Product (Mint Product ID)**

1. **In Manufacturer Dashboard**, scroll to "Create New Product"
2. Fill in the form:
   - **Product Name**: `Laptop Model X`
   - **Description**: `High-performance gaming laptop with RTX 4090`
   - **Metadata**: `SKU-12345, Batch-001` (optional - can be QR code data)
3. Click **"Create Product"** button
4. **Approve transaction** in MetaMask
5. **Wait for success message**: "Product created successfully!"
6. **📝 IMPORTANT: Note the Product ID** (e.g., #1, #2, etc.)
   - This ID appears in "My Products" section
   - **This is your QR Code ID!**

**What Happens:**
- ✅ Unique Product ID is generated (e.g., Product #1)
- ✅ Product is registered on blockchain
- ✅ Product appears in "My Products" list
- ✅ This ID can be converted to QR code for physical product

---

### **Step 3: Ship to Distributor**

1. **Still as Manufacturer**, find your product in "My Products" section
2. You'll see the product card with:
   - Product ID (e.g., #1)
   - Product name
   - Description
   - Input field for "Distributor address"
3. **Enter Distributor address**: `0xe725a54af02a3c964e71047132b7db5d78c9e06e`
4. Click **"🚚 Ship to Distributor"** button
5. **Approve transaction** in MetaMask
6. **Wait for success**: "Product shipped to distributor successfully!"

**What Happens:**
- ✅ Product status changes to "Shipped to Distributor"
- ✅ Transaction recorded on blockchain
- ✅ Product history updated

---

### **Step 4: Switch to Distributor & Receive**

1. **In MetaMask**, switch to **Distributor account**: `0xe725a54af02a3c964e71047132b7db5d78c9e06e`
2. **Refresh the page** (or it auto-updates)
3. **Verify**: You see "Role: Distributor" and Distributor Dashboard
4. **In Distributor Dashboard**, find "Receive from Manufacturer" section
5. **Enter Product ID**: `1` (the ID from Step 2)
6. Click **"✅ Receive Product"** button
7. **Approve transaction** in MetaMask
8. **Wait for success**: "Product received successfully!"

**What Happens:**
- ✅ Product status changes to "Received by Distributor"
- ✅ New transaction added to product history
- ✅ Product can now be shipped to Retailer

---

### **Step 5: Ship to Retailer**

1. **Still as Distributor**, find "Ship to Retailer" section
2. **Enter Product ID**: `1`
3. **Enter Retailer address**: `0xcf871f98d2a1e1b58ca7e70d2723656c4c32f77f`
4. Click **"🚚 Ship to Retailer"** button
5. **Approve transaction** in MetaMask
6. **Wait for success**: "Product shipped to retailer successfully!"

---

### **Step 6: Switch to Retailer & Receive**

1. **In MetaMask**, switch to **Retailer account**: `0xcf871f98d2a1e1b58ca7e70d2723656c4c32f77f`
2. **Refresh the page**
3. **Verify**: You see "Role: Retailer" and Retailer Dashboard
4. **In Retailer Dashboard**, find "Receive from Distributor" section
5. **Enter Product ID**: `1`
6. Click **"✅ Receive Product"** button
7. **Approve transaction** in MetaMask
8. **Wait for success**: "Product received successfully!"

---

### **Step 7: Sell to Customer**

1. **Still as Retailer**, find "Sell to Customer" section
2. **Enter Product ID**: `1`
3. **Enter Customer address**: `0xfc4ad06b86361c4b312164e2385cfd588fda5594`
4. Click **"💰 Sell to Customer"** button
5. **Approve transaction** in MetaMask
6. **Wait for success**: "Product sold to customer successfully!"

---

### **Step 8: Switch to Customer & Confirm Delivery**

1. **In MetaMask**, switch to **Customer account**: `0xfc4ad06b86361c4b312164e2385cfd588fda5594`
2. **Refresh the page**
3. **Verify**: You see "Role: Customer" and Customer Dashboard
4. **In Customer Dashboard**, find "Confirm Product Delivery" section
5. **Enter Product ID**: `1`
6. Click **"✅ Confirm Delivery"** button
7. **Approve transaction** in MetaMask
8. **Wait for success**: "Delivery confirmed successfully!"

**What Happens:**
- ✅ Product status changes to "Delivered to Customer"
- ✅ Complete supply chain journey recorded
- ✅ Product history is complete!

---

### **Step 9: Test Product Tracking (QR Code Simulation)**

The **Product ID** (e.g., #1) is what would be in the QR code. Let's test tracking:

#### **Test 1: Manufacturer Tracks Their Product**

1. **Switch to Manufacturer** account
2. Scroll down to **"Product Tracker"** section
3. **Enter Product ID**: `1`
4. Click **"🔍 Track Product"** button
5. **See Results**:
   - ✅ Complete product information
   - ✅ Full transaction history
   - ✅ Current status
   - ✅ All timestamps
   - ✅ All parties involved (from → to)

#### **Test 2: Distributor Tracks Product**

1. **Switch to Distributor** account
2. Go to **Product Tracker**
3. **Enter Product ID**: `1`
4. Click **"Track Product"**
5. **See Results**: Complete history (they're involved)

#### **Test 3: Customer Tracks Product**

1. **Switch to Customer** account
2. Go to **Product Tracker**
3. **Enter Product ID**: `1`
4. Click **"Track Product"**
5. **See Results**: Complete history (they purchased it)

#### **Test 4: Unauthorized User Blocked**

1. **Create new MetaMask account** (not registered)
2. Connect to frontend
3. Try to track Product #1
4. **See Result**: ❌ "You must be a registered user to track products"

---

## 📱 QR Code Concept

**How it works in real world:**

1. **Product ID is generated** (e.g., #1) when manufacturer creates product
2. **Convert ID to QR code**: 
   - QR code contains: `Product ID: 1` or `https://yoursite.com/track/1`
   - Print QR code on product label
3. **Scan QR code** → Get Product ID → Enter in Product Tracker → See full history!

**Example QR Code Data:**
```
Product ID: 1
Track at: https://yoursite.com/track/1
```

---

## ✅ Complete Flow Checklist

- [ ] Government registered all users ✅ (Already Done!)
- [ ] Manufacturer created product → Got Product ID
- [ ] Manufacturer shipped to Distributor
- [ ] Distributor received product
- [ ] Distributor shipped to Retailer
- [ ] Retailer received product
- [ ] Retailer sold to Customer
- [ ] Customer confirmed delivery
- [ ] Product Tracker shows complete history
- [ ] Unauthorized access is blocked

---

## 🎯 What You'll See

### **Product History Example:**

```
Transaction #1: Created
  From: 0x0000... → To: Manufacturer
  Status: Created
  Time: [timestamp]

Transaction #2: Shipped to Distributor
  From: Manufacturer → To: Distributor
  Status: Shipped to Distributor
  Time: [timestamp]

Transaction #3: Received by Distributor
  From: Manufacturer → To: Distributor
  Status: Received by Distributor
  Time: [timestamp]

Transaction #4: Shipped to Retailer
  From: Distributor → To: Retailer
  Status: Shipped to Retailer
  Time: [timestamp]

Transaction #5: Received by Retailer
  From: Distributor → To: Retailer
  Status: Received by Retailer
  Time: [timestamp]

Transaction #6: Sold to Customer
  From: Retailer → To: Customer
  Status: Sold to Customer
  Time: [timestamp]

Transaction #7: Delivered to Customer
  From: Retailer → To: Customer
  Status: Delivered to Customer
  Time: [timestamp]
```

---

## 🚀 Quick Start

1. **Open**: http://localhost:3000
2. **Switch to Manufacturer**: `0x260117ad7eb22f48479ebceca06521a728961112`
3. **Create Product** → Note the Product ID
4. **Follow the flow** step by step
5. **Track the product** at each stage

---

## 💡 Tips

- **Product ID is your QR Code ID** - remember it!
- **Each transaction updates history automatically**
- **Product Tracker shows complete journey**
- **Only authorized users can track**
- **Government can track any product**

---

**Start with Step 1 and work through each step!** 🎉

