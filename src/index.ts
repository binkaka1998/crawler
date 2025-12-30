#!/usr/bin/env ts-node

/**
 * Gold Tracker - Master Index
 * Runs both price crawler and news crawler
 */

import dotenv from 'dotenv'
dotenv.config()

console.log('╔════════════════════════════════════════╗')
console.log('║   Gold Tracker - Complete System      ║')
console.log('╚════════════════════════════════════════╝\n')

async function main(): Promise<void> {
  console.log('🚀 Starting Gold Tracker System')
  console.log(`📅 ${new Date().toLocaleString('vi-VN')}\n`)
  
  // Check which crawlers to run
  const args = process.argv.slice(2)
  const runPrices = args.length === 0 || args.includes('--prices')
  const runNews = args.length === 0 || args.includes('--news')
  
  // Run price crawler
  if (runPrices) {
    console.log('💰 Running Price Crawler...')
    try {
      const { runOnceCrawler } = await import('./run-once.js')
      await runOnceCrawler()
      console.log('✅ Price crawler completed\n')
    } catch (error) {
      console.error('❌ Price crawler failed:', error instanceof Error ? error.message : 'Unknown error')
    }
  }
  
  // Run news crawler
  if (runNews) {
    console.log('📰 Running News Crawler...')
    try {
      const { crawlAllNews } = await import('./crawlers/news/index.js')
      await crawlAllNews()
      console.log('✅ News crawler completed\n')
    } catch (error) {
      console.error('❌ News crawler failed:', error instanceof Error ? error.message : 'Unknown error')
    }
  }
  
  console.log('🎉 Gold Tracker System completed!')
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
