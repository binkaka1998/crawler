// Simple wrapper to run archive task once
import {crawlerDb} from "./lib/database";

async function runArchiveTask() {
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

runArchiveTask().then(() => {
  console.log('');
  console.log('👋 Done! Exiting...');
  process.exit(0);
});
