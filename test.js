#!/usr/bin/env node

/**
 * Test script for Gold Tracker Combined System
 * Validates setup and dependencies
 */

console.log('🧪 Testing Gold Tracker System...\n')

// Test 1: Node.js version
console.log('1️⃣  Checking Node.js version...')
const nodeVersion = process.version
const major = parseInt(nodeVersion.split('.')[0].substring(1))
if (major >= 18) {
  console.log(`   ✅ Node.js: ${nodeVersion} (OK)`)
} else {
  console.log(`   ❌ Node.js: ${nodeVersion} (Need v18+)`)
  process.exit(1)
}

// Test 2: TypeScript
console.log('\n2️⃣  Checking TypeScript...')
try {
  const { exec } = require('child_process')
  exec('npx tsc --version', (error, stdout) => {
    if (error) {
      console.log('   ❌ TypeScript not found')
      console.log('   💡 Run: npm install')
    } else {
      console.log(`   ✅ TypeScript: ${stdout.trim()}`)
    }
  })
} catch (error) {
  console.log('   ⚠️  Cannot check TypeScript')
}

// Test 3: Dependencies
console.log('\n3️⃣  Checking dependencies...')
const requiredDeps = [
  '@prisma/client',
  'axios',
  'cheerio',
  'dotenv',
  'node-cron',
  'playwright'
]

let missingDeps = []
requiredDeps.forEach(dep => {
  try {
    require.resolve(dep)
    console.log(`   ✅ ${dep}`)
  } catch {
    console.log(`   ❌ ${dep} - MISSING`)
    missingDeps.push(dep)
  }
})

if (missingDeps.length > 0) {
  console.log('\n   ⚠️  Missing dependencies!')
  console.log('   💡 Run: npm install')
}

// Test 4: Environment
console.log('\n4️⃣  Checking environment...')
const fs = require('fs')
if (fs.existsSync('.env')) {
  console.log('   ✅ .env file exists')
  
  const dotenv = require('dotenv')
  const config = dotenv.config()
  
  if (config.parsed && config.parsed.DATABASE_URL) {
    console.log('   ✅ DATABASE_URL configured')
  } else {
    console.log('   ⚠️  DATABASE_URL not set in .env')
  }
} else {
  console.log('   ⚠️  .env file not found')
  console.log('   💡 Run: cp .env.example .env')
}

// Test 5: File structure
console.log('\n5️⃣  Checking file structure...')
const requiredFiles = [
  'src/index.ts',
  'src/run-once.ts',
  'src/scheduler.ts',
  'src/crawlers/price/SJCCrawler.ts',
  'src/crawlers/price/PNJCrawler.ts',
  'src/crawlers/price/DOJICrawler.ts',
  'src/crawlers/price/BTMCCrawler.ts',
  'src/crawlers/price/MiHongCrawler.ts',
  'src/crawlers/news/index.ts',
  'src/crawlers/news/kitco.ts',
  'src/crawlers/news/dailyforex.ts',
  'src/crawlers/news/marketwatch.ts',
  'src/lib/prisma.ts',
  'src/lib/database.ts',
  'prisma/schema.prisma',
  'package.json',
  'tsconfig.json'
]

let missingFiles = []
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`)
  } else {
    console.log(`   ❌ ${file} - MISSING`)
    missingFiles.push(file)
  }
})

if (missingFiles.length > 0) {
  console.log('\n   ⚠️  Some files are missing!')
}

// Test 6: Prisma
console.log('\n6️⃣  Checking Prisma...')
if (fs.existsSync('node_modules/.prisma/client')) {
  console.log('   ✅ Prisma client generated')
} else {
  console.log('   ⚠️  Prisma client not generated')
  console.log('   💡 Run: npx prisma generate')
}

// Test 7: Playwright
console.log('\n7️⃣  Checking Playwright...')
if (fs.existsSync('node_modules/playwright/.local-browsers')) {
  console.log('   ✅ Playwright browsers installed')
} else {
  console.log('   ⚠️  Playwright browsers not installed')
  console.log('   💡 Run: npx playwright install')
}

// Summary
console.log('\n' + '='.repeat(50))
console.log('📊 TEST SUMMARY')
console.log('='.repeat(50))

if (missingDeps.length === 0 && missingFiles.length === 0) {
  console.log('✅ All tests passed!')
  console.log('\n🚀 Ready to run:')
  console.log('   npm start           - Run both crawlers')
  console.log('   npm run crawl:prices - Run price crawler')
  console.log('   npm run crawl:news   - Run news crawler')
  process.exit(0)
} else {
  console.log('⚠️  Some issues found. Please fix them first.')
  console.log('\n💡 Quick fix:')
  console.log('   npm install')
  console.log('   cp .env.example .env')
  console.log('   npx prisma generate')
  console.log('   npx playwright install')
  process.exit(1)
}
