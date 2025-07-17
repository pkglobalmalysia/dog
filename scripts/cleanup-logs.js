#!/usr/bin/env node

/**
 * Production cleanup script
 * Removes debug console.log statements while preserving console.error for important error tracking
 */

const fs = require('fs');
const path = require('path');

// Patterns to remove (debug logs with emojis and verbose logging)
const DEBUG_PATTERNS = [
  /console\.log\("🔍[^"]*"[^;]*;?\n?/g,
  /console\.log\("📊[^"]*"[^;]*;?\n?/g,
  /console\.log\("✅[^"]*"[^;]*;?\n?/g,
  /console\.log\("🔄[^"]*"[^;]*;?\n?/g,
  /console\.log\("📝[^"]*"[^;]*;?\n?/g,
  /console\.log\("👤[^"]*"[^;]*;?\n?/g,
  /console\.log\("📚[^"]*"[^;]*;?\n?/g,
  /console\.log\("🎓[^"]*"[^;]*;?\n?/g,
  /console\.log\("💾[^"]*"[^;]*;?\n?/g,
  /console\.log\("🚀[^"]*"[^;]*;?\n?/g,
  /console\.log\("🔥[^"]*"[^;]*;?\n?/g,
  /console\.log\("🔑[^"]*"[^;]*;?\n?/g,
  /console\.log\("🚨[^"]*"[^;]*;?\n?/g,
  /console\.log\("📭[^"]*"[^;]*;?\n?/g,
  /console\.log\("🧪[^"]*"[^;]*;?\n?/g,
];

// Patterns to preserve (error logs and critical information)
const PRESERVE_PATTERNS = [
  /console\.error/,
  /console\.warn/,
  /console\.critical/,
];

function shouldPreserveLine(line) {
  return PRESERVE_PATTERNS.some(pattern => pattern.test(line));
}

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Remove debug patterns
    DEBUG_PATTERNS.forEach(pattern => {
      content = content.replace(pattern, '');
    });
    
    // Remove empty lines that might have been left
    content = content.replace(/^\s*\n/gm, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
    return false;
  }
}

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walk(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  walk(dir);
  return files;
}

// Main execution
const rootDir = process.cwd();
const files = findFiles(rootDir);

console.log(`🧹 Starting production cleanup...`);
console.log(`📁 Found ${files.length} files to check`);

let cleanedCount = 0;
files.forEach(file => {
  if (cleanFile(file)) {
    cleanedCount++;
  }
});

console.log(`🎉 Production cleanup complete!`);
console.log(`📊 Cleaned ${cleanedCount} files`);
console.log(`🔍 Debug logs removed, error logs preserved`);
