import { chromium, Browser, BrowserContext } from 'playwright';

let sharedBrowser: Browser | null = null;
let sharedContext: BrowserContext | null = null;

/**
 * Get a standalone browser instance (for SJC and other crawlers)
 * Each call returns a fresh browser that should be closed after use
 */
export async function getBrowser(): Promise<Browser> {
    const browser = await chromium.launch({
        headless: true,
        args: [
            // Stealth features
            '--disable-blink-features=AutomationControlled',

            // Required for CI/CD
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',

            // Performance
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
        ],
    });

    return browser;
}

/**
 * Get shared browser context (for Mi Hong and API crawlers)
 * Reuses same browser instance across multiple calls
 */
export async function getBrowserContext(): Promise<BrowserContext> {
    if (!sharedBrowser) {
        sharedBrowser = await chromium.launch({
            headless: true,
            args: [
                // Critical: Hide automation
                '--disable-blink-features=AutomationControlled',

                // Required for CI/CD (GitHub Actions)
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',

                // Performance & stability
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-features=IsolateOrigins,site-per-process',

                // Additional stealth
                '--window-size=1920,1080',
            ],
        });
    }

    if (!sharedContext) {
        sharedContext = await sharedBrowser.newContext({
            // Realistic user agent
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',

            // Viewport
            viewport: { width: 1920, height: 1080 },

            // Vietnamese locale
            locale: 'vi-VN',
            timezoneId: 'Asia/Ho_Chi_Minh',

            // Permissions
            permissions: [],

            // Extra headers
            extraHTTPHeaders: {
                'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            },
        });

        // Add init script to hide automation signals
        await sharedContext.addInitScript(() => {
            // Remove webdriver flag
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });

            // Add chrome property
            (window as any).chrome = {
                runtime: {},
            };

            // Override permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters: any) => {
                if (parameters.name === 'notifications') {
                    return Promise.resolve({ state: 'denied' } as PermissionStatus);
                }
                return originalQuery(parameters);
            };

            // Override plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });

            // Override languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['vi-VN', 'vi', 'en-US', 'en'],
            });

            // Override platform
            Object.defineProperty(navigator, 'platform', {
                get: () => 'Win32',
            });
        });
    }

    return sharedContext;
}

/**
 * Close shared browser and context
 */
export async function closeBrowser() {
    if (sharedContext) {
        await sharedContext.close();
        sharedContext = null;
    }
    if (sharedBrowser) {
        await sharedBrowser.close();
        sharedBrowser = null;
    }
}
