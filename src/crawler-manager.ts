import { crawlerDb } from './lib/database';
import {SJCCrawler, PNJCrawler, BTMCCrawler, DOJICrawler, CrawledPrice, MiHongCrawler} from './crawlers/price';
import { closeBrowser } from './playwright/browser';

export type { CrawledPrice };

/**
 * Crawler Manager
 * Manages all individual crawlers
 */
export class CrawlerManager {
  private crawlers: Array<SJCCrawler | PNJCrawler | BTMCCrawler | DOJICrawler | MiHongCrawler>;

  constructor() {
    this.crawlers = [
      new PNJCrawler(),
      new BTMCCrawler(),
      new DOJICrawler(),
      new MiHongCrawler(),
      new SJCCrawler()
    ];

  }

  /**
   * Run all crawlers and save to database
   */
  async runAll(): Promise<{
    totalCrawled: number;
    totalSaved: number;
    errors: string[];
  }> {
    const results = {
      totalCrawled: 0,
      totalSaved: 0,
      errors: [] as string[],
    };
    try {
      for (const crawler of this.crawlers) {
      try {
        const crawlerName = crawler.constructor.name;
        console.log(`\n[CrawlerManager] Starting ${crawlerName}...`);
        const startTime = Date.now();

        // Crawl prices
        const prices = await crawler.crawl();
        results.totalCrawled += prices.length;

        console.log(`[CrawlerManager] ${crawlerName} found ${prices.length} prices`);

        // Save to database
        if (prices.length > 0) {
          const saveResult = await crawlerDb.saveDailyPricesBatch(prices);
          results.totalSaved += saveResult.success;

          if (saveResult.failed > 0) {
            results.errors.push(...saveResult.errors);
          }

          console.log(`[CrawlerManager] ${crawlerName} saved ${saveResult.success}/${prices.length} prices`);
        }

        const duration = Date.now() - startTime;
        console.log(`[CrawlerManager] ${crawlerName} completed in ${duration}ms`);

      } catch (error) {
        const errorMsg = `Error in ${crawler.constructor.name}: ${error}`;
        console.error(`[CrawlerManager] ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }
    } finally {
      // ✅ close browser ONCE after all crawlers finish
      await closeBrowser();
    }
    return results;
  }

  /**
   * Run specific crawler by store code
   */
  async runCrawler(storeCode: string): Promise<CrawledPrice[]> {
    const crawler = this.crawlers.find(c => {
      return (c as any).storeCode === storeCode;
    });

    if (!crawler) {
      throw new Error(`Crawler not found for store: ${storeCode}`);
    }

    return await crawler.crawl();
  }

  /**
   * Get list of available crawlers
   */
  getAvailableCrawlers(): string[] {
    return this.crawlers.map(c => (c as any).storeName);
  }
}

export const crawlerManager = new CrawlerManager();
