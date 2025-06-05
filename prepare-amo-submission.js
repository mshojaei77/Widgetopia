#!/usr/bin/env node

/**
 * AMO Source Code Submission Preparation Script
 * Creates a clean source code package for Mozilla Add-on review
 */

import { createWriteStream, existsSync } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import archiver from 'archiver';

const SOURCE_PACKAGE_NAME = 'widgetopia-source.zip';

// Files and directories to include in source package
const INCLUDE_PATTERNS = [
  'src/',
  'public/',
  'package.json',
  'package-lock.json',
  'vite.config.ts',
  'tsconfig.json',
  'manifest.json',
  'index.html',
  'index.ts',
  'build-extension.js',
  'fix-security.js',
  'verify-build.js',
  'AMO_BUILD_README.md',
  'create-icons.js',
  'create-png-icons.js',
  'LICENSE'
];

// Files and directories to exclude
const EXCLUDE_PATTERNS = [
  'node_modules/',
  'dist/',
  '.git/',
  '.github/',
  'tests/',
  'docs/',
  'widgetopia.zip',
  'bun.lockb',
  '.gitignore',
  'README.md', // Include only AMO-specific README
  'CONTRIBUTING.md',
  'download-wallpapers.ps1'
];

function shouldIncludeFile(filePath) {
  // Check if file matches include patterns
  const isIncluded = INCLUDE_PATTERNS.some(pattern => {
    if (pattern.endsWith('/')) {
      return filePath.startsWith(pattern);
    }
    return filePath === pattern || filePath.endsWith('/' + pattern);
  });
  
  if (!isIncluded) return false;
  
  // Check if file matches exclude patterns
  const isExcluded = EXCLUDE_PATTERNS.some(pattern => {
    if (pattern.endsWith('/')) {
      return filePath.startsWith(pattern);
    }
    return filePath === pattern || filePath.includes('/' + pattern);
  });
  
  return !isExcluded;
}

async function getAllFiles(dir, fileList = [], baseDir = '') {
  const files = await readdir(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const relativePath = baseDir ? join(baseDir, file) : file;
    const fileStat = await stat(filePath);
    
    if (fileStat.isDirectory()) {
      await getAllFiles(filePath, fileList, relativePath);
    } else {
      if (shouldIncludeFile(relativePath)) {
        fileList.push({ fullPath: filePath, relativePath });
      }
    }
  }
  
  return fileList;
}

async function createSourcePackage() {
  return new Promise(async (resolve, reject) => {
    console.log('📦 Preparing AMO source code submission package...\n');
    
    const output = createWriteStream(SOURCE_PACKAGE_NAME);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    output.on('close', () => {
      const sizeMB = (archive.pointer() / (1024 * 1024)).toFixed(2);
      console.log(`\n✅ Source package created: ${SOURCE_PACKAGE_NAME}`);
      console.log(`📊 Package size: ${sizeMB} MB`);
      console.log(`📁 Total files included: ${archive.pointer() > 0 ? 'Multiple' : '0'}`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.on('entry', (entry) => {
      console.log(`  ✓ ${entry.name}`);
    });

    archive.pipe(output);

    try {
      // Get all files to include
      const filesToInclude = await getAllFiles('.');
      
      console.log('📋 Including files:');
      
      // Add files to archive
      for (const file of filesToInclude) {
        archive.file(file.fullPath, { name: file.relativePath.replace(/\\/g, '/') });
      }
      
      // Add directories explicitly
      console.log('📁 Including directories:');
      if (existsSync('src')) {
        archive.directory('src/', 'src/');
        console.log('  ✓ src/ (complete directory)');
      }
      if (existsSync('public')) {
        archive.directory('public/', 'public/');
        console.log('  ✓ public/ (complete directory)');
      }

      await archive.finalize();
    } catch (error) {
      reject(error);
    }
  });
}

async function validateSourcePackage() {
  console.log('\n🔍 Validating source package...');
  
  const requiredFiles = [
    'package.json',
    'package-lock.json',
    'vite.config.ts',
    'manifest.json',
    'AMO_BUILD_README.md',
    'build-extension.js',
    'verify-build.js'
  ];
  
  // This is a basic validation - in a real scenario, you'd extract and check the zip
  let allRequiredPresent = true;
  
  for (const file of requiredFiles) {
    if (existsSync(file)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ Missing: ${file}`);
      allRequiredPresent = false;
    }
  }
  
  return allRequiredPresent;
}

async function main() {
  try {
    console.log('🚀 AMO Source Code Submission Preparation');
    console.log('==========================================\n');
    
    // Validate required files exist
    const isValid = await validateSourcePackage();
    if (!isValid) {
      console.error('\n❌ Missing required files for AMO submission!');
      process.exit(1);
    }
    
    // Create source package
    await createSourcePackage();
    
    console.log('\n==========================================');
    console.log('✅ AMO source package preparation complete!');
    console.log('\n📋 Next steps:');
    console.log(`   1. Upload ${SOURCE_PACKAGE_NAME} to AMO as source code`);
    console.log('   2. In AMO submission form, reference AMO_BUILD_README.md');
    console.log('   3. Mention the build command: npm run build:extension');
    console.log('   4. Note that Node 18+ and npm 9+ are required');
    console.log('\n💡 The source package includes:');
    console.log('   - All source code (src/ directory)');
    console.log('   - Build configuration and scripts');
    console.log('   - Detailed build instructions (AMO_BUILD_README.md)');
    console.log('   - Package lock file for exact dependencies');
    console.log('   - Verification script for reviewers');
    
  } catch (error) {
    console.error('\n❌ Failed to prepare AMO submission:', error.message);
    process.exit(1);
  }
}

// Run if script is executed directly
import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { createSourcePackage, validateSourcePackage }; 