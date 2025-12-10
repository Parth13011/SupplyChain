const hre = require("hardhat");

/**
 * Simplified deployment with better error handling
 */
async function main() {
  console.log("🚀 Deploying to Custom Network...\n");

  if (!process.env.PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not found!");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "TT\n");

  try {
    // Deploy UserRegistry
    console.log("1️⃣ Deploying UserRegistry...");
    const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
    const userRegistry = await UserRegistry.deploy();
    const tx1 = userRegistry.deploymentTransaction();
    
    if (tx1) {
      console.log("   TX Hash:", tx1.hash);
      console.log("   ⏳ Waiting...");
      await tx1.wait();
    }
    
    const addr1 = await userRegistry.getAddress();
    console.log("   ✅ Deployed:", addr1, "\n");

    // Deploy ProductRegistry
    console.log("2️⃣ Deploying ProductRegistry...");
    const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
    const productRegistry = await ProductRegistry.deploy(addr1);
    const tx2 = productRegistry.deploymentTransaction();
    
    if (tx2) {
      console.log("   TX Hash:", tx2.hash);
      console.log("   ⏳ Waiting...");
      await tx2.wait();
    }
    
    const addr2 = await productRegistry.getAddress();
    console.log("   ✅ Deployed:", addr2, "\n");

    // Deploy SupplyChain
    console.log("3️⃣ Deploying SupplyChain...");
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = await SupplyChain.deploy(addr1, addr2);
    const tx3 = supplyChain.deploymentTransaction();
    
    if (tx3) {
      console.log("   TX Hash:", tx3.hash);
      console.log("   ⏳ Waiting...");
      await tx3.wait();
    }
    
    const addr3 = await supplyChain.getAddress();
    console.log("   ✅ Deployed:", addr3, "\n");

    console.log("=".repeat(60));
    console.log("✅ ALL CONTRACTS DEPLOYED!");
    console.log("=".repeat(60));
    console.log("\nContract Addresses:");
    console.log("UserRegistry:", addr1);
    console.log("ProductRegistry:", addr2);
    console.log("SupplyChain:", addr3);
    console.log("\nExplorer Links:");
    console.log("UserRegistry: https://explorer.didlab.org/address/" + addr1);
    console.log("ProductRegistry: https://explorer.didlab.org/address/" + addr2);
    console.log("SupplyChain: https://explorer.didlab.org/address/" + addr3);

  } catch (error) {
    console.error("\n❌ Deployment Error:", error.message);
    if (error.transaction) {
      console.log("Transaction hash:", error.transaction.hash);
      console.log("Check: https://explorer.didlab.org/tx/" + error.transaction.hash);
    }
    if (error.receipt) {
      console.log("Transaction failed in block:", error.receipt.blockNumber);
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

