import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate sample gold price data for testing
 */
async function generateSampleData() {
  console.log('🌱 Generating sample data...');

  // Get stores
  const stores = await prisma.goldStore.findMany();
  const goldTypes = await prisma.goldType.findMany();

  if (stores.length === 0 || goldTypes.length === 0) {
    console.error('❌ Please run seed first: npm run prisma:seed');
    return;
  }

  console.log(`Found ${stores.length} stores and ${goldTypes.length} gold types`);

  // Generate daily prices (last 7 days of data)
  console.log('\n📊 Generating historical daily prices...');
  
  const basePrice = 78000000; // Base price: 78 million VND
  const today = new Date();

  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(0, 0, 0, 0);

    for (const store of stores) {
      for (const goldType of goldTypes) {
        // Generate random but realistic price variations
        const storeOffset = stores.indexOf(store) * 50000;
        const typeOffset = goldTypes.indexOf(goldType) * 100000;
        const randomVariation = (Math.random() - 0.5) * 500000;
        
        const openBuy = basePrice + storeOffset + typeOffset + randomVariation;
        const openSell = openBuy + 500000; // 500k spread
        
        const highBuy = openBuy + Math.random() * 200000;
        const highSell = openSell + Math.random() * 200000;
        
        const lowBuy = openBuy - Math.random() * 200000;
        const lowSell = openSell - Math.random() * 200000;
        
        const closeBuy = openBuy + (Math.random() - 0.5) * 100000;
        const closeSell = openSell + (Math.random() - 0.5) * 100000;
        
        const avgBuy = (openBuy + closeBuy + highBuy + lowBuy) / 4;
        const avgSell = (openSell + closeSell + highSell + lowSell) / 4;

        // Get previous day for change calculation
        const prevDay = new Date(date);
        prevDay.setDate(prevDay.getDate() - 1);
        
        const prevPrice = await prisma.goldPrice.findFirst({
          where: {
            storeId: store.id,
            goldTypeId: goldType.id,
            date: prevDay,
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
              storeId: store.id,
              goldTypeId: goldType.id,
              date: date,
            }
          },
          create: {
            storeId: store.id,
            goldTypeId: goldType.id,
            date,
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
      }
    }
    
    console.log(`   ✅ Generated data for ${date.toDateString()}`);
  }

  // Generate today's intraday prices (simulate 15-min updates)
  console.log('\n⏰ Generating today\'s intraday prices...');
  
  const now = new Date();
  const startOfDay = new Date(now.setHours(8, 0, 0, 0));
  
  for (let i = 0; i < 40; i++) { // 40 updates = 10 hours of data
    const timestamp = new Date(startOfDay.getTime() + i * 15 * 60 * 1000);
    
    for (const store of stores) {
      for (const goldType of goldTypes) {
        const storeOffset = stores.indexOf(store) * 50000;
        const typeOffset = goldTypes.indexOf(goldType) * 100000;
        const timeVariation = (Math.random() - 0.5) * 300000;
        
        const buyPrice = basePrice + storeOffset + typeOffset + timeVariation;
        const sellPrice = buyPrice + 500000;

        await prisma.goldDailyPrice.create({
          data: {
            storeId: store.id,
            goldTypeId: goldType.id,
            buyPrice: new Prisma.Decimal(buyPrice),
            sellPrice: new Prisma.Decimal(sellPrice),
            timestamp,
          }
        });
      }
    }
    
    if (i % 10 === 0) {
      console.log(`   ✅ Generated ${i * stores.length * goldTypes.length} intraday records`);
    }
  }

  console.log('\n✨ Sample data generation complete!');
  console.log(`   - Historical data: Last 31 days`);
  console.log(`   - Intraday data: Today's prices every 15 mins`);
  console.log(`   - Total historical records: ${31 * stores.length * goldTypes.length}`);
  console.log(`   - Total intraday records: ${40 * stores.length * goldTypes.length}`);
}

generateSampleData()
  .catch((e) => {
    console.error('❌ Error generating sample data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
