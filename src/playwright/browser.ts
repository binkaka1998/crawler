import { chromium, Browser, BrowserContext } from 'playwright';

let browser: Browser | null = null;
let context: BrowserContext | null = null;

const launchOptions = {
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
    ],
};

export async function getBrowser(): Promise<Browser> {
    if (!browser) {
        browser = await chromium.launch(launchOptions);
    }
    return browser;
}

export async function getBrowserContext(): Promise<BrowserContext> {
    if (!context) {
        const browserInstance = await getBrowser();

        context = await browserInstance.newContext({
            userAgent:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            locale: 'vi-VN',
            timezoneId: 'Asia/Ho_Chi_Minh',
        });
    }
    return context;
}

export async function closeBrowser() {
    if (context) {
        await context.close();
        context = null;
    }

    if (browser) {
        await browser.close();
        browser = null;
    }
}
