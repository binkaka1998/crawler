import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
export class CrawlerDatabaseService {

  /**
   * Save crawled price data to GoldDailyPrice
   */
  async saveDailyPrice(data: {
      storeId: number;
      goldTypeId: number;
      buyPrice: number;
      sellPrice: number;
      dailyCode: string;
  }) {
    try {
      const store = await prisma.goldStore.findUnique({
        where: { id: data.storeId }
      });

      if (!store) {
        throw new Error(`Store not found: ${data.storeId}`);
      }

      if (!data.goldTypeId) {
        throw new Error(`Cannot map gold type: ${data.storeId} - ${data.goldTypeId}`);
      }

      const goldType = await prisma.goldType.findUnique({
        where: { id: data.goldTypeId }
      });

      if (!goldType) {
        throw new Error(`Gold type not found: ${data.goldTypeId}`);
      }

      const dailyPrice = await prisma.goldDailyPrice.createMany({
        data: {
          storeId: store.id,
          goldTypeId: goldType.id,
          isChart: goldType.isChart,
          buyPrice: new Prisma.Decimal(data.buyPrice),
          sellPrice: new Prisma.Decimal(data.sellPrice),
          dailyCode: data.dailyCode,
          timestamp: new Date(),
        }, skipDuplicates: true
      });

      return dailyPrice;
    } catch (error) {
      console.error('Error saving daily price:', error);
      throw error;
    }
  }

  /**
   * Batch save multiple prices
   */
  async saveDailyPricesBatch(prices: Array<{
      storeId: number;
      goldTypeId: number;
      buyPrice: number;
      sellPrice: number;
      dailyCode: string;
  }>) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const price of prices) {
      try {
        await this.saveDailyPrice(price);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${price.storeId} - ${price.goldTypeId}: ${error}`);
      }
    }

    return results;
  }

  /**
   * Archive daily prices to GoldPrice table (end of day)
   */
  async archiveDailyPrices(date: Date = new Date()) {
    try {
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const dailyPrices = await prisma.goldDailyPrice.findMany({
        where: {
          timestamp: {
            gte: startOfDay,
            lte: endOfDay,
          },
          isChart: true
        },
        include: {
          store: true,
          goldType: true,
        },
        orderBy: {
          timestamp: 'asc'
        }
      });

      if (dailyPrices.length === 0) {
        console.log('No daily prices to archive');
        return { archived: 0, deleted: 0 };
      }

      // Group by store and gold type
      const grouped = dailyPrices.reduce((acc, price) => {
        const key = `${price.storeId}-${price.goldTypeId}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(price);
        return acc;
      }, {} as Record<string, typeof dailyPrices>);

      let archived = 0;
      for (const [key, prices] of Object.entries(grouped)) {
        const [storeId, goldTypeId] = key.split('-').map(Number);

        const buyPrices = prices.map(p => Number(p.buyPrice));
        const sellPrices = prices.map(p => Number(p.sellPrice));

        const openBuy = buyPrices[0];
        const openSell = sellPrices[0];
        const closeBuy = buyPrices[buyPrices.length - 1];
        const closeSell = sellPrices[sellPrices.length - 1];
        const highBuy = Math.max(...buyPrices);
        const highSell = Math.max(...sellPrices);
        const lowBuy = Math.min(...buyPrices);
        const lowSell = Math.min(...sellPrices);
        const avgBuy = buyPrices.reduce((a, b) => a + b, 0) / buyPrices.length;
        const avgSell = sellPrices.reduce((a, b) => a + b, 0) / sellPrices.length;

        const previousDay = new Date(startOfDay);
        previousDay.setDate(previousDay.getDate() - 1);

        const prevPrice = await prisma.goldPrice.findFirst({
          where: {
            storeId,
            goldTypeId,
            date: previousDay,
          }
        });

        const changeAmount = prevPrice
          ? closeSell - Number(prevPrice.closeSell)
          : 0;

        const changePercent = prevPrice && Number(prevPrice.closeSell) > 0
          ? (changeAmount / Number(prevPrice.closeSell)) * 100
          : 0;

        await prisma.goldPrice.upsert({
          where: {
            storeId_goldTypeId_date: {
              storeId,
              goldTypeId,
              date: startOfDay,
            }
          },
          create: {
            storeId,
            goldTypeId,
            date: startOfDay,
            openBuy: new Prisma.Decimal(openBuy),
            openSell: new Prisma.Decimal(openSell),
            closeBuy: new Prisma.Decimal(closeBuy),
            closeSell: new Prisma.Decimal(closeSell),
            highBuy: new Prisma.Decimal(highBuy),
            highSell: new Prisma.Decimal(highSell),
            lowBuy: new Prisma.Decimal(lowBuy),
            lowSell: new Prisma.Decimal(lowSell),
            avgBuy: new Prisma.Decimal(avgBuy),
            avgSell: new Prisma.Decimal(avgSell),
            changeAmount: new Prisma.Decimal(changeAmount),
            changePercent: new Prisma.Decimal(changePercent),
          },
          update: {
            openBuy: new Prisma.Decimal(openBuy),
            openSell: new Prisma.Decimal(openSell),
            closeBuy: new Prisma.Decimal(closeBuy),
            closeSell: new Prisma.Decimal(closeSell),
            highBuy: new Prisma.Decimal(highBuy),
            highSell: new Prisma.Decimal(highSell),
            lowBuy: new Prisma.Decimal(lowBuy),
            lowSell: new Prisma.Decimal(lowSell),
            avgBuy: new Prisma.Decimal(avgBuy),
            avgSell: new Prisma.Decimal(avgSell),
            changeAmount: new Prisma.Decimal(changeAmount),
            changePercent: new Prisma.Decimal(changePercent),
          }
        });

        archived++;
      }

      const deleted = await prisma.goldDailyPrice.deleteMany({
        where: {
          timestamp: {
            gte: startOfDay,
            lte: endOfDay,
          }
        }
      });

      console.log(`Archived ${archived} price records, deleted ${deleted.count} daily prices`);
      return { archived, deleted: deleted.count };
    } catch (error) {
      console.error('Error archiving daily prices:', error);
      throw error;
    }
  }

  /**
   * Log crawler execution
   */
  async logCrawlerExecution(data: {
    storeName: string;
    status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
    itemsCount: number;
    errorMessage?: string;
    startedAt: Date;
    completedAt: Date;
  }) {
    return await prisma.crawlerLog.create({
      data: {
        storeName: data.storeName,
        status: data.status,
        itemsCount: data.itemsCount,
        errorMessage: data.errorMessage || null,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
      }
    });
  }

  async disconnect() {
    await prisma.$disconnect();
  }
}

export const crawlerDb = new CrawlerDatabaseService();
