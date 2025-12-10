const fs = require('fs');
const path = require('path');

const envContent = `# Contract Addresses (Deployed on DIDLab Network - Chain ID 252501)
NEXT_PUBLIC_USER_REGISTRY=0x149123bDBfa8D85Ba8E264B7eb0e514ecB7cb003
NEXT_PUBLIC_PRODUCT_REGISTRY=0x4B5fA520f9b03adCD471E5fC1d73b458a47C59a2
NEXT_PUBLIC_SUPPLY_CHAIN=0xcD6B633D03962897088bD5ff738203Cf7bad5503

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=252501
NEXT_PUBLIC_RPC_URL=https://eth.didlab.org
NEXT_PUBLIC_EXPLORER_URL=https://explorer.didlab.org
`;

const envPath = path.join(__dirname, '..', '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env.local with new contract addresses!');
  console.log('\n📋 Contract Addresses:');
  console.log('UserRegistry: 0x149123bDBfa8D85Ba8E264B7eb0e514ecB7cb003');
  console.log('ProductRegistry: 0x4B5fA520f9b03adCD471E5fC1d73b458a47C59a2');
  console.log('SupplyChain: 0xcD6B633D03962897088bD5ff738203Cf7bad5503');
} catch (error) {
  console.error('❌ Error updating .env.local:', error.message);
  process.exit(1);
}




