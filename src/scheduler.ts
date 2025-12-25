import cron from 'node-cron';
import { crawlerManager } from './crawler-manager';
import { crawlerDb } from './lib/database';

export class CrawlerScheduler {
  private isRunning = false;

  start() {
    console.log('🚀 Starting Gold Price Crawler Scheduler...');

    // Run crawler every 15 minutes (8 AM - 6 PM)
    cron.schedule('*/15 8-18 * * *', async () => {
      await this.runCrawlerTask();
    });

    // Archive daily prices at 11:59 PM
    cron.schedule('59 23 * * *', async () => {
      await this.runArchiveTask();
    });

    // Run on startup if configured
    if (process.env.RUN_ON_STARTUP === 'true') {
      setTimeout(() => {
        this.runCrawlerTask();
      }, 5000);
    }

    console.log('✅ Crawler Scheduler started!');
    console.log('   - Crawler: Every 15 minutes (8 AM - 6 PM)');
    console.log('   - Archive: Daily at 11:59 PM');
  }

  private async runCrawlerTask() {
    if (this.isRunning) {
      console.log('⏭️  Skipping - previous task still running');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('');
      console.log('═'.repeat(60));
      console.log(`🕐 [${new Date().toLocaleString()}] Starting crawler task...`);
      console.log('═'.repeat(60));

      const result = await crawlerManager.runAll();

      const duration = Date.now() - startTime;
      console.log('');
      console.log('✅ Crawler task completed!');
      console.log(`   - Total crawled: ${result.totalCrawled} prices`);
      console.log(`   - Successfully saved: ${result.totalSaved} prices`);
      console.log(`   - Failed: ${result.totalCrawled - result.totalSaved} prices`);
      console.log(`   - Duration: ${duration}ms`);

      if (result.errors.length > 0) {
        console.log('');
        console.log('❌ Errors:');
        result.errors.forEach(error => console.log(`   - ${error}`));
      }

      await crawlerDb.logCrawlerExecution({
        storeName: 'ALL_STORES',
        status: result.errors.length === 0 ? 'SUCCESS' : 'PARTIAL',
        itemsCount: result.totalSaved,
        errorMessage: result.errors.length > 0 ? result.errors.join('\n') : undefined,
        startedAt: new Date(startTime),
        completedAt: new Date(),
      });

      console.log('═'.repeat(60));
      console.log('');

    } catch (error) {
      console.error('❌ Fatal error in crawler task:', error);
      
      await crawlerDb.logCrawlerExecution({
        storeName: 'ALL_STORES',
        status: 'FAILED',
        itemsCount: 0,
        errorMessage: String(error),
        startedAt: new Date(startTime),
        completedAt: new Date(),
      });
    } finally {
      this.isRunning = false;
    }
  }

  private async runArchiveTask() {
    const startTime = Date.now();

    try {
      console.log('');
      console.log('═'.repeat(60));
      console.log(`📦 [${new Date().toLocaleString()}] Starting archive task...`);
      console.log('═'.repeat(60));

      const result = await crawlerDb.archiveDailyPrices();

      const duration = Date.now() - startTime;
      console.log('');
      console.log('✅ Archive task completed!');
      console.log(`   - Archived: ${result.archived} price records`);
      console.log(`   - Deleted: ${result.deleted} daily prices`);
      console.log(`   - Duration: ${duration}ms`);
      console.log('═'.repeat(60));
      console.log('');

    } catch (error) {
      console.error('❌ Fatal error in archive task:', error);
    }
  }

  async runCrawlerNow() {
    console.log('🔧 Manual crawler trigger...');
    await this.runCrawlerTask();
  }

  async runArchiveNow() {
    console.log('🔧 Manual archive trigger...');
    await this.runArchiveTask();
  }
}

if (require.main === module) {
  const scheduler = new CrawlerScheduler();
  scheduler.start();

  process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down...');
    await crawlerDb.disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n👋 Shutting down...');
    await crawlerDb.disconnect();
    process.exit(0);
  });
}

export const scheduler = new CrawlerScheduler();
