import { prisma } from "../../lib/prisma";
import { normalizeGoldCode, miHongDateTimeToDailyCode } from "../../util/utilFunctions";
import { fetchMiHongPrices } from "../../playwright/mihong.fetch";

export interface CrawledPrice {
    storeId: number;
    goldTypeId: number;
    buyPrice: number;
    sellPrice: number;
    dailyCode: string;
}

export class MiHongCrawler {
    private storeCode = "MIHONG";
    private storeName = "Tiệm vàng Mi Hồng";

    async crawl(): Promise<CrawledPrice[]> {
        console.log(`[${this.storeName}] Starting crawl...`);

        try {
            const response = await fetchMiHongPrices();
            const items = response?.data;

            if (!Array.isArray(items)) {
                console.log(`[${this.storeName}] No data returned`);
                return [];
            }

            const store = await prisma.goldStore.findUnique({
                where: { code: this.storeCode },
            });
            if (!store) throw new Error("MIHONG store not found");

            const goldTypeCache = new Map<string, number>();
            const results: CrawledPrice[] = [];

            for (const item of items) {
                const buyPrice = Number(item.buyingPrice);
                const sellPrice = Number(item.sellingPrice);
                if (buyPrice <= 0) continue;

                const normalized = normalizeGoldCode(item.code);
                const goldTypeCode = `MIHONG_${normalized}`;

                let goldTypeId = goldTypeCache.get(goldTypeCode);
                if (!goldTypeId) {
                    const goldType = await prisma.goldType.upsert({
                        where: { code: goldTypeCode },
                        update: {
                            name: item.code,
                            description: item.code,
                            isActive: true,
                        },
                        create: {
                            code: goldTypeCode,
                            name: item.code,
                            description: item.code,
                            isActive: true,
                        },
                    });

                    goldTypeId = goldType.id;
                    goldTypeCache.set(goldTypeCode, goldTypeId);
                }

                const dailyCode = miHongDateTimeToDailyCode(item.dateTime);

                results.push({
                    storeId: store.id,
                    goldTypeId,
                    buyPrice,
                    sellPrice,
                    dailyCode,
                });
            }

            console.log(`[${this.storeName}] Found ${results.length} prices`);
            return results;

        } catch (err: any) {
            console.error(`[${this.storeName}] ❌ Error:`, err.message);
            return [];
        }
    }
}