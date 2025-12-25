// import axios from 'axios';
// import * as cheerio from 'cheerio';
//
// export interface CrawledPrice {
//     storeId: number;
//     goldTypeId: number;
//     buyPrice: number;
//     sellPrice: number;
// }
//
// /**
//  * SJC Crawler
//  * Crawls gold prices from SJC website
//  */
// export class SJCCrawler {
//   protected storeCode = 'SJC';
//   protected storeName = 'Công ty Vàng bạc Đá quý Sài Gòn';
//
//   async crawl(): Promise<CrawledPrice[]> {
//     try {
//       console.log(`[${this.storeName}] Starting crawl...`);
//
//       const url = 'https://sjc.com.vn/xml/tygiavang.xml';
//       const response = await axios.get(url, {
//         timeout: 30000,
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//         }
//       });
//
//       const $ = cheerio.load(response.data, { xmlMode: true });
//       const prices: CrawledPrice[] = [];
//
//       // Parse XML from SJC
//       $('city').each((_, cityElem) => {
//         const cityName = $(cityElem).attr('name');
//
//         // Only get prices from HCM and HN
//         if (cityName === 'HCM' || cityName === 'HN') {
//           $('item', cityElem).each((_, item) => {
//             const goldTypeName = $(item).attr('type') || '';
//             const buyStr = $(item).attr('buy') || '0';
//             const sellStr = $(item).attr('sell') || '0';
//
//             const buyPrice = this.parsePrice(buyStr);
//             const sellPrice = this.parsePrice(sellStr);
//
//             if (goldTypeName && buyPrice > 0 && sellPrice > 0) {
//               prices.push({
//                 storeCode: this.storeCode,
//                 goldTypeName,
//                 buyPrice,
//                 sellPrice,
//               });
//             }
//           });
//         }
//       });
//
//       console.log(`[${this.storeName}] Found ${prices.length} prices`);
//       return prices;
//
//     } catch (error) {
//       console.error(`[${this.storeName}] Error:`, error);
//       return [];
//     }
//   }
//
//   protected parsePrice(priceStr: string): number {
//     // Remove all non-numeric characters except decimal point
//     const cleaned = priceStr.replace(/[^\d.]/g, '');
//     return parseFloat(cleaned) || 0;
//   }
// }
