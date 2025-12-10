# 🚀 Quick Start - Frontend

## ✅ Setup Complete!

Your frontend is ready to use. Here's what was done:

1. ✅ Updated `lib/web3.ts` - Auto-connects to DIDLab network
2. ✅ Contract addresses configured
3. ✅ Network switching handled automatically
4. ✅ Frontend simplified and ready

---

## 🎯 Start the Frontend

```bash
npm run dev
```

Then open: **http://localhost:3000**

---

## 📝 What Happens When You Connect

1. **Click "Connect MetaMask"**
   - Frontend automatically adds DIDLab network to MetaMask (if not already added)
   - Switches to Chain ID 252501
   - Connects your wallet

2. **Check Your Role**
   - If you're the Government account (deployer), you'll see Government dashboard
   - You can register other users
   - If not registered, you'll see instructions

3. **Use the System**
   - Each role has its own dashboard
   - Follow the supply chain flow: Manufacturer → Distributor → Retailer → Customer

---

## 🔧 Contract Addresses (Already Configured)

- **UserRegistry**: `0x703922e870B095FDfc2b4b0D37d71228356fD3Cb`
- **ProductRegistry**: `0x5F7DBD43a77407adA1f3DBD2803d3B21E8Bc0531`
- **SupplyChain**: `0x64e3fDBd9621C1Dd2DeC6C88Fb7d5B1a62Bc91e0`

---

## 👤 Government Account

**Address**: `0xf00Be00c35e6Dd57cd8e7eeb33D17211e854AD86`

This account is automatically registered as Government. Use it to:
- Register Manufacturers
- Register Distributors
- Register Retailers
- Register Customers

---

## 🌐 Network Info

- **Network**: DIDLab Network
- **Chain ID**: 252501
- **RPC**: https://eth.didlab.org
- **Explorer**: https://explorer.didlab.org

The frontend automatically handles network switching!

---

## 🎨 Features

- ✅ Simple, clean UI
- ✅ Auto network switching
- ✅ Role-based dashboards
- ✅ Product tracking
- ✅ Real-time updates

---

## 🐛 Troubleshooting

### Can't connect?
- Make sure MetaMask is installed
- Unlock MetaMask
- Refresh the page

### Wrong network?
- The app should auto-switch, but if not:
- Manually switch to Chain ID 252501 in MetaMask

### Not registered?
- Connect with Government account first
- Or ask Government to register you

---

## 🎉 Ready to Go!

Everything is set up. Just run `npm run dev` and start using the supply chain system!


