import { PrismaClient } from '@prisma/client';
import { GoldTypeCode } from '../src/lib/gold-type-mapping';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for crawler...');

  // Seed Gold Stores
  console.log('📍 Seeding gold stores...');
  
  const stores = [
    {
      code: 'SJC',
      name: 'Công ty Vàng bạc Đá quý Sài Gòn',
      address: '170 Đ. Nguyễn Văn Trỗi, Phường 8, Phú Nhuận, Hồ Chí Minh',
      phone: '028 3844 0909',
      website: 'https://sjc.com.vn',
      logo: '/logos/sjc.png',
      isActive: true,
    },
    {
      code: 'PNJ',
      name: 'Công ty Vàng bạc Đá quý Phú Nhuận',
      address: '170E Phan Đăng Lưu, Phường 3, Phú Nhuận, Hồ Chí Minh',
      phone: '1800 5454 57',
      website: 'https://www.pnj.com.vn',
      logo: '/logos/pnj.png',
      isActive: true,
    },
    {
      code: 'BTMC',
      name: 'Công ty Bảo Tín Minh Châu',
      address: '72 Trần Hưng Đạo, Phường Cầu Ông Lãnh, Quận 1, Hồ Chí Minh',
      phone: '1900 545 456',
      website: 'https://www.baotinminhchau.com',
      logo: '/logos/btmc.png',
      isActive: true,
    },
    {
      code: 'DOJI',
      name: 'Công ty Vàng bạc Đá quý DOJI',
      address: '36 Tràng Tiền, Hoàn Kiếm, Hà Nội',
      phone: '024 3933 4988',
      website: 'https://doji.vn',
      logo: '/logos/doji.png',
      isActive: true,
    },
  ];

  for (const store of stores) {
    await prisma.goldStore.upsert({
      where: { code: store.code },
      update: store,
      create: store,
    });
    console.log(`   ✅ ${store.name}`);
  }

  // Seed Gold Types
  console.log('');
  console.log('💰 Seeding gold types...');

  const goldTypes = [
    { code: GoldTypeCode.GOLD_9999, name: 'Vàng 9999', unit: 'lượng', description: 'Vàng nguyên chất 99.99%' },
    { code: GoldTypeCode.GOLD_RING_9999, name: 'Vàng nhẫn 9999', unit: 'chỉ', description: 'Vàng nhẫn 99.99%' },
    { code: GoldTypeCode.GOLD_24K, name: 'Vàng 24K', unit: 'lượng', description: 'Vàng 24 karat' },
    { code: GoldTypeCode.GOLD_18K, name: 'Vàng 18K', unit: 'chỉ', description: 'Vàng 18 karat' },
    { code: GoldTypeCode.GOLD_14K, name: 'Vàng 14K', unit: 'chỉ', description: 'Vàng 14 karat' },
    { code: GoldTypeCode.GOLD_10K, name: 'Vàng 10K', unit: 'chỉ', description: 'Vàng 10 karat' },
    { code: GoldTypeCode.GOLD_SJC_BAR, name: 'Vàng miếng SJC', unit: 'lượng', description: 'Vàng miếng SJC chính hãng' },
    { code: GoldTypeCode.GOLD_PNJ_BAR, name: 'Vàng miếng PNJ', unit: 'lượng', description: 'Vàng miếng PNJ chính hãng' },
    { code: GoldTypeCode.GOLD_DOJI_BAR, name: 'Vàng miếng DOJI', unit: 'lượng', description: 'Vàng miếng DOJI chính hãng' },
  ];

  for (const goldType of goldTypes) {
    await prisma.goldType.upsert({
      where: { code: goldType.code },
      update: goldType,
      create: { ...goldType, isActive: true },
    });
    console.log(`   ✅ ${goldType.name}`);
  }

  console.log('');
  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
