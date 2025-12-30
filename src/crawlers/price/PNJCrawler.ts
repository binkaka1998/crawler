import axios from 'axios';
import {buildDailyCode, normalizeGoldCode} from '../../util/utilFunctions';
import { prisma } from '../../lib/prisma';

export interface CrawledPrice {
  storeId: number;
  goldTypeId: number;
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
  protected storeName = 'Công ty Vàng bạc Đá quý PNJ';

  async crawl(): Promise<CrawledPrice[]> {
    console.log(`[${this.storeName}] Starting crawl...`);

    const url =
        'https://edge-api.pnj.io/ecom-frontend/v1/get-gold-price?zone=11';

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'application/json',
      },
    });

    const items = response.data?.data;
    if (!Array.isArray(items)) {
      console.warn('[PNJ] Unexpected API format');
      return [];
    }

    const store = await prisma.goldStore.findUnique({
      where: { code: this.storeCode },
    });
    if (!store) throw new Error('PNJ store not found');

    const goldTypeCache = new Map<string, number>();
    const results: CrawledPrice[] = [];

    const now = new Date();
    const dailyCode = buildDailyCode(now);

    for (const item of items) {
      const buyPrice = Number(item.buyPrice ?? item.giamua ?? 0)*10000;
      const sellPrice = Number(item.sellPrice ?? item.giaban ?? 0)*10000;
      if (buyPrice <= 0) continue;

      // 🔑 Dynamic gold type code
      const rawCode =
          item.tensp ||
          item.code ||
          item.name ||
          item.productName;

      if (!rawCode) {
        console.warn('[PNJ] Missing gold type identifier', item);
        continue;
      }

      const goldTypeCode = `PNJ_${normalizeGoldCode(rawCode)}`;

      // Resolve goldTypeId (cached)
      let goldTypeId = goldTypeCache.get(goldTypeCode);
      if (!goldTypeId) {
        let goldType = await prisma.goldType.findUnique({
          where: { code: goldTypeCode },
        });

        // Auto-create if missing (recommended for PNJ)
        goldType = await prisma.goldType.upsert({
          where: { code: goldTypeCode},
          update: {
            ...(rawCode && { name: rawCode }),
            ...(rawCode && { description: rawCode }),
            isActive: true,
            updatedAt: new Date(), // force update
          },
          create: {
            code: goldTypeCode,
            name: rawCode,
            description: rawCode,
            isActive: true,
          }
        });

        goldTypeId = goldType.id;
        if (goldTypeId != null) {
          goldTypeCache.set(goldTypeCode, goldTypeId);
        }
      }

      results.push(<CrawledPrice>{
        storeId: store.id,
        goldTypeId,
        buyPrice,
        sellPrice,
        dailyCode
      });
    }

    console.log(`[${this.storeName}] Found ${results.length} prices`);
    return results;
  }
}
