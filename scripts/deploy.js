const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy UserRegistry first (Government contract)
  console.log("\n1. Deploying UserRegistry...");
  const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();
  await userRegistry.waitForDeployment();
  const userRegistryAddress = await userRegistry.getAddress();
  console.log("UserRegistry deployed to:", userRegistryAddress);

  // Deploy ProductRegistry
  console.log("\n2. Deploying ProductRegistry...");
  const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
  const productRegistry = await ProductRegistry.deploy(userRegistryAddress);
  await productRegistry.waitForDeployment();
  const productRegistryAddress = await productRegistry.getAddress();
  console.log("ProductRegistry deployed to:", productRegistryAddress);

  // Deploy SupplyChain
  console.log("\n3. Deploying SupplyChain...");
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy(userRegistryAddress, productRegistryAddress);
  await supplyChain.waitForDeployment();
  const supplyChainAddress = await supplyChain.getAddress();
  console.log("SupplyChain deployed to:", supplyChainAddress);

  console.log("\n=== Deployment Summary ===");
  console.log("UserRegistry:", userRegistryAddress);
  console.log("ProductRegistry:", productRegistryAddress);
  console.log("SupplyChain:", supplyChainAddress);

  // Auto-register default test users
  console.log("\n4. Registering default test users...");
  const [deployer, manufacturer, distributor, retailer, customer] = await hre.ethers.getSigners();

  console.log("\nDefault Test Accounts:");
  console.log("Government (Deployer):", deployer.address);
  console.log("Manufacturer:", manufacturer.address);
  console.log("Distributor:", distributor.address);
  console.log("Retailer:", retailer.address);
  console.log("Customer:", customer.address);

  try {
    // Register Manufacturer
    const tx1 = await userRegistry.registerUser(
      manufacturer.address,
      2, // Manufacturer role
      "Default Manufacturer"
    );
    await tx1.wait();
    console.log("✓ Manufacturer registered");

    // Register Distributor
    const tx2 = await userRegistry.registerUser(
      distributor.address,
      3, // Distributor role
      "Default Distributor"
    );
    await tx2.wait();
    console.log("✓ Distributor registered");

    // Register Retailer
    const tx3 = await userRegistry.registerUser(
      retailer.address,
      4, // Retailer role
      "Default Retailer"
    );
    await tx3.wait();
    console.log("✓ Retailer registered");

    // Register Customer
    const tx4 = await userRegistry.registerUser(
      customer.address,
      5, // Customer role
      "Default Customer"
    );
    await tx4.wait();
    console.log("✓ Customer registered");
  } catch (error) {
    console.log("Note: Some users might already be registered:", error.message);
  }

  // Create default products
  console.log("\n5. Creating default products...");
  try {
    const productRegistryWithManufacturer = productRegistry.connect(manufacturer);
    
    const defaultProducts = [
      {
        name: "Premium Laptop Pro X1",
        description: "High-performance gaming laptop with RTX 4090, 32GB RAM, and 1TB SSD. Perfect for gaming and professional work.",
        metadata: "SKU-LAPTOP-X1-001, Batch-2024-Q1, Warranty-2Years"
      },
      {
        name: "Smartphone Galaxy Ultra",
        description: "Latest flagship smartphone with 5G connectivity, 256GB storage, and advanced camera system.",
        metadata: "SKU-PHONE-GALAXY-001, Batch-2024-Q1, Color-MidnightBlack"
      },
      {
        name: "Wireless Headphones Elite",
        description: "Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality.",
        metadata: "SKU-HEADPHONES-ELITE-001, Batch-2024-Q1, Model-Pro"
      },
      {
        name: "Smart Watch Series 8",
        description: "Advanced fitness tracking smartwatch with heart rate monitor, GPS, and 7-day battery life.",
        metadata: "SKU-WATCH-S8-001, Batch-2024-Q1, Size-42mm"
      },
      {
        name: "4K Ultra HD TV 65\"",
        description: "65-inch 4K Smart TV with HDR support, voice control, and streaming capabilities.",
        metadata: "SKU-TV-65-4K-001, Batch-2024-Q1, Panel-QLED"
      }
    ];

    for (let i = 0; i < defaultProducts.length; i++) {
      const product = defaultProducts[i];
      const tx = await productRegistryWithManufacturer.createProduct(
        product.name,
        product.description,
        product.metadata
      );
      await tx.wait();
      console.log(`✓ Created product #${i + 1}: ${product.name}`);
    }
    
    console.log(`\n✅ Created ${defaultProducts.length} default products!`);
    console.log("Users can now search and track these products by their Product ID.");
  } catch (error) {
    console.log("Note: Error creating default products:", error.message);
    console.log("You can create products manually through the Manufacturer Dashboard.");
  }

  console.log("\n=== Setup Complete ===");
  console.log("\nCopy these addresses to your .env file:");
  console.log(`NEXT_PUBLIC_USER_REGISTRY=${userRegistryAddress}`);
  console.log(`NEXT_PUBLIC_PRODUCT_REGISTRY=${productRegistryAddress}`);
  console.log(`NEXT_PUBLIC_SUPPLY_CHAIN=${supplyChainAddress}`);
  console.log("\n✅ Default users and products are now registered!");
  console.log("You can connect with any of the test accounts in MetaMask.");
  console.log("\n📦 Default Products Created:");
  console.log("   Product #1: Premium Laptop Pro X1");
  console.log("   Product #2: Smartphone Galaxy Ultra");
  console.log("   Product #3: Wireless Headphones Elite");
  console.log("   Product #4: Smart Watch Series 8");
  console.log("   Product #5: 4K Ultra HD TV 65\"");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

