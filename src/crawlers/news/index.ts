// Main entry point for gold news crawler
import dotenv from 'dotenv'
import { crawlKitco } from './kitco.js'
import { crawlDailyForex } from './dailyforex.js'
import { crawlMarketWatch } from './marketwatch.js'
import { saveArticles, getStats, closeDatabase } from './database.js'
import { sleep } from './utils.js'
import type { NewsArticle } from './types.js'

dotenv.config()

/**
 * Run all news crawlers
 */
export async function crawlAllNews(): Promise<{
  articles: NewsArticle[]
  stats: any
}> {
  console.log('🚀 Starting Gold News Crawler')
  console.log(`📅 ${new Date().toLocaleString('vi-VN')}\n`)

  const startTime = Date.now()
  const allArticles: NewsArticle[] = []

  // Crawl Kitco
  try {
    const kitcoArticles = await crawlKitco()
    allArticles.push(...kitcoArticles)
    await sleep(2000) // Polite delay between sources
  } catch (error) {
    console.error('⚠️  Kitco crawler failed, continuing...')
  }

  // Crawl DailyForex
  try {
    const dailyForexArticles = await crawlDailyForex()
    allArticles.push(...dailyForexArticles)
    await sleep(2000)
  } catch (error) {
    console.error('⚠️  DailyForex crawler failed, continuing...')
  }

  // // Crawl MarketWatch
  // try {
  //   const marketWatchArticles = await crawlMarketWatch()
  //   allArticles.push(...marketWatchArticles)
  // } catch (error) {
  //   console.error('⚠️  MarketWatch crawler failed, continuing...')
  // }

  console.log(`\n📊 Total articles found: ${allArticles.length}`)

  // Save to database
  if (allArticles.length > 0) {
    console.log('\n💾 Saving articles to database...')
    const stats = await saveArticles(allArticles)

    console.log('\n📈 Save Statistics:')
    console.log(`   Total: ${stats.total}`)
    console.log(`   ✅ Saved: ${stats.saved}`)
    console.log(`   ⏭️  Skipped (duplicates): ${stats.skipped}`)
    console.log(`   ❌ Failed: ${stats.failed}`)
  }

  // Show database stats
  console.log('\n📊 Database Statistics:')
  const dbStats = await getStats()
  console.log(`   Total articles in DB: ${dbStats.total}`)
  console.log(`   ✅ Active (published): ${dbStats.active}`)
  console.log(`   ⏸️  Inactive (need translation): ${dbStats.inactive}`)
  console.log('\n   By Source:')
  dbStats.bySource.forEach(s => {
    console.log(`     ${s.source}: ${s.count}`)
  })

  const duration = Date.now() - startTime
  console.log(`\n✅ Crawler completed in ${(duration / 1000).toFixed(2)}s`)

  return {
    articles: allArticles,
    stats: dbStats
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    await crawlAllNews()
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  } finally {
    await closeDatabase()
  }
}

// Run main function
main()
