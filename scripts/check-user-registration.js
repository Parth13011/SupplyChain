const hre = require("hardhat");

/**
 * Check if a user is already registered
 */
async function main() {
  const userRegistryAddress = "0x703922e870B095FDfc2b4b0D37d71228356fD3Cb";
  // Get address from environment variable or use the one from error
  const userAddress = process.env.USER_ADDRESS || "0xe725a54af02a3c964e71047132b7db5d78c9e06e";

  if (!userAddress || userAddress === "0x") {
    console.log("Usage: USER_ADDRESS=0x... npx hardhat run scripts/check-user-registration.js --network custom");
    console.log("Example: USER_ADDRESS=0xe725a54af02a3c964e71047132b7db5d78c9e06e npx hardhat run scripts/check-user-registration.js --network custom");
    process.exit(1);
  }

  console.log("🔍 Checking user registration...\n");
  console.log("User Address:", userAddress);
  console.log("UserRegistry:", userRegistryAddress, "\n");

  try {
    const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
    const userRegistry = UserRegistry.attach(userRegistryAddress);

    const isRegistered = await userRegistry.isUserRegistered(userAddress);
    console.log("Is Registered:", isRegistered);

    if (isRegistered) {
      const user = await userRegistry.getUser(userAddress);
      const roleNames = ["None", "Government", "Manufacturer", "Distributor", "Retailer", "Customer"];
      console.log("\n✅ User is already registered!");
      console.log("Role:", roleNames[Number(user.role)]);
      console.log("Name:", user.name);
      console.log("Registered At:", new Date(Number(user.registeredAt) * 1000).toLocaleString());
    } else {
      console.log("\n❌ User is NOT registered");
      console.log("You can proceed with registration");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("network")) {
      console.error("\n⚠️  Network connection issue. Check:");
      console.error("1. RPC endpoint is accessible: https://eth.didlab.org");
      console.error("2. You're connected to Chain ID 252501");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

