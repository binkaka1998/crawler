// Scheduler for automatic news crawling
import cron from 'node-cron'
import { crawlAllNews } from './index.js'
import { closeDatabase } from './database.js'

console.log('⏰ Gold News Crawler Scheduler Started')
console.log(`📅 ${new Date().toLocaleString('vi-VN')}`)
console.log('⏱️  Schedule: Every 2 hours\n')

// Run immediately on startup
console.log('🚀 Running initial crawl...\n')
crawlAllNews().catch(error => {
  console.error('❌ Initial crawl failed:', error)
})

// Schedule to run every 2 hours
// Cron format: minute hour day month weekday
// "0 */2 * * *" = At minute 0 of every 2nd hour
cron.schedule('0 */2 * * *', async () => {
  console.log('\n⏰ Scheduled crawl triggered')
  console.log(`📅 ${new Date().toLocaleString('vi-VN')}\n`)
  
  try {
    await crawlAllNews()
  } catch (error) {
    console.error('❌ Scheduled crawl failed:', error)
  }
}, {
  timezone: 'Asia/Ho_Chi_Minh'
})

console.log('✅ Scheduler is running')
console.log('💡 Next runs: 00:00, 02:00, 04:00, 06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00')
console.log('🛑 Press Ctrl+C to stop\n')

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...')
  await closeDatabase()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...')
  await closeDatabase()
  process.exit(0)
})
