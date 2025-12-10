const hre = require("hardhat");

/**
 * Quick check - just verify contracts exist and are callable
 */
async function main() {
  console.log("🔍 Quick Contract Verification\n");

  const contracts = {
    UserRegistry: "0xCB4d0df4f7631eC70ad66D02269ef3f944404e34",
    ProductRegistry: "0x066669570E938881d61fD6bf3b325E382fA0F23a",
    SupplyChain: "0x537605c994Ec50Fb92773237Cb9d06eAD09E2dCa"
  };

  const [deployer] = await hre.ethers.getSigners();
  console.log("Network:", hre.network.name);
  console.log("Checking account:", deployer.address, "\n");

  // Check UserRegistry
  try {
    console.log("1️⃣  UserRegistry");
    const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
    const userRegistry = UserRegistry.attach(contracts.UserRegistry);
    const gov = await userRegistry.government();
    const isRegistered = await userRegistry.isUserRegistered(deployer.address);
    console.log("   ✅ Address:", contracts.UserRegistry);
    console.log("   ✅ Government:", gov);
    console.log("   ✅ Deployer registered:", isRegistered);
    console.log("   🔗 Explorer: https://explorer.didlab.org/address/" + contracts.UserRegistry);
  } catch (error) {
    console.log("   ❌ Error:", error.message);
  }

  console.log();

  // Check ProductRegistry
  try {
    console.log("2️⃣  ProductRegistry");
    const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
    const productRegistry = ProductRegistry.attach(contracts.ProductRegistry);
    const totalProducts = await productRegistry.getTotalProducts();
    const userReg = await productRegistry.userRegistry();
    console.log("   ✅ Address:", contracts.ProductRegistry);
    console.log("   ✅ Total Products:", totalProducts.toString());
    console.log("   ✅ Linked UserRegistry:", userReg);
    console.log("   🔗 Explorer: https://explorer.didlab.org/address/" + contracts.ProductRegistry);
  } catch (error) {
    console.log("   ❌ Error:", error.message);
  }

  console.log();

  // Check SupplyChain
  try {
    console.log("3️⃣  SupplyChain");
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = SupplyChain.attach(contracts.SupplyChain);
    const totalTx = await supplyChain.getTotalTransactions();
    const userReg = await supplyChain.userRegistry();
    const prodReg = await supplyChain.productRegistry();
    console.log("   ✅ Address:", contracts.SupplyChain);
    console.log("   ✅ Total Transactions:", totalTx.toString());
    console.log("   ✅ Linked UserRegistry:", userReg);
    console.log("   ✅ Linked ProductRegistry:", prodReg);
    console.log("   🔗 Explorer: https://explorer.didlab.org/address/" + contracts.SupplyChain);
  } catch (error) {
    console.log("   ❌ Error:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Verification Complete!");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



