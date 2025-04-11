// Auto-Journal - Icon Conversion Script
// Converts SVG icon to multiple PNG sizes for browser extension

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const config = {
  svgPath: path.join(__dirname, 'extension', 'icons', 'icon.svg'),
  outputDir: path.join(__dirname, 'extension', 'icons'),
  sizes: [16, 48, 128]
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
  console.log(`Created output directory: ${config.outputDir}`);
}

// Check if SVG file exists
if (!fs.existsSync(config.svgPath)) {
  console.error(`Error: SVG file not found at ${config.svgPath}`);
  process.exit(1);
}

// Convert SVG to PNG for each size
async function convertIcons() {
  console.log('Starting icon conversion...');
  
  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(config.svgPath);
    
    // Process each size
    for (const size of config.sizes) {
      const outputPath = path.join(config.outputDir, `icon${size}.png`);
      
      // Convert SVG to PNG with sharp
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Created icon${size}.png`);
    }
    
    console.log('Icon conversion completed successfully!');
    
    // Update manifest.json with icon paths
    updateManifest();
    
  } catch (error) {
    console.error('Error converting icons:', error);
    process.exit(1);
  }
}

// Update manifest.json with icon paths
function updateManifest() {
  const manifestPath = path.join(__dirname, 'extension', 'manifest.json');
  
  try {
    // Read manifest.json
    const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Update icons
    manifestData.icons = {};
    manifestData.action.default_icon = {};
    
    // Add each size to both icon objects
    for (const size of config.sizes) {
      manifestData.icons[size] = `icons/icon${size}.png`;
      manifestData.action.default_icon[size] = `icons/icon${size}.png`;
    }
    
    // Write updated manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
    console.log('Updated manifest.json with icon paths');
    
  } catch (error) {
    console.error('Error updating manifest.json:', error);
  }
}

// Run the conversion
convertIcons();
