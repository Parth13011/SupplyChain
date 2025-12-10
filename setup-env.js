const fs = require('fs');
const path = require('path');

const envContent = `# Contract Addresses (Deployed on DIDLab Network - Chain ID 252501)
NEXT_PUBLIC_USER_REGISTRY=0x703922e870B095FDfc2b4b0D37d71228356fD3Cb
NEXT_PUBLIC_PRODUCT_REGISTRY=0x5F7DBD43a77407adA1f3DBD2803d3B21E8Bc0531
NEXT_PUBLIC_SUPPLY_CHAIN=0x64e3fDBd9621C1Dd2DeC6C88Fb7d5B1a62Bc91e0

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=252501
NEXT_PUBLIC_RPC_URL=https://eth.didlab.org
NEXT_PUBLIC_EXPLORER_URL=https://explorer.didlab.org
`;

const envPath = path.join(__dirname, '.env.local');

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Skipping...');
    console.log('If you want to update it, delete .env.local and run this script again.');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file with contract addresses!');
    console.log('\n📋 Contract Addresses:');
    console.log('UserRegistry: 0x703922e870B095FDfc2b4b0D37d71228356fD3Cb');
    console.log('ProductRegistry: 0x5F7DBD43a77407adA1f3DBD2803d3B21E8Bc0531');
    console.log('SupplyChain: 0x64e3fDBd9621C1Dd2DeC6C88Fb7d5B1a62Bc91e0');
    console.log('\n🚀 Now run: npm run dev');
  }
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  process.exit(1);
}


