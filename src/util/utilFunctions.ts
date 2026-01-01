export function buildDailyCode(date: Date = new Date()): string {
    if (isNaN(date.getTime())) {
        throw new Error('Invalid Date passed to buildDailyCode');
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = date.getMinutes();

    let slot = 1;
    if (min >= 16 && min <= 30) slot = 2;
    else if (min >= 31 && min <= 45) slot = 3;
    else if (min >= 46) slot = 4;

    return `${yyyy}${mm}${dd}${hh}${slot}`;
}

export function buildDailyCodeDate(date: Date = new Date()): string {
    if (isNaN(date.getTime())) {
        throw new Error('Invalid Date passed to buildDailyCode');
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}${mm}${dd}`;
}

/**
 * Normalize string to DB-safe CODE:
 * - remove Vietnamese accents
 * - uppercase
 * - replace spaces with _
 * - remove special characters
 */
export function normalizeGoldCode(input: string): string {
    return input
        .normalize('NFD')                     // split accents
        .replace(/[\u0300-\u036f]/g, '')      // remove accents
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')           // only A-Z 0-9 _
        .replace(/^_+|_+$/g, '');              // trim _
}
