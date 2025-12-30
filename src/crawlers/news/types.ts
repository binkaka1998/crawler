// Type definitions for News Crawler

export interface NewsArticle {
  headlineEn: string
  slugEn: string
  shortEn: string
  contentEn: string
  detailLink: string
  pageCited: 'Kitco' | 'DailyForex' | 'MarketWatch'
  hash: string
}

export interface SaveStats {
  total: number
  saved: number
  skipped: number
  failed: number
}

export interface DBStats {
  total: number
  active: number
  inactive: number
  bySource: SourceStats[]
}

export interface SourceStats {
  source: string
  count: number
}

export interface NewsRecord {
  id: number
  headlineEn: string
  headlineVi: string | null
  slugEn: string
  slugVi: string
  shortEn: string | null
  shortVi: string | null
  contentEn: string
  contentVi: string | null
  detailLink: string
  pageCited: string
  hash: string
  active: boolean
  createdAt: Date
}

export interface BrowserHeaders {
  'User-Agent': string
  'Accept': string
  'Accept-Language': string
  'Accept-Encoding': string
  'Connection': string
  'Upgrade-Insecure-Requests': string
  'Sec-Fetch-Dest': string
  'Sec-Fetch-Mode': string
  'Sec-Fetch-Site': string
  'Sec-Fetch-User': string
  'Cache-Control': string
  'sec-ch-ua': string
  'sec-ch-ua-mobile': string
  'sec-ch-ua-platform': string
  'Referer'?: string
}
