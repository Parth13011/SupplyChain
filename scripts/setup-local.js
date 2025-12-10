const hre = require("hardhat");

/**
 * Setup script for local development
 * Registers sample users for testing
 */
async function main() {
  console.log("Setting up local development environment...");

  const [deployer, manufacturer, distributor, retailer, customer] = await hre.ethers.getSigners();

  console.log("\nAccounts:");
  console.log("Deployer (Government):", deployer.address);
  console.log("Manufacturer:", manufacturer.address);
  console.log("Distributor:", distributor.address);
  console.log("Retailer:", retailer.address);
  console.log("Customer:", customer.address);

  const USER_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_USER_REGISTRY;
  if (!USER_REGISTRY_ADDRESS) {
    console.error("Please set NEXT_PUBLIC_USER_REGISTRY in .env file");
    process.exit(1);
  }

  const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
  const userRegistry = UserRegistry.attach(USER_REGISTRY_ADDRESS);

  console.log("\nRegistering users...");

  // Register Manufacturer
  try {
    const tx1 = await userRegistry.registerUser(
      manufacturer.address,
      2, // Manufacturer role
      "Test Manufacturer"
    );
    await tx1.wait();
    console.log("✓ Manufacturer registered");
  } catch (error) {
    console.log("Manufacturer might already be registered");
  }

  // Register Distributor
  try {
    const tx2 = await userRegistry.registerUser(
      distributor.address,
      3, // Distributor role
      "Test Distributor"
    );
    await tx2.wait();
    console.log("✓ Distributor registered");
  } catch (error) {
    console.log("Distributor might already be registered");
  }

  // Register Retailer
  try {
    const tx3 = await userRegistry.registerUser(
      retailer.address,
      4, // Retailer role
      "Test Retailer"
    );
    await tx3.wait();
    console.log("✓ Retailer registered");
  } catch (error) {
    console.log("Retailer might already be registered");
  }

  // Register Customer
  try {
    const tx4 = await userRegistry.registerUser(
      customer.address,
      5, // Customer role
      "Test Customer"
    );
    await tx4.wait();
    console.log("✓ Customer registered");
  } catch (error) {
    console.log("Customer might already be registered");
  }

  console.log("\n✓ Setup complete!");
  console.log("\nYou can now use these accounts in MetaMask:");
  console.log("1. Import the private keys into MetaMask");
  console.log("2. Connect to localhost:8545 network");
  console.log("3. Use the respective accounts for each role");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

