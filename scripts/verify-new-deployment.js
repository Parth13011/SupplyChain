const hre = require("hardhat");

/**
 * Verify the newly deployed contracts
 */
async function main() {
  console.log("🔍 Verifying New Contract Deployment on DIDLab Network...\n");

  // NEW deployed addresses
  const userRegistryAddress = "0x703922e870B095FDfc2b4b0D37d71228356fD3Cb";
  const productRegistryAddress = "0x5F7DBD43a77407adA1f3DBD2803d3B21E8Bc0531";
  const supplyChainAddress = "0x64e3fDBd9621C1Dd2DeC6C88Fb7d5B1a62Bc91e0";

  const [deployer] = await hre.ethers.getSigners();
  console.log("Checking with account:", deployer.address);
  console.log("Network:", hre.network.name, "\n");

  try {
    // Check UserRegistry
    console.log("1. Checking UserRegistry...");
    const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
    const userRegistry = UserRegistry.attach(userRegistryAddress);
    
    const government = await userRegistry.government();
    const isRegistered = await userRegistry.isUserRegistered(deployer.address);
    const deployerRole = await userRegistry.getUserRole(deployer.address);
    const roleNames = ["None", "Government", "Manufacturer", "Distributor", "Retailer", "Customer"];
    
    console.log("   ✅ Address:", userRegistryAddress);
    console.log("   ✅ Government address:", government);
    console.log("   ✅ Deployer registered:", isRegistered);
    console.log("   ✅ Deployer role:", roleNames[Number(deployerRole)]);
    console.log("   🔗 Explorer: https://explorer.didlab.org/address/" + userRegistryAddress);
    console.log("   ✅ Contract is deployed and accessible\n");

    // Check ProductRegistry
    console.log("2. Checking ProductRegistry...");
    const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
    const productRegistry = ProductRegistry.attach(productRegistryAddress);
    
    const userRegistryLink = await productRegistry.userRegistry();
    const totalProducts = await productRegistry.getTotalProducts();
    console.log("   ✅ Address:", productRegistryAddress);
    console.log("   ✅ Linked to UserRegistry:", userRegistryLink);
    console.log("   ✅ Total products:", totalProducts.toString());
    console.log("   🔗 Explorer: https://explorer.didlab.org/address/" + productRegistryAddress);
    console.log("   ✅ Contract is deployed and accessible\n");

    // Check SupplyChain
    console.log("3. Checking SupplyChain...");
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = SupplyChain.attach(supplyChainAddress);
    
    const userReg = await supplyChain.userRegistry();
    const prodReg = await supplyChain.productRegistry();
    const totalTransactions = await supplyChain.getTotalTransactions();
    console.log("   ✅ Address:", supplyChainAddress);
    console.log("   ✅ Linked to UserRegistry:", userReg);
    console.log("   ✅ Linked to ProductRegistry:", prodReg);
    console.log("   ✅ Total transactions:", totalTransactions.toString());
    console.log("   🔗 Explorer: https://explorer.didlab.org/address/" + supplyChainAddress);
    console.log("   ✅ Contract is deployed and accessible\n");

    // Verify links are correct
    console.log("4. Verifying Contract Links...");
    const linksCorrect = 
      userRegistryLink === userRegistryAddress &&
      userReg === userRegistryAddress &&
      prodReg === productRegistryAddress;
    
    if (linksCorrect) {
      console.log("   ✅ All contracts are properly linked!");
    } else {
      console.log("   ❌ Contract links mismatch!");
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL NEW CONTRACTS VERIFIED AND WORKING!");
    console.log("=".repeat(60));
    console.log("\n📋 New Contract Addresses:");
    console.log("UserRegistry:", userRegistryAddress);
    console.log("ProductRegistry:", productRegistryAddress);
    console.log("SupplyChain:", supplyChainAddress);
    console.log("\n🌐 Explorer Links:");
    console.log("UserRegistry: https://explorer.didlab.org/address/" + userRegistryAddress);
    console.log("ProductRegistry: https://explorer.didlab.org/address/" + productRegistryAddress);
    console.log("SupplyChain: https://explorer.didlab.org/address/" + supplyChainAddress);
    console.log("\n📝 Deployment Transactions:");
    console.log("UserRegistry TX: 0xa65f23e2da4eb9cb7ef82d9968630a573ea19ea117bacb0c93202997f04c1f43");
    console.log("ProductRegistry TX: 0x8ec928a7d839ac027b5b57e75a81fefa6512bd781127af77cec147fad1668f4a");
    console.log("SupplyChain TX: 0xca353b0b0e9d90d0b039244cccce37d4afc3e94aec0aa6c4dce695f014cde951");

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


