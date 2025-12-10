# 🚀 Quick Test Reference Card

## 📝 Step-by-Step (Copy This!)

### 1️⃣ Register Users (As Government)
```
Address: [Manufacturer Address]
Name: Test Manufacturer
Role: Manufacturer
→ Click Register

Repeat for: Distributor, Retailer, Customer
```

### 2️⃣ Create Product (As Manufacturer)
```
Name: Laptop Model X
Description: High-performance gaming laptop
→ Click Create Product
→ Note Product ID (e.g., #1)
```

### 3️⃣ Ship to Distributor (As Manufacturer)
```
Product ID: 1
Distributor Address: [Distributor's address]
→ Click Ship to Distributor
```

### 4️⃣ Receive (As Distributor)
```
Product ID: 1
→ Click Receive from Manufacturer
```

### 5️⃣ Ship to Retailer (As Distributor)
```
Product ID: 1
Retailer Address: [Retailer's address]
→ Click Ship to Retailer
```

### 6️⃣ Receive (As Retailer)
```
Product ID: 1
→ Click Receive from Distributor
```

### 7️⃣ Sell to Customer (As Retailer)
```
Product ID: 1
Customer Address: [Customer's address]
→ Click Sell to Customer
```

### 8️⃣ Confirm Delivery (As Customer)
```
Product ID: 1
→ Click Confirm Delivery
```

### 9️⃣ Test Tracking
```
As Manufacturer: Track Product #1 ✅
As Distributor: Track Product #1 ✅
As Unregistered: Track Product #1 ❌ (Blocked)
```

---

## 🎯 Quick Checklist

- [ ] Government registered 4 users
- [ ] Manufacturer created product
- [ ] Product shipped through all stages
- [ ] Customer confirmed delivery
- [ ] Product Tracker works for authorized users
- [ ] Unauthorized access blocked

---

## 📍 Contract Addresses

- UserRegistry: `0x703922e870B095FDfc2b4b0D37d71228356fD3Cb`
- ProductRegistry: `0x5F7DBD43a77407adA1f3DBD2803d3B21E8Bc0531`
- SupplyChain: `0x64e3fDBd9621C1Dd2DeC6C88Fb7d5B1a62Bc91e0`

---

## 👤 Government Account

`0xf00Be00c35e6Dd57cd8e7eeb33D17211e854AD86`

---

**Time to complete: ~15 minutes** ⏱️


