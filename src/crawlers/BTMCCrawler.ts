import axios from 'axios';
import { prisma } from '../lib/prisma';
import { buildDailyCode, normalizeGoldCode } from '../util/utilFunctions';

export interface CrawledPrice {
    storeId: number;
    goldTypeId: number;
    buyPrice: number;
    sellPrice: number;
    dailyCode: string;
}

export class BTMCCrawler {
    private storeCode = 'BTMC';
    private apiUrl =
        'http://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=3kd8ub1llcg9t45hnoh8hmn7t5kc2v';

    async crawl(): Promise<CrawledPrice[]> {
        console.log('[BTMC] Fetching XML data...');

        const prices: CrawledPrice[] = [];
        const xml = await axios.get(this.apiUrl, { timeout: 30000 });
        const json = xml.data;

        const rows = json?.DataList?.Data;
        if (!Array.isArray(rows)) return prices;

        const store = await prisma.goldStore.findUnique({
            where: { code: this.storeCode },
        });
        if (!store) throw new Error('BTMC store not found');

        const goldTypeCache = new Map<string, number>();
        const dailyCode = buildDailyCode(new Date());

        let collected = 0;

        for (const item of rows) {
            if (collected >= 7) break;

            const row = Number(item['@row']);
            if (!row) continue;

            // ✅ filter FIRST
            if (item[`@k_${row}`]?.toUpperCase() !== '24K') continue;

            const rawName = item[`@n_${row}`];
            if (!rawName) continue;

            const buy = Number(item[`@pb_${row}`])*10;
            const sell = Number(item[`@ps_${row}`])*10;
            if (buy <= 0) continue;

            const goldTypeCode = `BTMC_${normalizeGoldCode(rawName)}`;

            let goldTypeId = goldTypeCache.get(goldTypeCode);
            if (!goldTypeId) {
                const goldType = await prisma.goldType.upsert({
                    where: { code: goldTypeCode },
                    update: {
                        name: rawName,
                        description: rawName,
                        isActive: true,
                        updatedAt: new Date(),
                    },
                    create: {
                        code: goldTypeCode,
                        name: rawName,
                        description: rawName,
                        isActive: true,
                    },
                });

                goldTypeId = goldType.id;
                if (goldTypeId != null) {
                    goldTypeCache.set(goldTypeCode, goldTypeId);
                }
            }

            prices.push(<CrawledPrice>{
                storeId: store.id,
                goldTypeId,
                buyPrice: buy,
                sellPrice: sell,
                dailyCode,
            });

            collected++; // ✅ count only valid 24K rows
        }

        console.log(`[BTMC] Crawled ${prices.length} prices`);
        return prices;
    }

}

