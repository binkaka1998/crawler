import { getBrowserContext } from './browser';

export async function fetchJsonViaPlaywright<T>(url: string): Promise<T> {
    const context = await getBrowserContext();
    const page = await context.newPage();

    try {
        console.log(`[Playwright] Navigating to: ${url}`);

        const response = await page.goto(url, {
            waitUntil: 'domcontentloaded', // Changed from 'networkidle' (more reliable)
            timeout: 30000, // Reduced from 60s to 30s
        });

        if (!response) {
            throw new Error('No response');
        }

        const status = response.status();
        console.log(`[Playwright] Response status: ${status}`);

        if (status === 401) {
            throw new Error('401 Unauthorized - API might require authentication');
        }

        if (status === 403) {
            throw new Error('403 Forbidden - Request blocked');
        }

        if (status >= 400) {
            throw new Error(`HTTP ${status} error`);
        }

        // Get JSON content
        const text = await response.text();
        const data = JSON.parse(text) as T;

        console.log(`[Playwright] ✅ Successfully fetched JSON`);
        return data;

    } catch (error: any) {
        console.error(`[Playwright] ❌ Error:`, error.message);
        throw error;
    } finally {
        await page.close();
    }
}

/**
 * Fetch JSON with retry logic
 */
export async function fetchJsonViaPlaywrightWithRetry<T>(
    url: string,
    maxRetries: number = 3
): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const delay = Math.min(2000 * Math.pow(2, attempt - 1), 10000);
                console.log(`[Playwright Retry] Waiting ${delay}ms before attempt ${attempt + 1}...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            console.log(`[Playwright Retry] Attempt ${attempt + 1}/${maxRetries}`);
            return await fetchJsonViaPlaywright<T>(url);

        } catch (error: any) {
            console.error(`[Playwright Retry] Attempt ${attempt + 1} failed:`, error.message);

            if (attempt === maxRetries - 1) {
                throw error;
            }
        }
    }

    throw new Error(`Failed after ${maxRetries} attempts`);
}
