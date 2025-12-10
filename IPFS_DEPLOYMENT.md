# 🚀 IPFS Deployment Guide

This guide will help you deploy your Blockchain Supply Chain Management System to IPFS using the DIDLab IPFS gateway.

## Prerequisites

1. **Deploy Contracts to DIDLab Network**
   - Contracts must be deployed to the DIDLab network (Chain ID: 252501)
   - Not localhost - they need to be on the live blockchain

2. **Environment Variables**
   - Ensure your `.env.local` has the correct contract addresses
   - These addresses will be baked into the static build

3. **IPFS Gateway Access**
   - Access to DIDLab IPFS gateway: `https://ipfs.didlab.org`
   - Or use any public IPFS gateway

## Step-by-Step Deployment

### Step 1: Deploy Smart Contracts to DIDLab Network

First, deploy your contracts to the DIDLab blockchain:

```bash
# Make sure you have your private key in .env
npm run deploy:custom
```

This will deploy:
- UserRegistry
- ProductRegistry  
- SupplyChain

**Important:** Copy the contract addresses from the output and update your `.env.local` file:

```env
NEXT_PUBLIC_USER_REGISTRY=0x...
NEXT_PUBLIC_PRODUCT_REGISTRY=0x...
NEXT_PUBLIC_SUPPLY_CHAIN=0x...
NEXT_PUBLIC_CHAIN_ID=252501
NEXT_PUBLIC_RPC_URL=https://eth.didlab.org
NEXT_PUBLIC_EXPLORER_URL=https://explorer.didlab.org
```

### Step 2: Build Static Export

Build your Next.js app for static export:

```bash
npm run build:ipfs
```

This creates an `out/` directory with all static files ready for IPFS.

### Step 3: Deploy to IPFS

Upload your built app to IPFS:

```bash
npm run deploy:ipfs
```

This script will:
1. Connect to the IPFS gateway
2. Upload all files from the `out/` directory
3. Pin the content
4. Return the IPFS CID and access URLs

### Step 4: Access Your Deployed App

After deployment, you'll get:
- **IPFS URL**: `https://ipfs.didlab.org/ipfs/Qm...` (content-addressed)
- **IPNS URL**: `https://ipfs.didlab.org/ipns/Qm...` (mutable, if configured)

Share the IPFS URL with users to access your decentralized app!

## Complete Deployment (All Steps)

To deploy everything in one command:

```bash
npm run deploy:all
```

This will:
1. Deploy contracts to DIDLab network
2. Build the static export
3. Upload to IPFS

## Manual IPFS Upload (Alternative)

If you prefer to use the DIDLab Encrypted IPFS Desk:

1. **Build the app:**
   ```bash
   npm run build:ipfs
   ```

2. **Create a ZIP file:**
   ```bash
   cd out
   zip -r ../supply-chain-app.zip .
   cd ..
   ```

3. **Upload via DIDLab IPFS Desk:**
   - Go to: https://ipfs.didlab.org (or your IPFS desk URL)
   - Authorize your wallet
   - Upload the ZIP file
   - Encrypt and pay with TrustToken
   - Save the CID and decryption details

4. **Access your app:**
   - Use the gateway URL: `https://gateway.didlab.org/ipfs/YOUR_CID`
   - Or decrypt and serve the files

## Environment Variables for IPFS

Your `.env.local` should contain:

```env
# Contract Addresses (Deployed on DIDLab Network)
NEXT_PUBLIC_USER_REGISTRY=0x703922e870B095FDfc2b4b0D37d71228356fD3Cb
NEXT_PUBLIC_PRODUCT_REGISTRY=0x5F7DBD43a77407adA1f3DBD2803d3B21E8Bc0531
NEXT_PUBLIC_SUPPLY_CHAIN=0x64e3fDBd9621C1Dd2DeC6C88Fb7d5B1a62Bc91e0

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=252501
NEXT_PUBLIC_RPC_URL=https://eth.didlab.org
NEXT_PUBLIC_EXPLORER_URL=https://explorer.didlab.org

# IPFS Configuration (optional)
IPFS_GATEWAY=https://ipfs.didlab.org
IPFS_API=https://ipfs.didlab.org/api/v0
```

## Important Notes

### ⚠️ Static Export Limitations

Since we're using static export for IPFS:

1. **No Server-Side Features**: 
   - No API routes
   - No server-side rendering
   - All logic runs client-side

2. **Environment Variables**:
   - Only `NEXT_PUBLIC_*` variables are available
   - They're baked into the build at build time
   - Update and rebuild to change them

3. **Routing**:
   - Uses hash-based routing (`#`) for IPFS compatibility
   - All routes work via client-side navigation

### 🔒 Security Considerations

1. **Contract Addresses**: 
   - Publicly visible in the built JavaScript
   - This is expected for public dApps

2. **Private Keys**:
   - Never include private keys in the build
   - Users connect via MetaMask

3. **IPFS Content**:
   - Content is publicly accessible via CID
   - Consider encryption for sensitive data

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next out
npm run build:ipfs
```

### IPFS Upload Fails

1. Check IPFS gateway connectivity:
   ```bash
   curl https://ipfs.didlab.org/api/v0/version
   ```

2. Verify `out/` directory exists:
   ```bash
   ls -la out/
   ```

3. Check file permissions

### App Doesn't Load on IPFS

1. Check browser console for errors
2. Verify all assets use relative paths
3. Ensure MetaMask can connect to DIDLab network
4. Check that contract addresses are correct

## Updating Your Deployment

To update your IPFS deployment:

1. Make changes to your code
2. Update contract addresses if needed
3. Rebuild: `npm run build:ipfs`
4. Redeploy: `npm run deploy:ipfs`

**Note:** Each deployment gets a new CID. Old versions remain accessible via their CIDs.

## Pinning Content

To ensure your content stays available:

1. **Use IPFS pinning services**
2. **Run your own IPFS node**
3. **Use DIDLab's pinning** (if available)

## Support

For issues:
- Check DIDLab documentation: https://didlab.org
- IPFS documentation: https://docs.ipfs.io
- Gateway status: Check DIDLab status page

---

**Your app is now decentralized and accessible via IPFS! 🎉**




