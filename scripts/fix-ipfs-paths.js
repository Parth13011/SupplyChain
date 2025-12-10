const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

/**
 * Fix absolute paths in Next.js static export for IPFS compatibility
 * Converts /_next/ to ./_next/ in all HTML and JS files
 */

async function fixIPFSPaths() {
  console.log('🔧 Fixing paths for IPFS compatibility...\n');
  
  const outDir = path.join(__dirname, '..', 'out');
  
  if (!fs.existsSync(outDir)) {
    console.error('❌ Error: "out" directory not found!');
    console.error('Please run "npm run build:ipfs" first.');
    process.exit(1);
  }

  // Find all HTML and JS files
  const htmlFiles = await glob('**/*.{html,js}', {
    cwd: outDir,
    nodir: true,
  });

  let fixedCount = 0;

  for (const file of htmlFiles) {
    const filePath = path.join(outDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace absolute paths with relative paths
    // /_next/ -> ./_next/
    // /_next -> ./_next
    const patterns = [
      { from: /"\/_next\//g, to: '"./_next/' },
      { from: /'\/_next\//g, to: "'./_next/" },
      { from: /href="\/_next\//g, to: 'href="./_next/' },
      { from: /src="\/_next\//g, to: 'src="./_next/' },
      { from: /url\("\/_next\//g, to: 'url("./_next/' },
      { from: /url\('\/_next\//g, to: "url('./_next/" },
      { from: /\/_next\//g, to: './_next/' },
    ];

    for (const pattern of patterns) {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedCount++;
      console.log(`  ✓ Fixed paths in: ${file}`);
    }
  }

  console.log(`\n✅ Fixed paths in ${fixedCount} files`);
  console.log('📦 Ready for IPFS deployment!\n');
}

fixIPFSPaths().catch(console.error);




