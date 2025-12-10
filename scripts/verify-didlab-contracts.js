const hre = require("hardhat");
const { ethers } = require("ethers");

/**
 * Verify contracts are deployed on DIDLab blockchain
 */
async function main() {
  console.log("🔍 Verifying Contracts on DIDLab Blockchain...\n");
  console.log("Network: https://eth.didlab.org");
  console.log("Chain ID: 252501");
  console.log("Explorer: https://explorer.didlab.org\n");

  // Get contract addresses from environment
  const userRegistryAddress = process.env.NEXT_PUBLIC_USER_REGISTRY;
  const productRegistryAddress = process.env.NEXT_PUBLIC_PRODUCT_REGISTRY;
  const supplyChainAddress = process.env.NEXT_PUBLIC_SUPPLY_CHAIN;

  if (!userRegistryAddress || !productRegistryAddress || !supplyChainAddress) {
    console.error("❌ Contract addresses not found in environment!");
    console.error("Please check your .env.local file");
    console.error("\nExpected variables:");
    console.error("NEXT_PUBLIC_USER_REGISTRY");
    console.error("NEXT_PUBLIC_PRODUCT_REGISTRY");
    console.error("NEXT_PUBLIC_SUPPLY_CHAIN");
    process.exit(1);
  }

  console.log("📋 Checking Contract Addresses:");
  console.log(`UserRegistry:    ${userRegistryAddress}`);
  console.log(`ProductRegistry:  ${productRegistryAddress}`);
  console.log(`SupplyChain:      ${supplyChainAddress}\n`);

  // Connect to DIDLab network
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "https://eth.didlab.org";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  try {
    // Check network
    const network = await provider.getNetwork();
    console.log(`🌐 Connected to network: Chain ID ${network.chainId}\n`);

    if (network.chainId.toString() !== "252501") {
      console.warn("⚠️  Warning: Chain ID doesn't match expected 252501");
    }

    // Verify each contract
    const contracts = [
      { name: "UserRegistry", address: userRegistryAddress },
      { name: "ProductRegistry", address: productRegistryAddress },
      { name: "SupplyChain", address: supplyChainAddress },
    ];

    let allVerified = true;

    for (const contract of contracts) {
      try {
        // Check if address has code (contract exists)
        const code = await provider.getCode(contract.address);
        
        if (code === "0x" || code === "0x0") {
          console.log(`❌ ${contract.name}:`);
          console.log(`   Address: ${contract.address}`);
          console.log(`   Status: NOT DEPLOYED (no code at address)`);
          console.log(`   Explorer: https://explorer.didlab.org/address/${contract.address}\n`);
          allVerified = false;
        } else {
          // Get code size
          const codeSize = (code.length - 2) / 2; // Remove 0x and divide by 2
          
          console.log(`✅ ${contract.name}:`);
          console.log(`   Address: ${contract.address}`);
          console.log(`   Status: DEPLOYED ✓`);
          console.log(`   Code Size: ${codeSize} bytes`);
          console.log(`   Explorer: https://explorer.didlab.org/address/${contract.address}\n`);

          // Try to call a simple function to verify it's the right contract
          try {
            if (contract.name === "UserRegistry") {
              const UserRegistry = await hre.ethers.getContractAt("UserRegistry", contract.address);
              const government = await UserRegistry.government();
              console.log(`   Government Address: ${government}`);
            } else if (contract.name === "ProductRegistry") {
              const ProductRegistry = await hre.ethers.getContractAt("ProductRegistry", contract.address);
              const userRegistry = await ProductRegistry.userRegistry();
              console.log(`   Linked UserRegistry: ${userRegistry}`);
            } else if (contract.name === "SupplyChain") {
              const SupplyChain = await hre.ethers.getContractAt("SupplyChain", contract.address);
              const userRegistry = await SupplyChain.userRegistry();
              console.log(`   Linked UserRegistry: ${userRegistry}`);
            }
          } catch (callError) {
            console.log(`   ⚠️  Could not verify contract functions (might be a different contract)`);
          }
        }
      } catch (error) {
        console.log(`❌ ${contract.name}:`);
        console.log(`   Error: ${error.message}\n`);
        allVerified = false;
      }
    }

    console.log("=".repeat(60));
    if (allVerified) {
      console.log("✅ ALL CONTRACTS VERIFIED ON DIDLAB BLOCKCHAIN!");
      console.log("=".repeat(60));
      console.log("\n🌐 View on Explorer:");
      console.log(`UserRegistry:    https://explorer.didlab.org/address/${userRegistryAddress}`);
      console.log(`ProductRegistry:  https://explorer.didlab.org/address/${productRegistryAddress}`);
      console.log(`SupplyChain:      https://explorer.didlab.org/address/${supplyChainAddress}`);
    } else {
      console.log("❌ SOME CONTRACTS NOT FOUND!");
      console.log("=".repeat(60));
      console.log("\n💡 To deploy contracts to DIDLab:");
      console.log("   1. Make sure PRIVATE_KEY is in .env file");
      console.log("   2. Run: npm run deploy:custom");
      console.log("   3. Update .env.local with new addresses");
    }
  } catch (error) {
    console.error("❌ Error connecting to network:", error.message);
    console.error("\n💡 Check:");
    console.error("   - Network is accessible: https://eth.didlab.org");
    console.error("   - RPC URL is correct in .env.local");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });



