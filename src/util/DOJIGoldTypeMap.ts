export const DOJI_GOLD_TYPE_BY_ROW: Record<number, string> = {
    1: 'DOJI_SJC',
    2: 'DOJI_AVPL',
    3: 'DOJI_R24K',
    4: 'DOJI_TS9999',
    5: 'DOJI_TS999',
    6: 'DOJI_TS99',
};

export function resolveGoldTypeCode(row: number): string | null {
    return DOJI_GOLD_TYPE_BY_ROW[row] ?? null;
}