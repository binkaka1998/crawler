/**
 * Gold Type Mapping Enum for Crawler
 */

export enum GoldTypeCode {
  GOLD_9999 = 'GOLD_9999',
  GOLD_RING_9999 = 'GOLD_RING_9999',
  GOLD_24K = 'GOLD_24K',
  GOLD_18K = 'GOLD_18K',
  GOLD_14K = 'GOLD_14K',
  GOLD_10K = 'GOLD_10K',
  GOLD_SJC_BAR = 'GOLD_SJC_BAR',
  GOLD_PNJ_BAR = 'GOLD_PNJ_BAR',
  GOLD_DOJI_BAR = 'GOLD_DOJI_BAR',
}

export const GOLD_TYPE_MAPPING: Record<string, [string, GoldTypeCode][]> = {
  BTMC: [
    ['Vàng rồng Thăng Long 9999', GoldTypeCode.GOLD_9999],
    ['Vàng rồng Thăng Long 999.9', GoldTypeCode.GOLD_9999],
    ['Vàng 9999', GoldTypeCode.GOLD_9999],
    ['Vàng 999.9', GoldTypeCode.GOLD_9999],
    ['Vàng nhẫn 9999', GoldTypeCode.GOLD_RING_9999],
    ['Vàng nhẫn 999.9', GoldTypeCode.GOLD_RING_9999],
    ['Vàng nhẫn trơn 9999', GoldTypeCode.GOLD_RING_9999],
    ['Vàng 24K', GoldTypeCode.GOLD_24K],
    ['Vàng 18K', GoldTypeCode.GOLD_18K],
    ['Vàng 14K', GoldTypeCode.GOLD_14K],
    ['Vàng 10K', GoldTypeCode.GOLD_10K],
  ],

  SJC: [
    ['Vàng SJC', GoldTypeCode.GOLD_SJC_BAR],
    ['Vàng miếng SJC', GoldTypeCode.GOLD_SJC_BAR],
    ['Vàng miếng SJC 1L', GoldTypeCode.GOLD_SJC_BAR],
    ['Vàng miếng SJC 5c', GoldTypeCode.GOLD_SJC_BAR],
    ['Vàng 9999', GoldTypeCode.GOLD_9999],
    ['Vàng 999.9', GoldTypeCode.GOLD_9999],
    ['Vàng nhẫn 9999', GoldTypeCode.GOLD_RING_9999],
    ['Vàng 24K', GoldTypeCode.GOLD_24K],
    ['Vàng 18K', GoldTypeCode.GOLD_18K],
  ],

  PNJ: [
    ['Vàng miếng SJC 1L', GoldTypeCode.GOLD_SJC_BAR],
    ['Vàng miếng SJC 5c', GoldTypeCode.GOLD_SJC_BAR],
    ['Vàng miếng PNJ', GoldTypeCode.GOLD_PNJ_BAR],
    ['Vàng miếng PNJ 999.9', GoldTypeCode.GOLD_PNJ_BAR],
    ['Vàng 9999', GoldTypeCode.GOLD_9999],
    ['Vàng 999.9', GoldTypeCode.GOLD_9999],
    ['Vàng nhẫn 9999', GoldTypeCode.GOLD_RING_9999],
    ['Vàng nhẫn trơn', GoldTypeCode.GOLD_RING_9999],
    ['Vàng 24K', GoldTypeCode.GOLD_24K],
    ['Vàng 18K', GoldTypeCode.GOLD_18K],
    ['Vàng 14K', GoldTypeCode.GOLD_14K],
    ['Vàng 10K', GoldTypeCode.GOLD_10K],
  ],

  DOJI: [
    ['Vàng miếng SJC', GoldTypeCode.GOLD_SJC_BAR],
    ['Vàng DOJI', GoldTypeCode.GOLD_DOJI_BAR],
    ['Vàng miếng DOJI 999.9', GoldTypeCode.GOLD_DOJI_BAR],
    ['Vàng 9999', GoldTypeCode.GOLD_9999],
    ['Vàng 999.9', GoldTypeCode.GOLD_9999],
    ['Vàng nhẫn 9999', GoldTypeCode.GOLD_RING_9999],
    ['Vàng 24K', GoldTypeCode.GOLD_24K],
    ['Vàng 18K', GoldTypeCode.GOLD_18K],
  ],
};

export function mapGoldType(storeId: string, goldId: string): GoldTypeCode | null {
  const storeMapping = GOLD_TYPE_MAPPING[storeId];
  if (!storeMapping) {
    console.warn(`No mapping configuration found for store: ${storeId}`);
    return null;
  }

  const normalizedInput = goldId.trim().toLowerCase();

  for (const [storeName, standardCode] of storeMapping) {
    const normalizedStoreName = storeName.toLowerCase();
    if (normalizedInput.includes(normalizedStoreName) || normalizedStoreName.includes(normalizedInput)) {
      return standardCode;
    }
  }

  return null;
}
