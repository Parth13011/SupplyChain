const hre = require("hardhat");

/**
 * Verify deployed contracts on custom network
 */
async function main() {
  console.log("🔍 Verifying Contract Deployment on DIDLab Network...\n");

  // Deployed addresses
  const userRegistryAddress = "0xCB4d0df4f7631eC70ad66D02269ef3f944404e34";
  const productRegistryAddress = "0x066669570E938881d61fD6bf3b325E382fA0F23a";
  const supplyChainAddress = "0x537605c994Ec50Fb92773237Cb9d06eAD09E2dCa";

  const [deployer] = await hre.ethers.getSigners();
  console.log("Checking with account:", deployer.address);
  console.log("Network:", hre.network.name, "\n");

  try {
    // Check UserRegistry
    console.log("1. Checking UserRegistry...");
    const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
    const userRegistry = UserRegistry.attach(userRegistryAddress);
    
    const government = await userRegistry.government();
    console.log("   ✅ Government address:", government);
    console.log("   ✅ Contract is deployed and accessible\n");

    // Check ProductRegistry
    console.log("2. Checking ProductRegistry...");
    const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
    const productRegistry = ProductRegistry.attach(productRegistryAddress);
    
    const userRegistryLink = await productRegistry.userRegistry();
    const totalProducts = await productRegistry.getTotalProducts();
    console.log("   ✅ Linked to UserRegistry:", userRegistryLink);
    console.log("   ✅ Total products:", totalProducts.toString());
    console.log("   ✅ Contract is deployed and accessible\n");

    // Check SupplyChain
    console.log("3. Checking SupplyChain...");
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = SupplyChain.attach(supplyChainAddress);
    
    const userReg = await supplyChain.userRegistry();
    const prodReg = await supplyChain.productRegistry();
    const totalTransactions = await supplyChain.getTotalTransactions();
    console.log("   ✅ Linked to UserRegistry:", userReg);
    console.log("   ✅ Linked to ProductRegistry:", prodReg);
    console.log("   ✅ Total transactions:", totalTransactions.toString());
    console.log("   ✅ Contract is deployed and accessible\n");

    // Check if deployer is Government
    console.log("4. Checking Deployer Role...");
    const deployerRole = await userRegistry.getUserRole(deployer.address);
    const roleNames = ["None", "Government", "Manufacturer", "Distributor", "Retailer", "Customer"];
    console.log("   ✅ Deployer role:", roleNames[Number(deployerRole)]);
    console.log("   ✅ Deployer is registered:", await userRegistry.isUserRegistered(deployer.address));

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL CONTRACTS VERIFIED AND WORKING!");
    console.log("=".repeat(60));
    console.log("\n📋 Contract Addresses:");
    console.log("UserRegistry:", userRegistryAddress);
    console.log("ProductRegistry:", productRegistryAddress);
    console.log("SupplyChain:", supplyChainAddress);
    console.log("\n🌐 Explorer Links:");
    console.log("UserRegistry: https://explorer.didlab.org/address/" + userRegistryAddress);
    console.log("ProductRegistry: https://explorer.didlab.org/address/" + productRegistryAddress);
    console.log("SupplyChain: https://explorer.didlab.org/address/" + supplyChainAddress);

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



