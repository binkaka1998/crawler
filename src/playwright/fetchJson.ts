import { getBrowserContext } from './browser';

export async function fetchJsonViaPlaywright<T>(url: string): Promise<T> {
    const context = await getBrowserContext();
    const page = await context.newPage();

    try {
        const response = await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 60000,
        });

        if (!response) {
            throw new Error('No response');
        }

        const text = await response.text();
        return JSON.parse(text) as T;
    } finally {
        await page.close();
    }
}
