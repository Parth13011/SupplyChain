const hre = require("hardhat");

/**
 * Quick check if network is accessible and responsive
 */
async function main() {
  console.log("🔍 Checking Custom Network Status...\n");

  try {
    const provider = new hre.ethers.JsonRpcProvider("https://eth.didlab.org");
    
    console.log("⏳ Connecting to network...");
    const startTime = Date.now();
    
    const blockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();
    const gasPrice = await provider.getFeeData();
    
    const endTime = Date.now();
    const responseTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log("✅ Network is accessible!");
    console.log("   Response time:", responseTime, "seconds");
    console.log("   Chain ID:", Number(network.chainId));
    console.log("   Current Block:", blockNumber);
    console.log("   Gas Price:", hre.ethers.formatUnits(gasPrice.gasPrice || 0n, "gwei"), "gwei");
    
    // Check account balance
    if (process.env.PRIVATE_KEY) {
      const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const balance = await provider.getBalance(wallet.address);
      const balanceInEth = hre.ethers.formatEther(balance);
      
      console.log("\n💰 Your Wallet:");
      console.log("   Address:", wallet.address);
      console.log("   Balance:", balanceInEth, "TT");
      
      if (Number(balanceInEth) < 0.01) {
        console.log("\n⚠️  WARNING: Low balance!");
        console.log("   Get tokens from: https://faucet.didlab.org");
      } else {
        console.log("   ✅ Sufficient balance for deployment");
      }
    }
    
    console.log("\n✅ Network is ready for deployment!");
    console.log("   Deployment may take 2-5 minutes per contract.");
    
  } catch (error) {
    console.error("❌ Network Error:", error.message);
    console.log("\n💡 Possible issues:");
    console.log("   - Network is slow or unreachable");
    console.log("   - Check your internet connection");
    console.log("   - Try again in a few moments");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

