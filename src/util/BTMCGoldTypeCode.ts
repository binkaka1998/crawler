export enum BTMCGoldTypeCode {
    ROW_2 = 'BTMC_24K',   // VÀNG MIẾNG VRTL
    ROW_3 = 'BTMC_NL',     // VÀNG NGUYÊN LIỆU
    ROW_4 = 'BTMC_R24K',   // NHẪN TRÒN TRƠN
    ROW_5 = 'BTMC_TS999',  // TRANG SỨC 99.9
    ROW_6 = 'BTMC_TS9999', // TRANG SỨC 999.9
    ROW_7 = 'BTMC_SJC',    // VÀNG MIẾNG SJC
}
function resolveGoldTypeCode(row: number): BTMCGoldTypeCode | null {
    const key = `ROW_${row}` as keyof typeof BTMCGoldTypeCode;
    return BTMCGoldTypeCode[key] ?? null;
}