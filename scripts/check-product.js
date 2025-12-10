const hre = require("hardhat");

/**
 * Check product details and verify manufacturer
 * Usage: npx hardhat run scripts/check-product.js --network custom
 */
async function main() {
  const productRegistryAddress = process.env.PRODUCT_REGISTRY || "0x5F7DBD43a77407adA1f3DBD2803d3B21E8Bc0531";
  const productId = process.env.PRODUCT_ID || "1";
  
  console.log("🔍 Checking Product Details...\n");
  console.log("Product ID:", productId);
  console.log("ProductRegistry:", productRegistryAddress, "\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Checking with account:", deployer.address);
  console.log("Network:", hre.network.name, "\n");

  try {
    const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
    const productRegistry = ProductRegistry.attach(productRegistryAddress);

    // Check if product exists
    const exists = await productRegistry.productExists(productId);
    if (!exists) {
      console.log("❌ Product does not exist!");
      process.exit(1);
    }

    // Get product details
    const product = await productRegistry.getProduct(productId);
    
    console.log("✅ Product Found!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Product ID:", product.productId.toString());
    console.log("Name:", product.name);
    console.log("Description:", product.description);
    console.log("Metadata:", product.metadata);
    console.log("Manufacturer:", product.manufacturer);
    console.log("Created At:", new Date(Number(product.createdAt) * 1000).toLocaleString());
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Get all products by this manufacturer
    const manufacturerProducts = await productRegistry.getProductsByManufacturer(product.manufacturer);
    console.log(`📦 Products by Manufacturer (${product.manufacturer}):`);
    console.log("Total products:", manufacturerProducts.length);
    if (manufacturerProducts.length > 0) {
      console.log("Product IDs:", manufacturerProducts.map(id => id.toString()).join(", "));
    }
    console.log();

    // Get total products
    const totalProducts = await productRegistry.getTotalProducts();
    console.log("📊 Total Products in Registry:", totalProducts.toString());
    console.log();

    // Check if the current account matches the manufacturer
    if (product.manufacturer.toLowerCase() === deployer.address.toLowerCase()) {
      console.log("✅ Your account matches the manufacturer!");
    } else {
      console.log("⚠️  Your account does NOT match the manufacturer!");
      console.log("   Your address:", deployer.address);
      console.log("   Manufacturer:", product.manufacturer);
      console.log("\n💡 To see this product in your dashboard:");
      console.log("   1. Make sure you're connected with the manufacturer address");
      console.log("   2. Or check the Product Browser to see all products");
    }

  } catch (error) {
    console.error("❌ Error checking product:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });








