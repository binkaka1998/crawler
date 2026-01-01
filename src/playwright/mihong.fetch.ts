import { getBrowserContext } from "./browser";

const PAGE_URL = "https://mihong.vn/vi/gia-vang-trong-nuoc";
const API_URL = "https://mihong.vn/api/v1/gold/prices/current";

export interface MiHongApiItem {
    buyingPrice: number;
    sellingPrice: number;
    code: string;
    dateTime: string; // "01/01/2026, 07:00"
}

export interface MiHongApiResponse {
    data: MiHongApiItem[];
}

export async function fetchMiHongPrices(): Promise<MiHongApiResponse> {
    const context = await getBrowserContext();
    const page = await context.newPage();

    try {
        console.log("[MiHong] Visiting page to obtain cookies...");

        await page.goto(PAGE_URL, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });

        const cookies = await context.cookies();

        const xsrf = cookies.find(c => c.name === "XSRF-TOKEN");
        const session = cookies.find(c => c.name === "laravel_session");

        if (!xsrf || !session) {
            throw new Error("Missing XSRF-TOKEN or laravel_session");
        }

        const cookieHeader = cookies
            .map(c => `${c.name}=${c.value}`)
            .join("; ");

        console.log("[MiHong] Calling API...");

        const response = await page.request.get(API_URL, {
            headers: {
                "Accept": "*/*",
                "X-Requested-With": "XMLHttpRequest",
                "X-XSRF-TOKEN": decodeURIComponent(xsrf.value),
                "Referer": PAGE_URL,
                "Cookie": cookieHeader,
            },
        });

        if (!response.ok()) {
            throw new Error(`HTTP ${response.status()}`);
        }

        return await response.json();

    } finally {
        await page.close();
    }
}
