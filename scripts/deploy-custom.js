const hre = require("hardhat");

/**
 * Deploy contracts to custom network (Professor's VM)
 */
async function main() {
  console.log("🚀 Deploying contracts to Custom Network...\n");
  console.log("Network: https://eth.didlab.org");
  console.log("Chain ID: 252501");
  console.log("Explorer: https://explorer.didlab.org\n");

  // Check if private key is set
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not found in .env file!");
    console.error("Please add your private key to .env file");
    process.exit(1);
  }

  console.log("Deploying contracts...");
  console.log("⏳ Using 2 gwei gas price for faster confirmation...\n");

  const [deployer] = await hre.ethers.getSigners();
  const feeData = await deployer.provider.getFeeData();
  const gasPrice = feeData.gasPrice ? feeData.gasPrice * 2n : 2000000000n; // 2 gwei
  
  // Deploy UserRegistry first (Government contract)
  console.log("1. Deploying UserRegistry...");
  console.log("   ⏳ Sending transaction (gas price: 2 gwei)...");
  const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy({ gasPrice });
  
  const deployTx = userRegistry.deploymentTransaction();
  if (deployTx) {
    console.log("   📝 Transaction hash:", deployTx.hash);
    console.log("   🔗 View on explorer: https://explorer.didlab.org/tx/" + deployTx.hash);
    console.log("   ⏳ Waiting for confirmation...");
    
    try {
      const receipt = await deployTx.wait(1);
      console.log("   ✅ Transaction confirmed! Block:", receipt.blockNumber);
    } catch (error) {
      console.log("   ⚠️  Still waiting for confirmation...");
    }
  }
  
  await userRegistry.waitForDeployment();
  const userRegistryAddress = await userRegistry.getAddress();
  console.log("   ✅ UserRegistry deployed to:", userRegistryAddress);

  // Deploy ProductRegistry
  console.log("\n2. Deploying ProductRegistry...");
  console.log("   ⏳ Sending transaction (gas price: 2 gwei)...");
  const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
  const productRegistry = await ProductRegistry.deploy(userRegistryAddress, { gasPrice });
  
  const deployTx2 = productRegistry.deploymentTransaction();
  if (deployTx2) {
    console.log("   📝 Transaction hash:", deployTx2.hash);
    console.log("   🔗 View on explorer: https://explorer.didlab.org/tx/" + deployTx2.hash);
    console.log("   ⏳ Waiting for confirmation...");
    try {
      const receipt2 = await deployTx2.wait(1);
      console.log("   ✅ Transaction confirmed! Block:", receipt2.blockNumber);
    } catch (error) {
      console.log("   ⚠️  Still waiting for confirmation...");
    }
  }
  
  await productRegistry.waitForDeployment();
  const productRegistryAddress = await productRegistry.getAddress();
  console.log("   ✅ ProductRegistry deployed to:", productRegistryAddress);

  // Deploy SupplyChain
  console.log("\n3. Deploying SupplyChain...");
  console.log("   ⏳ Sending transaction (gas price: 2 gwei)...");
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy(userRegistryAddress, productRegistryAddress, { gasPrice });
  
  const deployTx3 = supplyChain.deploymentTransaction();
  if (deployTx3) {
    console.log("   📝 Transaction hash:", deployTx3.hash);
    console.log("   🔗 View on explorer: https://explorer.didlab.org/tx/" + deployTx3.hash);
    console.log("   ⏳ Waiting for confirmation...");
    try {
      const receipt3 = await deployTx3.wait(1);
      console.log("   ✅ Transaction confirmed! Block:", receipt3.blockNumber);
    } catch (error) {
      console.log("   ⚠️  Still waiting for confirmation...");
    }
  }
  
  await supplyChain.waitForDeployment();
  const supplyChainAddress = await supplyChain.getAddress();
  console.log("   ✅ SupplyChain deployed to:", supplyChainAddress);

  console.log("\n" + "=".repeat(60));
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("UserRegistry:", userRegistryAddress);
  console.log("ProductRegistry:", productRegistryAddress);
  console.log("SupplyChain:", supplyChainAddress);
  
  console.log("\n🌐 Verify on Explorer:");
  console.log("UserRegistry: https://explorer.didlab.org/address/" + userRegistryAddress);
  console.log("ProductRegistry: https://explorer.didlab.org/address/" + productRegistryAddress);
  console.log("SupplyChain: https://explorer.didlab.org/address/" + supplyChainAddress);

  console.log("\n📝 Update your .env file with these addresses:");
  console.log(`NEXT_PUBLIC_USER_REGISTRY=${userRegistryAddress}`);
  console.log(`NEXT_PUBLIC_PRODUCT_REGISTRY=${productRegistryAddress}`);
  console.log(`NEXT_PUBLIC_SUPPLY_CHAIN=${supplyChainAddress}`);

  // Auto-register default users (using deployer account as Government)
  console.log("\n4. Government Account Info:");
  console.log("Deployer (Government):", deployer.address);

  // Note: For custom network, you'll need to register users manually
  // or provide addresses of accounts that will be used
  console.log("\n⚠️  Note: Default users need to be registered manually");
  console.log("   Use the Government account to register users via frontend");
  console.log("   Government address:", deployer.address);

  console.log("\n✅ Deployment successful!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

