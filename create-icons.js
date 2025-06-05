#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const ICONS_DIR = 'public/icons';
const SIZES = [16, 48, 128];

function createIconSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8AB4F8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4285F4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.floor(size/8)}" fill="url(#grad${size})"/>
  <text x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white" 
        font-family="Arial, sans-serif" font-weight="bold" font-size="${Math.floor(size * 0.6)}">W</text>
</svg>`;
}

function createIcons() {
  console.log('🎨 Creating icon SVGs...');
  
  try {
    // Create SVG icons for each size
    for (const size of SIZES) {
      const svgContent = createIconSVG(size);
      const outputPath = join(ICONS_DIR, `icon${size}.svg`);
      
      writeFileSync(outputPath, svgContent);
      console.log(`✅ Created ${size}x${size} SVG icon: ${outputPath}`);
    }
    
    // Create a master icon
    const masterSVG = createIconSVG(512);
    writeFileSync(join(ICONS_DIR, 'icon-master.svg'), masterSVG);
    
    console.log('🎉 SVG icons created successfully!');
    console.log('💡 Convert these SVG files to PNG using an online converter or image editor');
    console.log('   Recommended: https://svgtopng.com/ or similar service');
    
  } catch (error) {
    console.error('❌ Error creating icons:', error.message);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url).replace(/\//g, '\\')) {
  createIcons();
}

export { createIcons }; 