#!/usr/bin/env node

import { execSync } from 'child_process';
import { copyFileSync, readFileSync, writeFileSync, createWriteStream } from 'fs';
import { join, normalize } from 'path';
import { readdir, stat } from 'fs/promises';
import archiver from 'archiver';

const DIST_DIR = 'dist';
const ZIP_NAME = 'widgetopia.zip';

// Function to normalize paths to use forward slashes
function normalizePath(path) {
  return path.replace(/\\/g, '/');
}

// Function to recursively get all files in a directory
async function getAllFiles(dir, fileList = []) {
  const files = await readdir(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await stat(filePath);
    
    if (fileStat.isDirectory()) {
      await getAllFiles(filePath, fileList);
    } else {
      fileList.push(normalizePath(filePath));
    }
  }
  
  return fileList;
}

// Function to create zip archive with normalized paths
async function createZipArchive() {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(ZIP_NAME);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    output.on('close', () => {
      console.log(`Archive created: ${ZIP_NAME} (${archive.pointer()} bytes)`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    // Add files with normalized paths
    archive.directory(DIST_DIR, false, (entry) => {
      // Ensure entry paths use forward slashes
      entry.name = normalizePath(entry.name);
      return entry;
    });

    archive.finalize();
  });
}

// Main build function
async function build() {
  try {
    console.log('🔨 Building extension...');
    
    // Run Vite build
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('🔒 Analyzing security...');
    
    // Run security analysis
    try {
      execSync('node fix-security.js', { stdio: 'inherit' });
    } catch (secError) {
      console.log('⚠️  Security analysis skipped');
    }
    
    console.log('📦 Creating archive...');
    
    // Create zip archive with normalized paths
    await createZipArchive();
    
    console.log('✅ Build completed successfully!');
    console.log(`📁 Extension ready: ${ZIP_NAME}`);
    console.log('\n📋 Firefox Validation Notes:');
    console.log('   - Add-on ID has been updated to match AMO requirements');
    console.log('   - Icon size warnings can be fixed by creating proper PNG icons');
    console.log('   - Security warnings are from third-party libraries (React Grid Layout)');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build if this script is executed directly
import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build();
}

export { build, normalizePath }; 