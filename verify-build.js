#!/usr/bin/env node

/**
 * Build Verification Script for AMO Review
 * This script helps verify that the built extension matches the submitted version
 */

import { existsSync, statSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const DIST_DIR = 'dist';
const REQUIRED_FILES = [
  'manifest.json',
  'index.html',
  'assets',
  'icons',
  'wallpapers'
];

function checkFileExists(filePath) {
  const fullPath = join(DIST_DIR, filePath);
  if (!existsSync(fullPath)) {
    console.error(`❌ Missing required file: ${filePath}`);
    return false;
  }
  console.log(`✅ Found: ${filePath}`);
  return true;
}

function checkBuildDirectory() {
  console.log('🔍 Checking build directory structure...\n');
  
  if (!existsSync(DIST_DIR)) {
    console.error(`❌ Build directory '${DIST_DIR}' does not exist!`);
    console.log('Run "npm run build:extension" first.');
    return false;
  }

  let allFilesPresent = true;
  REQUIRED_FILES.forEach(file => {
    if (!checkFileExists(file)) {
      allFilesPresent = false;
    }
  });

  return allFilesPresent;
}

function checkManifestVersion() {
  console.log('\n📋 Checking manifest version...');
  
  try {
    const manifestPath = join(DIST_DIR, 'manifest.json');
    const manifestContent = readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    console.log(`✅ Extension Name: ${manifest.name}`);
    console.log(`✅ Version: ${manifest.version}`);
    console.log(`✅ Manifest Version: ${manifest.manifest_version}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error reading manifest:', error.message);
    return false;
  }
}

function checkBuildSize() {
  console.log('\n📦 Checking build size...');
  
  try {
    const stats = statSync(DIST_DIR);
    console.log(`✅ Build directory exists`);
    
    // Check if zip file exists
    if (existsSync('widgetopia.zip')) {
      const zipStats = statSync('widgetopia.zip');
      const sizeMB = (zipStats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ Extension package: widgetopia.zip (${sizeMB} MB)`);
    } else {
      console.log('⚠️  Extension package (widgetopia.zip) not found');
      console.log('   Run "npm run build:extension" to create it');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking build size:', error.message);
    return false;
  }
}

function runBuildVerification() {
  console.log('🔨 Widgetopia Build Verification Script');
  console.log('=====================================\n');
  
  const checks = [
    checkBuildDirectory,
    checkManifestVersion,
    checkBuildSize
  ];
  
  let allChecksPassed = true;
  
  for (const check of checks) {
    if (!check()) {
      allChecksPassed = false;
    }
  }
  
  console.log('\n=====================================');
  if (allChecksPassed) {
    console.log('✅ All verification checks passed!');
    console.log('📁 The built extension appears to be complete.');
    console.log('\n💡 Next steps for AMO review:');
    console.log('   1. Compare files in dist/ with submitted extension');
    console.log('   2. Verify widgetopia.zip matches submitted package');
    console.log('   3. Test the extension in Firefox');
  } else {
    console.log('❌ Some verification checks failed!');
    console.log('📋 Please fix the issues above before proceeding.');
  }
  
  return allChecksPassed;
}

// Run verification if script is executed directly
import { fileURLToPath } from 'url';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const success = runBuildVerification();
  process.exit(success ? 0 : 1);
}

export { runBuildVerification }; 