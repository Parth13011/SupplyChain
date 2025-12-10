const hre = require("hardhat");

/**
 * Deploy SimpleToken (ERC-20) to network
 * Usage:
 *   Local: hardhat run scripts/deploy-token.js --network localhost
 *   Custom: hardhat run scripts/deploy-token.js --network custom
 */
async function main() {
  const network = hre.network.name;
  console.log(`🚀 Deploying SimpleToken to ${network} network...\n`);

  // Token configuration
  const tokenName = "SupplyChain Token";
  const tokenSymbol = "SCT";
  const tokenDecimals = 18;
  const initialSupply = 1000000; // 1 million tokens

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy token
  console.log("Deploying SimpleToken...");
  console.log(`  Name: ${tokenName}`);
  console.log(`  Symbol: ${tokenSymbol}`);
  console.log(`  Decimals: ${tokenDecimals}`);
  console.log(`  Initial Supply: ${initialSupply} ${tokenSymbol}\n`);

  const SimpleToken = await hre.ethers.getContractFactory("SimpleToken");
  
  let token;
  if (network === "custom") {
    // Use gas price for custom network
    const feeData = await deployer.provider.getFeeData();
    const gasPrice = feeData.gasPrice ? feeData.gasPrice * 2n : 2000000000n;
    token = await SimpleToken.deploy(
      tokenName,
      tokenSymbol,
      tokenDecimals,
      initialSupply,
      { gasPrice }
    );
    const deployTx = token.deploymentTransaction();
    if (deployTx) {
      console.log("  📝 Transaction hash:", deployTx.hash);
      console.log("  🔗 View on explorer: https://explorer.didlab.org/tx/" + deployTx.hash);
      console.log("  ⏳ Waiting for confirmation...");
      try {
        const receipt = await deployTx.wait(1);
        console.log("  ✅ Transaction confirmed! Block:", receipt.blockNumber);
      } catch (error) {
        console.log("  ⚠️  Still waiting for confirmation...");
      }
    }
  } else {
    token = await SimpleToken.deploy(
      tokenName,
      tokenSymbol,
      tokenDecimals,
      initialSupply
    );
  }

  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  console.log("\n✅ SimpleToken deployed successfully!");
  console.log("Token Address:", tokenAddress);
  
  if (network === "custom") {
    console.log("🔗 Explorer:", `https://explorer.didlab.org/address/${tokenAddress}`);
  }

  // Verify deployment
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const totalSupply = await token.totalSupply();
  const deployerBalance = await token.balanceOf(deployer.address);

  console.log("\n=== Token Details ===");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Decimals:", decimals);
  console.log("Total Supply:", hre.ethers.formatEther(totalSupply), symbol);
  console.log("Deployer Balance:", hre.ethers.formatEther(deployerBalance), symbol);

  console.log("\n=== Next Steps ===");
  console.log("1. Copy the token address to your ERC-20 DApp HTML file");
  console.log("2. Open the HTML file in a browser (or serve with: python3 -m http.server 8000)");
  console.log("3. Connect MetaMask and interact with your token!");
  console.log("\nToken Address for DApp:", tokenAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



