import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { PrismaClient, Prisma } from '@prisma/client';
import { BTMCGoldTypeCode } from '../util/BTMCGoldTypeCode';
import { buildDailyCode } from '../util/daily-code-generator';

const prisma = new PrismaClient();
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
        const parser = new XMLParser({ ignoreAttributes: false });
        const xml = await axios.get(this.apiUrl, { timeout: 30000 });
        const json = xml.data;

        const rows = json?.DataList?.Data;
        console.log(xml.data);
        console.log(rows);
        if (!rows?.length) return prices;

        const store = await prisma.goldStore.findUnique({
            where: { code: this.storeCode },
        });

        if (!store) {
            throw new Error('BTMC store not found');
        }

        // Cache goldTypeId by code
        const goldTypeCache = new Map<string, number>();

        for (const item of rows) {
            console.log(`[BTMC] ${item['@row']}`);
            const row = Number(item['@row']);
            if (row > 7) continue; // skip silver

            const goldTypeCode = this.resolveGoldTypeCode(row);
            if (!goldTypeCode) continue;

            const buy = Number(item[`@pb_${row}`]);
            const sell = Number(item[`@ps_${row}`]);
            if (buy <= 0) continue;
            const now = new Date();
            const dailyCode = buildDailyCode(now);
            // Resolve goldTypeId by CODE
            let goldTypeId = goldTypeCache.get(goldTypeCode);
            if (!goldTypeId) {
                const goldType = await prisma.goldType.findUnique({
                    where: { code: goldTypeCode },
                });
                if (!goldType) {
                    console.warn(`[BTMC] Missing gold_type code: ${goldTypeCode}`);
                    continue;
                }
                goldTypeId = goldType.id;
                goldTypeCache.set(goldTypeCode, goldTypeId);
            }

            try {
                prices.push({
                        storeId: store.id,
                        goldTypeId,
                        buyPrice: buy,
                        sellPrice: sell,
                        dailyCode: dailyCode,
                });
            } catch (e) {
                if (
                    e instanceof Prisma.PrismaClientKnownRequestError &&
                    e.code === 'P2002'
                ) {
                    // duplicate → ignore
                } else {
                    throw e;
                }
            }
        }
        return prices;
    }

    private resolveGoldTypeCode(row: number): BTMCGoldTypeCode | null {
        const key = `ROW_${row}` as keyof typeof BTMCGoldTypeCode;
        return BTMCGoldTypeCode[key] ?? null;
    }
}