import axios from 'axios';
import * as cheerio from 'cheerio';

export interface CrawledPrice {
  storeCode: string;
  goldTypeName: string;
  buyPrice: number;
  sellPrice: number;
  dailyCode: string;
}

/**
 * PNJ Crawler
 * Crawls gold prices from PNJ website
 */
export class PNJCrawler {
  protected storeCode = 'PNJ';
  protected storeName = 'Công ty Vàng bạc Đá quý Phú Nhuận';

  async crawl(): Promise<CrawledPrice[]> {
    try {
      console.log(`[${this.storeName}] Starting crawl...`);
      
      // PNJ API endpoint (replace with actual endpoint)
      const url = 'https://www.pnj.com.vn/blog/gia-vang/';
      
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      const prices: CrawledPrice[] = [];

      // Parse PNJ website structure
      // Note: Update selectors based on actual PNJ website
      $('.price-table tr, .gold-price-item').each((_, row) => {
        const goldTypeName = $(row).find('.gold-type, .product-name').text().trim();
        const buyPriceText = $(row).find('.buy-price, .price-buy').text().trim();
        const sellPriceText = $(row).find('.sell-price, .price-sell').text().trim();

        const buyPrice = this.parsePrice(buyPriceText);
        const sellPrice = this.parsePrice(sellPriceText);

        if (goldTypeName && buyPrice > 0 && sellPrice > 0) {
          prices.push({
            storeCode: this.storeCode,
            goldTypeName,
            buyPrice,
            sellPrice,
          });
        }
      });

      console.log(`[${this.storeName}] Found ${prices.length} prices`);
      return prices;
      
    } catch (error) {
      console.error(`[${this.storeName}] Error:`, error);
      return [];
    }
  }

  protected parsePrice(priceStr: string): number {
    const cleaned = priceStr.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  }
}
