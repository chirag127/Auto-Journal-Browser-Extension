// Auto-Journal - Extension Packaging Script
// Script to package the extension for distribution

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Configuration
const config = {
  extensionDir: path.join(__dirname, 'extension'),
  outputDir: path.join(__dirname, 'dist'),
  outputFile: 'auto-journal-extension.zip',
  filesToInclude: [
    'manifest.json',
    'background.js',
    'content.js',
    'popup.html',
    'popup.js',
    'styles.css',
    'icons/**/*',
    'utils/**/*',
    'components/**/*'
  ]
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Create a file to stream archive data to
const output = fs.createWriteStream(path.join(config.outputDir, config.outputFile));
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

// Listen for all archive data to be written
output.on('close', function() {
  console.log(`Extension packaged successfully: ${archive.pointer()} total bytes`);
  console.log(`Output file: ${path.join(config.outputDir, config.outputFile)}`);
});

// Handle warnings and errors
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('Warning:', err);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  throw err;
});

// Pipe archive data to the file
archive.pipe(output);

// Add files to the archive
config.filesToInclude.forEach(pattern => {
  // Check if pattern includes a wildcard
  if (pattern.includes('*')) {
    // Get the directory part of the pattern
    const dirPart = pattern.split('*')[0];
    const fullDirPath = path.join(config.extensionDir, dirPart);
    
    // Add directory contents
    archive.directory(fullDirPath, dirPart);
  } else {
    // Add individual file
    const filePath = path.join(config.extensionDir, pattern);
    
    if (fs.existsSync(filePath)) {
      if (fs.statSync(filePath).isDirectory()) {
        // Add directory
        archive.directory(filePath, pattern);
      } else {
        // Add file
        archive.file(filePath, { name: pattern });
      }
    } else {
      console.warn(`Warning: File not found: ${filePath}`);
    }
  }
});

// Finalize the archive
archive.finalize();
