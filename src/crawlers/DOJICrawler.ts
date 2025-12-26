import axios from 'axios';
import * as cheerio from 'cheerio';
import {buildDailyCode, normalizeGoldCode} from "../util/utilFunctions";
import { prisma } from '../lib/prisma';

export interface CrawledPrice {
    storeId: number;
    goldTypeId: number;
    buyPrice: number;
    sellPrice: number;
    dailyCode: string;
}

export class DOJICrawler {
    protected storeCode = 'DOJI';
    protected storeName = 'Công ty Vàng bạc Đá quý DOJI';

    async crawl(): Promise<CrawledPrice[]> {
        console.log(`[${this.storeName}] Starting crawl...`);

        const url =
            'http://giavang.doji.vn/sites/default/files/data/hienthi/vungmien_1.dat';

        const response = await axios.get(url, { timeout: 30000 });
        const $ = cheerio.load(response.data);

        const store = await prisma.goldStore.findUnique({
            where: { code: this.storeCode },
        });
        if (!store) throw new Error('DOJI store not found');

        const goldTypeCache = new Map<string, number>();
        const results: CrawledPrice[] = [];

        const dailyCode = buildDailyCode(new Date());

        const rows = $('table.goldprice-view tbody tr').toArray();

        for (const tr of rows) {
            const tds = $(tr).find('td');
            if (tds.length < 3) continue;

            // 🔑 Gold type name (AUTO)
            const rawName = $(tds[0]).text().trim();
            if (!rawName) continue;

            const buyPrice = Number($(tds[1]).text()) * 10000;
            const sellPrice = Number($(tds[2]).text()) * 10000;
            if (buyPrice <= 0) continue;

            // 🔑 Generate code (NO accent, NO special char)
            const goldTypeCode = `DOJI_${normalizeGoldCode(rawName)}`;

            // Resolve goldTypeId (cached + upsert)
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
