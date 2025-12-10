const hre = require("hardhat");

/**
 * Manually register a user (more reliable than frontend)
 * Usage: 
 *   USER_ADDRESS=0x... USER_NAME="Name" USER_ROLE=3 npx hardhat run scripts/register-user-manual.js --network custom
 */
async function main() {
  const userRegistryAddress = "0x703922e870B095FDfc2b4b0D37d71228356fD3Cb";
  
  // Get from environment or use defaults
  const userAddress = process.env.USER_ADDRESS || "0xe725a54af02a3c964e71047132b7db5d78c9e06e";
  const userName = process.env.USER_NAME || "Test Distributor";
  const userRole = Number(process.env.USER_ROLE) || 3; // 2=Manufacturer, 3=Distributor, 4=Retailer, 5=Customer

  const roleNames = ["None", "Government", "Manufacturer", "Distributor", "Retailer", "Customer"];

  console.log("🔐 Registering User...\n");
  console.log("User Address:", userAddress);
  console.log("User Name:", userName);
  console.log("Role:", roleNames[userRole], `(${userRole})`);
  console.log("UserRegistry:", userRegistryAddress, "\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Registering with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
  const userRegistry = UserRegistry.attach(userRegistryAddress);

  // Check if already registered
  try {
    const isRegistered = await userRegistry.isUserRegistered(userAddress);
    if (isRegistered) {
      const user = await userRegistry.getUser(userAddress);
      console.log("⚠️  User is already registered!");
      console.log("Current Role:", roleNames[Number(user.role)]);
      console.log("Name:", user.name);
      process.exit(0);
    }
  } catch (error) {
    console.log("Checking registration status...");
  }

  try {
    console.log("Sending registration transaction...");
    
    // Use explicit gas settings
    const feeData = await deployer.provider.getFeeData();
    const gasPrice = feeData.gasPrice ? feeData.gasPrice * 2n : 2000000000n;
    
    const tx = await userRegistry.registerUser(userAddress, userRole, userName, {
      gasLimit: 200000,
      gasPrice: gasPrice
    });
    
    console.log("📝 Transaction hash:", tx.hash);
    console.log("🔗 View on explorer: https://explorer.didlab.org/tx/" + tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait(1);
    console.log("✅ Transaction confirmed! Block:", receipt.blockNumber);
    console.log("\n✅ User registered successfully!");
    console.log(`${userName} is now registered as ${roleNames[userRole]}`);
    
  } catch (error) {
    console.error("\n❌ Registration failed!");
    console.error("Error:", error.message);
    
    if (error.message.includes("already registered")) {
      console.error("\n💡 User is already registered. Try a different address.");
    } else if (error.message.includes("Only Government")) {
      console.error("\n💡 Make sure you're using the Government account (deployer).");
    } else if (error.message.includes("gas") || error.message.includes("RPC")) {
      console.error("\n💡 Network/RPC issue. Try:");
      console.error("1. Wait a few seconds and try again");
      console.error("2. Check network connection");
      console.error("3. Verify RPC endpoint is accessible");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

