const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Deploy Next.js static export to IPFS using DIDLab gateway
 * 
 * Usage: node scripts/deploy-to-ipfs.js
 * 
 * Requirements:
 * - Build the app first: npm run build:ipfs
 * - Have IPFS gateway URL configured (default: https://ipfs.didlab.org)
 */

const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'https://ipfs.didlab.org';
const IPFS_API = process.env.IPFS_API || 'https://ipfs.didlab.org/api/v0';

async function deployToIPFS() {
  console.log('🚀 Starting IPFS Deployment...\n');
  
  const outDir = path.join(__dirname, '..', 'out');
  
  // Check if out directory exists
  if (!fs.existsSync(outDir)) {
    console.error('❌ Error: "out" directory not found!');
    console.error('Please run "npm run build:ipfs" first to build the static export.');
    process.exit(1);
  }

  try {
    // Initialize IPFS client (using dynamic import for ES module)
    console.log('📡 Connecting to IPFS gateway:', IPFS_API);
    const { create } = await import('ipfs-http-client');
    const ipfs = create({
      url: IPFS_API,
    });

    // Get all files from out directory
    console.log('📦 Collecting files from build directory...');
    const files = await glob('**/*', {
      cwd: outDir,
      nodir: true,
      ignore: ['**/.DS_Store', '**/Thumbs.db'],
    });

    console.log(`Found ${files.length} files to upload\n`);

    // Prepare files for IPFS
    const filesToAdd = files.map(file => ({
      path: file,
      content: fs.readFileSync(path.join(outDir, file)),
    }));

    // Add files to IPFS with directory wrapping
    console.log('⬆️  Uploading files to IPFS...');
    let rootCid = null;
    
    // Upload with directory wrapping to get a single root CID
    for await (const result of ipfs.addAll(filesToAdd, {
      pin: true,
      wrapWithDirectory: true,
    })) {
      if (result.path === '') {
        // Empty path means it's the root directory
        rootCid = result.cid.toString();
        console.log(`  ✓ Root directory → CID: ${rootCid}`);
      } else {
        console.log(`  ✓ ${result.path} → CID: ${result.cid.toString()}`);
      }
    }
    
    if (!rootCid) {
      console.error('❌ Could not determine root CID');
      process.exit(1);
    }

    const ipfsUrl = `${IPFS_GATEWAY}/ipfs/${rootCid}`;
    const ipnsUrl = `${IPFS_GATEWAY}/ipns/${rootCid}`;

    console.log('\n✅ Deployment Complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Deployment Information:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Root CID: ${rootCid}`);
    console.log(`\n🌐 Access your app at:`);
    console.log(`   IPFS: ${ipfsUrl}`);
    console.log(`   IPNS: ${ipnsUrl}`);
    console.log(`\n🔗 DIDLab Gateway:`);
    console.log(`   ${ipfsUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Save deployment info
    const deploymentInfo = {
      cid: rootCid,
      ipfsUrl,
      ipnsUrl,
      gateway: IPFS_GATEWAY,
      deployedAt: new Date().toISOString(),
      files: files.length,
    };

    fs.writeFileSync(
      path.join(__dirname, 'ipfs-deployment.json'),
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('💾 Deployment info saved to: ipfs-deployment.json\n');
    console.log('📝 Next steps:');
    console.log('   1. Test your app at the IPFS URL above');
    console.log('   2. Share the IPFS URL with users');
    console.log('   3. Consider pinning the content for long-term availability\n');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}


// Run deployment
if (require.main === module) {
  deployToIPFS().catch(console.error);
}

module.exports = { deployToIPFS };

