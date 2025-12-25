import { crawlerManager } from './crawler-manager';
import { crawlerDb } from './lib/database';

async function runOnce() {
  console.log('🚀 Running crawler once...');
  console.log('═'.repeat(60));
  
  const startTime = Date.now();

  try {
    const result = await crawlerManager.runAll();

    const duration = Date.now() - startTime;
    
    console.log('');
    console.log('✅ Crawler completed!');
    console.log('═'.repeat(60));
    console.log(`   Total crawled: ${result.totalCrawled} prices`);
    console.log(`   Successfully saved: ${result.totalSaved} prices`);
    console.log(`   Failed: ${result.totalCrawled - result.totalSaved} prices`);
    console.log(`   Duration: ${duration}ms`);
    console.log('═'.repeat(60));

    if (result.errors.length > 0) {
      console.log('');
      console.log('❌ Errors encountered:');
      result.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await crawlerDb.disconnect();
  }
}

runOnce().then(() => {
  console.log('');
  console.log('👋 Done! Exiting...');
  process.exit(0);
});
