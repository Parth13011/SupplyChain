const hre = require("hardhat");

/**
 * Verify that contracts exist at the addresses in .env
 */
async function main() {
  console.log("🔍 Verifying contracts...\n");

  const USER_REGISTRY = process.env.NEXT_PUBLIC_USER_REGISTRY;
  const PRODUCT_REGISTRY = process.env.NEXT_PUBLIC_PRODUCT_REGISTRY;
  const SUPPLY_CHAIN = process.env.NEXT_PUBLIC_SUPPLY_CHAIN;

  if (!USER_REGISTRY || !PRODUCT_REGISTRY || !SUPPLY_CHAIN) {
    console.error("❌ Contract addresses not found in .env file!");
    console.error("Please run: npm run deploy:local");
    process.exit(1);
  }

  console.log("Contract Addresses from .env:");
  console.log("UserRegistry:", USER_REGISTRY);
  console.log("ProductRegistry:", PRODUCT_REGISTRY);
  console.log("SupplyChain:", SUPPLY_CHAIN);
  console.log("");

  try {
    // Try to connect to the network
    const provider = new hre.ethers.JsonRpcProvider("http://localhost:8545");
    const code1 = await provider.getCode(USER_REGISTRY);
    const code2 = await provider.getCode(PRODUCT_REGISTRY);
    const code3 = await provider.getCode(SUPPLY_CHAIN);

    console.log("📋 Contract Verification:");
    console.log("");

    if (code1 && code1 !== "0x") {
      console.log("✅ UserRegistry exists at", USER_REGISTRY);
    } else {
      console.log("❌ UserRegistry NOT FOUND at", USER_REGISTRY);
      console.log("   → Run: npm run deploy:local");
    }

    if (code2 && code2 !== "0x") {
      console.log("✅ ProductRegistry exists at", PRODUCT_REGISTRY);
    } else {
      console.log("❌ ProductRegistry NOT FOUND at", PRODUCT_REGISTRY);
      console.log("   → Run: npm run deploy:local");
    }

    if (code3 && code3 !== "0x") {
      console.log("✅ SupplyChain exists at", SUPPLY_CHAIN);
    } else {
      console.log("❌ SupplyChain NOT FOUND at", SUPPLY_CHAIN);
      console.log("   → Run: npm run deploy:local");
    }

    console.log("");

    // Check if Hardhat node is running
    try {
      const blockNumber = await provider.getBlockNumber();
      console.log("✅ Hardhat node is running (Block:", blockNumber + ")");
    } catch (e) {
      console.log("❌ Cannot connect to Hardhat node!");
      console.log("   → Start it with: npm run node");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("");
    console.log("💡 Solutions:");
    console.log("1. Make sure Hardhat node is running: npm run node");
    console.log("2. Deploy contracts: npm run deploy:local");
    console.log("3. Update .env with new addresses");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


