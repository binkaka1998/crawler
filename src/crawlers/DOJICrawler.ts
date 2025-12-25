import axios from 'axios';
import * as cheerio from 'cheerio';
import {resolveGoldTypeCode} from '../util/DOJIGoldTypeMap';
import {PrismaClient} from "@prisma/client";
import {buildDailyCode} from "../util/daily-code-generator";
const prisma = new PrismaClient();

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

        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const store = await prisma.goldStore.findUnique({
            where: { code: this.storeCode },
        });
        if (!store) throw new Error('DOJI store not found');

        const goldTypeCache = new Map<string, number>();
        const results: CrawledPrice[] = [];

        const now = new Date();
        const dailyCode = buildDailyCode(now);

        const rows = $('table.goldprice-view tbody tr').toArray();

        for (let i = 0; i < rows.length; i++) {
            const tr = rows[i];
            const row = i + 1;

            const goldTypeCode = resolveGoldTypeCode(row);
            if (!goldTypeCode) continue;

            const tds = $(tr).find('td');
            if (tds.length < 3) continue;

            const buyPrice = Number($(tds[1]).text())*1000;
            const sellPrice = Number($(tds[2]).text())*1000;
            if (buyPrice <= 0) continue;

            // Resolve goldTypeId by CODE (cached)
            let goldTypeId = goldTypeCache.get(goldTypeCode);
            if (!goldTypeId) {
                const goldType = await prisma.goldType.findUnique({
                    where: { code: goldTypeCode },
                });
                if (!goldType) {
                    console.warn(`[DOJI] Missing gold_type code: ${goldTypeCode}`);
                    continue;
                }
                goldTypeId = goldType.id;
                goldTypeCache.set(goldTypeCode, goldTypeId);
            }

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
    }
}