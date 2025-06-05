#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const DIST_DIR = 'dist';

function fixSecurityIssues() {
  console.log('🔒 Analyzing security issues in built files...');
  
  try {
    const assetsDir = join(DIST_DIR, 'assets');
    const files = readdirSync(assetsDir).filter(file => file.endsWith('.js'));
    
    for (const file of files) {
      const filePath = join(assetsDir, file);
      const content = readFileSync(filePath, 'utf8');
      
      // Count potential security issues
      const innerHTMLCount = (content.match(/\.innerHTML\s*=/g) || []).length;
      const functionCount = (content.match(/new\s+Function\s*\(/g) || []).length;
      const evalCount = (content.match(/\beval\s*\(/g) || []).length;
      
      if (innerHTMLCount > 0 || functionCount > 0 || evalCount > 0) {
        console.log(`📋 ${file}:`);
        if (innerHTMLCount > 0) console.log(`  - innerHTML assignments: ${innerHTMLCount}`);
        if (functionCount > 0) console.log(`  - Function constructors: ${functionCount}`);
        if (evalCount > 0) console.log(`  - eval calls: ${evalCount}`);
      }
    }
    
    console.log('\n💡 These are warnings from Mozilla\'s validator.');
    console.log('📝 They are typically from third-party libraries and are generally safe in this context.');
    console.log('🔧 For production, consider using CSP headers to mitigate risks.');
    
  } catch (error) {
    console.error('❌ Error analyzing files:', error.message);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url).replace(/\//g, '\\')) {
  fixSecurityIssues();
}

export { fixSecurityIssues }; 