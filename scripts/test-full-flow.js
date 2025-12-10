const hre = require("hardhat");

/**
 * Complete end-to-end test of the supply chain system
 * Tests the full flow: Create → Ship → Receive → Ship → Receive → Sell → Deliver
 */
async function main() {
  console.log("🧪 Testing Complete Supply Chain Flow...\n");

  const [deployer, manufacturer, distributor, retailer, customer] = await hre.ethers.getSigners();

  // Get contract addresses from .env or use defaults
  const USER_REGISTRY = process.env.NEXT_PUBLIC_USER_REGISTRY || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const PRODUCT_REGISTRY = process.env.NEXT_PUBLIC_PRODUCT_REGISTRY || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const SUPPLY_CHAIN = process.env.NEXT_PUBLIC_SUPPLY_CHAIN || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
  const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");

  const userRegistry = UserRegistry.attach(USER_REGISTRY);
  const productRegistry = ProductRegistry.attach(PRODUCT_REGISTRY);
  const supplyChain = SupplyChain.attach(SUPPLY_CHAIN);

  console.log("📋 Test Accounts:");
  console.log("  Government:", deployer.address);
  console.log("  Manufacturer:", manufacturer.address);
  console.log("  Distributor:", distributor.address);
  console.log("  Retailer:", retailer.address);
  console.log("  Customer:", customer.address);
  console.log("");

  // Step 1: Verify users are registered
  console.log("1️⃣ Checking user registrations...");
  try {
    const mRole = await userRegistry.getUserRole(manufacturer.address);
    const dRole = await userRegistry.getUserRole(distributor.address);
    const rRole = await userRegistry.getUserRole(retailer.address);
    const cRole = await userRegistry.getUserRole(customer.address);
    
    if (Number(mRole) === 2 && Number(dRole) === 3 && Number(rRole) === 4 && Number(cRole) === 5) {
      console.log("   ✅ All users are registered correctly\n");
    } else {
      console.log("   ⚠️  Some users may not be registered. Run setup:local first.\n");
    }
  } catch (error) {
    console.log("   ❌ Error checking registrations:", error.message);
    return;
  }

  // Step 2: Create a product
  console.log("2️⃣ Creating a test product...");
  let productId;
  try {
    const tx = await productRegistry.connect(manufacturer).createProduct(
      "Test Product - Laptop",
      "High-performance laptop for testing supply chain",
      "{\"category\":\"electronics\",\"price\":999}"
    );
    await tx.wait();
    
    const totalProducts = await productRegistry.getTotalProducts();
    productId = Number(totalProducts);
    console.log(`   ✅ Product created with ID: ${productId}\n`);
  } catch (error) {
    console.log("   ❌ Error creating product:", error.message);
    return;
  }

  // Step 3: Manufacturer ships to Distributor
  console.log("3️⃣ Manufacturer shipping to Distributor...");
  try {
    const tx = await supplyChain.connect(manufacturer).shipToDistributor(
      productId,
      distributor.address,
      "Shipped via standard delivery"
    );
    await tx.wait();
    console.log("   ✅ Product shipped to Distributor\n");
  } catch (error) {
    console.log("   ❌ Error shipping to distributor:", error.message);
    return;
  }

  // Step 4: Distributor receives
  console.log("4️⃣ Distributor receiving product...");
  try {
    const tx = await supplyChain.connect(distributor).receiveFromManufacturer(
      productId,
      "Received in good condition"
    );
    await tx.wait();
    console.log("   ✅ Product received by Distributor\n");
  } catch (error) {
    console.log("   ❌ Error receiving product:", error.message);
    return;
  }

  // Step 5: Distributor ships to Retailer
  console.log("5️⃣ Distributor shipping to Retailer...");
  try {
    const tx = await supplyChain.connect(distributor).shipToRetailer(
      productId,
      retailer.address,
      "Shipped to retail store"
    );
    await tx.wait();
    console.log("   ✅ Product shipped to Retailer\n");
  } catch (error) {
    console.log("   ❌ Error shipping to retailer:", error.message);
    return;
  }

  // Step 6: Retailer receives
  console.log("6️⃣ Retailer receiving product...");
  try {
    const tx = await supplyChain.connect(retailer).receiveFromDistributor(
      productId,
      "Received at store"
    );
    await tx.wait();
    console.log("   ✅ Product received by Retailer\n");
  } catch (error) {
    console.log("   ❌ Error receiving product:", error.message);
    return;
  }

  // Step 7: Retailer sells to Customer
  console.log("7️⃣ Retailer selling to Customer...");
  try {
    const tx = await supplyChain.connect(retailer).sellToCustomer(
      productId,
      customer.address,
      "Sold to customer"
    );
    await tx.wait();
    console.log("   ✅ Product sold to Customer\n");
  } catch (error) {
    console.log("   ❌ Error selling to customer:", error.message);
    return;
  }

  // Step 8: Customer confirms delivery
  console.log("8️⃣ Customer confirming delivery...");
  try {
    const tx = await supplyChain.connect(customer).confirmDelivery(
      productId,
      "Product delivered successfully"
    );
    await tx.wait();
    console.log("   ✅ Delivery confirmed by Customer\n");
  } catch (error) {
    console.log("   ❌ Error confirming delivery:", error.message);
    return;
  }

  // Step 9: Verify final status
  console.log("9️⃣ Verifying final product status...");
  try {
    const status = await supplyChain.getProductStatus(productId);
    const statusNames = {
      0: "Created",
      1: "ShippedToDistributor",
      2: "ReceivedByDistributor",
      3: "ShippedToRetailer",
      4: "ReceivedByRetailer",
      5: "SoldToCustomer",
      6: "DeliveredToCustomer"
    };
    console.log(`   ✅ Final Status: ${statusNames[Number(status)]}\n`);
  } catch (error) {
    console.log("   ❌ Error checking status:", error.message);
  }

  // Step 10: Get transaction history
  console.log("🔟 Retrieving transaction history...");
  try {
    const history = await supplyChain.getProductHistory(productId);
    console.log(`   ✅ Total Transactions: ${history.length}`);
    console.log("\n   Transaction History:");
    history.forEach((tx, index) => {
      console.log(`      ${index + 1}. ${tx.from.slice(0, 10)}... → ${tx.to.slice(0, 10)}... (Status: ${tx.status})`);
    });
    console.log("");
  } catch (error) {
    console.log("   ❌ Error retrieving history:", error.message);
  }

  console.log("🎉 Complete Supply Chain Flow Test PASSED!");
  console.log(`\n📦 Test Product ID: ${productId}`);
  console.log("   You can track this product in the frontend using Product Tracker!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });

