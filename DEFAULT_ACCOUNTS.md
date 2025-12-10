# 🔐 Default Test Accounts (Hardcoded)

## ✅ Auto-Registered Users

When you run `npm run deploy:local`, these accounts are **automatically registered**:

### Account Details

| Role | Address | Private Key (from Hardhat) |
|------|---------|----------------------------|
| **Government** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| **Manufacturer** | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| **Distributor** | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |
| **Retailer** | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` |
| **Customer** | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f4c98bc0e0c0c` |

## 🚀 Quick Start

### 1. Import Accounts to MetaMask

1. Open MetaMask
2. Click account icon → "Import Account"
3. Paste the private key for the account you want to use
4. Repeat for all accounts you need

### 2. Connect to Local Network

1. In MetaMask, add network:
   - **Network Name:** `Hardhat Local`
   - **RPC URL:** `http://localhost:8545`
   - **Chain ID:** `1337`
   - **Currency Symbol:** `ETH`

### 3. Use the Frontend

1. Open `http://localhost:3000`
2. Connect MetaMask with any of the accounts above
3. You'll automatically see the correct dashboard for that role!

## 📝 Notes

- ✅ All accounts are **pre-registered** - no manual registration needed!
- ✅ Each account has **10,000 test ETH** (fake tokens for testing)
- ✅ These are **Hardhat default accounts** - same every time
- ✅ You can add more users via Government dashboard if needed

## 🧪 Test Results

**✅ All tests PASSED!**

- ✅ User registrations verified
- ✅ Product creation works
- ✅ Full supply chain flow completed
- ✅ All 6 transactions recorded
- ✅ Final status: "Delivered to Customer"

**Test Product ID:** `1` (you can track this in the frontend!)

---

## 🔄 Adding More Users

If you want to add more users:

1. Connect as **Government** (Account #0)
2. Use the Government Dashboard
3. Enter new user address and select role
4. Click "Register User"

The default accounts are always available, but you can expand the system as needed!

