import { getBrowser } from '../playwright/browser';
import { buildDailyCode, normalizeGoldCode } from '../util/utilFunctions';
import { prisma } from '../lib/prisma';


export interface CrawledPrice {
    storeId: number;
    goldTypeId: number;
    buyPrice: number;
    sellPrice: number;
    dailyCode: string;
}

export class SJCCrawler {
    protected storeCode = 'SJC';
    protected storeName = 'Công ty Vàng bạc Đá quý SJC';

    async crawl(): Promise<CrawledPrice[]> {
        console.log(`[${this.storeName}] Starting browser scrape...`);

        // 1️⃣ Resolve store
        const store = await prisma.goldStore.findUnique({
            where: { code: this.storeCode },
        });
        if (!store) throw new Error('SJC store not found');

        const goldTypeCache = new Map<string, number>();
        const dailyCode = buildDailyCode(new Date());

        // 2️⃣ Launch browser
        const browser = await getBrowser();
        const page = await browser.newPage();

        await page.goto('https://sjc.com.vn/gia-vang-online', {
            waitUntil: 'networkidle',
            timeout: 60000,
        });

        await page.waitForSelector('table tbody tr');

        // 3️⃣ Extract raw rows
        const rows = await page.evaluate(() => {
            const data: Array<{ name: string; buy: number; sell: number }> = [];
            document.querySelectorAll('table tbody tr').forEach((tr) => {
                const tds = tr.querySelectorAll('td');
                if (tds.length < 3) return;

                const name = tds[0].innerText.trim();
                const buy = Number(tds[1].innerText.replace(/[^\d]/g, ''));
                const sell = Number(tds[2].innerText.replace(/[^\d]/g, ''));

                if (!name || buy <= 0 || sell <= 0) return;
                data.push({ name, buy, sell });
            });
            return data;
        });

        await browser.close();

        const results: CrawledPrice[] = [];

        // 4️⃣ Upsert goldType + build result
        for (const row of rows) {
            const rawName = row.name;
            const goldTypeCode = `SJC_${normalizeGoldCode(rawName)}`;

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
                buyPrice: row.buy,
                sellPrice: row.sell,
                dailyCode,
            });
        }

        console.log(`[${this.storeName}] Found ${results.length} prices`);
        return results;
    }
}

