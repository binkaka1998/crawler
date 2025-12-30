import { prisma } from '../../lib/prisma';
import { buildDailyCode, normalizeGoldCode } from '../../util/utilFunctions';
import { fetchJsonViaPlaywright } from '../../playwright/fetchJson';
export interface CrawledPrice {
    storeId: number;
    goldTypeId: number;
    buyPrice: number;
    sellPrice: number;
    dailyCode: string;
}



export class MiHongCrawler {
    private storeCode = 'MIHONG';
    private storeName = 'Tiệm vàng Mi Hồng';

    async crawl() {
        console.log(`[${this.storeName}] Starting crawl via Playwright...`);

        const url =
            'https://apiclient.topi.vn/api-web/GetGoldPrice?source_gold=mi-hong&platform=Web';

        const data = await fetchJsonViaPlaywright<any>(url);
        const items = data?.data;

        if (!Array.isArray(items)) return [];

        const store = await prisma.goldStore.findUnique({
            where: { code: this.storeCode },
        });
        if (!store) throw new Error('MIHONG store not found');

        const goldTypeCache = new Map<string, number>();
        const dailyCode = buildDailyCode(new Date());
        const results = [];

        for (const item of items) {
            const buyPrice = Number(item.buyPrice);
            const sellPrice = Number(item.sellPrice);
            if (buyPrice <= 0) continue;

            const rawType = item.goldType;
            if (!rawType) continue;

            const goldTypeCode = `MIHONG_${normalizeGoldCode(rawType)}`;

            let goldTypeId = goldTypeCache.get(goldTypeCode);
            if (!goldTypeId) {
                const goldType = await prisma.goldType.upsert({
                    where: { code: goldTypeCode },
                    update: {
                        name: rawType,
                        description: rawType,
                        isActive: true,
                    },
                    create: {
                        code: goldTypeCode,
                        name: rawType,
                        description: rawType,
                        isActive: true,
                    },
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
                dailyCode,
            });
        }

        console.log(`[${this.storeName}] Found ${results.length} prices`);
        return results;
    }
}

