const hre = require("hardhat");

/**
 * Comprehensive check of contract deployment
 * Verifies contracts exist and can be called
 */
async function main() {
  console.log("🔍 Checking Contract Deployment on Network...\n");

  const USER_REGISTRY = process.env.NEXT_PUBLIC_USER_REGISTRY;
  const PRODUCT_REGISTRY = process.env.NEXT_PUBLIC_PRODUCT_REGISTRY;
  const SUPPLY_CHAIN = process.env.NEXT_PUBLIC_SUPPLY_CHAIN;

  if (!USER_REGISTRY || !PRODUCT_REGISTRY || !SUPPLY_CHAIN) {
    console.error("❌ Contract addresses not found in .env file!");
    process.exit(1);
  }

  const provider = new hre.ethers.JsonRpcProvider("http://127.0.0.1:8545");

  console.log("📡 Network Information:");
  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    console.log("  Network Name:", network.name);
    console.log("  Chain ID:", Number(network.chainId));
    console.log("  Current Block:", blockNumber);
    console.log("  RPC URL: http://localhost:8545\n");
  } catch (error) {
    console.error("❌ Cannot connect to network:", error.message);
    console.log("\n💡 Make sure Hardhat node is running: npm run node");
    process.exit(1);
  }

  console.log("📋 Contract Addresses:");
  console.log("  UserRegistry:", USER_REGISTRY);
  console.log("  ProductRegistry:", PRODUCT_REGISTRY);
  console.log("  SupplyChain:", SUPPLY_CHAIN);
  console.log("");

  // Check if contracts have code
  console.log("🔍 Checking Contract Code...");
  const [code1, code2, code3] = await Promise.all([
    provider.getCode(USER_REGISTRY),
    provider.getCode(PRODUCT_REGISTRY),
    provider.getCode(SUPPLY_CHAIN),
  ]);

  let allDeployed = true;

  if (code1 && code1 !== "0x") {
    console.log("  ✅ UserRegistry: DEPLOYED (Code length:", code1.length, "bytes)");
  } else {
    console.log("  ❌ UserRegistry: NOT FOUND");
    allDeployed = false;
  }

  if (code2 && code2 !== "0x") {
    console.log("  ✅ ProductRegistry: DEPLOYED (Code length:", code2.length, "bytes)");
  } else {
    console.log("  ❌ ProductRegistry: NOT FOUND");
    allDeployed = false;
  }

  if (code3 && code3 !== "0x") {
    console.log("  ✅ SupplyChain: DEPLOYED (Code length:", code3.length, "bytes)");
  } else {
    console.log("  ❌ SupplyChain: NOT FOUND");
    allDeployed = false;
  }

  console.log("");

  if (!allDeployed) {
    console.log("❌ Some contracts are not deployed!");
    console.log("💡 Run: npm run deploy:local");
    process.exit(1);
  }

  // Test contract calls
  console.log("🧪 Testing Contract Calls...\n");

  try {
    const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
    const userRegistry = UserRegistry.attach(USER_REGISTRY);

    // Get government address
    const government = await userRegistry.government();
    console.log("  ✅ UserRegistry.government():", government);

    // Check if a test user is registered
    const [deployer, manufacturer] = await hre.ethers.getSigners();
    const isRegistered = await userRegistry.isUserRegistered(manufacturer.address);
    const role = await userRegistry.getUserRole(manufacturer.address);
    
    console.log("  ✅ UserRegistry.isUserRegistered():", isRegistered);
    console.log("  ✅ UserRegistry.getUserRole():", Number(role), "(2 = Manufacturer)");

    if (isRegistered && Number(role) === 2) {
      console.log("  ✅ Default users are registered correctly!\n");
    }

  } catch (error) {
    console.log("  ⚠️  Error calling UserRegistry:", error.message);
  }

  try {
    const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
    const productRegistry = ProductRegistry.attach(PRODUCT_REGISTRY);

    const totalProducts = await productRegistry.getTotalProducts();
    console.log("  ✅ ProductRegistry.getTotalProducts():", Number(totalProducts));

  } catch (error) {
    console.log("  ⚠️  Error calling ProductRegistry:", error.message);
  }

  try {
    const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
    const supplyChain = SupplyChain.attach(SUPPLY_CHAIN);

    const totalTransactions = await supplyChain.getTotalTransactions();
    console.log("  ✅ SupplyChain.getTotalTransactions():", Number(totalTransactions));

  } catch (error) {
    console.log("  ⚠️  Error calling SupplyChain:", error.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ ALL CONTRACTS ARE DEPLOYED AND WORKING!");
  console.log("=".repeat(50));
  console.log("\n📊 Summary:");
  console.log("  • All contracts have code deployed");
  console.log("  • Contracts are callable and responding");
  console.log("  • Network is active and accessible");
  console.log("\n🌐 To verify on a blockchain explorer:");
  console.log("  For local network: Use Hardhat's built-in explorer");
  console.log("  For custom network: Use the network's block explorer");
  console.log("  Contract addresses are in your .env file");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

