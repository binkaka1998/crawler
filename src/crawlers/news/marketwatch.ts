// MarketWatch News Crawler - Headlines from Gold Futures Page
import axios, { AxiosResponse } from 'axios'
import * as cheerio from 'cheerio'
import type { NewsArticle, BrowserHeaders } from './types.js'
import { cleanText, truncate, makeAbsoluteUrl, generateArticleHash, sleep } from './utils.js'
import { slugifyEnglish } from './slugify.js'

const BASE_URL = 'https://www.marketwatch.com'
const NEWS_URL = 'https://www.marketwatch.com/investing/future/gc00'

/**
 * Get realistic browser headers to avoid detection
 */
function getBrowserHeaders(): BrowserHeaders {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'Referer': 'https://www.marketwatch.com/'
  }
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<AxiosResponse | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: getBrowserHeaders(),
        validateStatus: (status) => status < 500
      })

      if (response.status === 200) {
        return response
      }

      console.log(`⚠️  Status ${response.status}, retrying...`)
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }

      const delay = attempt * 2000
      console.log(`⚠️  Attempt ${attempt} failed, retrying in ${delay/1000}s...`)
      await sleep(delay)
    }
  }
  return null
}

/**
 * Crawl top 3 headlines from MarketWatch Gold Futures page
 */
export async function crawlMarketWatch(): Promise<NewsArticle[]> {
  console.log('📰 [MarketWatch] Starting crawler...')

  try {
    const response = await fetchWithRetry(NEWS_URL)

    if (!response || !response.data) {
      console.error('❌ [MarketWatch] Failed to fetch page')
      return []
    }

    const $ = cheerio.load(response.data)
    const articles: NewsArticle[] = []

    // Try multiple selectors for headlines
    let headlineElements = $('.module--section.top--quote--headlines .article__headline').slice(0, 3)

    if (headlineElements.length === 0) {
      console.log('⚠️  [MarketWatch] Primary selector failed, trying alternatives...')

      // Fallback selectors
      headlineElements = $(
        '.article__headline, ' +
        '.element--article h3, ' +
        '.article-headline a, ' +
        '.link-news-story'
      ).slice(0, 3) as any
    }

    if (headlineElements.length === 0) {
      console.error('❌ [MarketWatch] No articles found')
      return []
    }

    headlineElements.each((index, element) => {
      try {
        const $article = $(element)

        // Get the link element
        const $link = $article.is('a') ? $article : $article.find('a')

        // Extract headline
        const headlineEn = cleanText($link.text() || $article.text())

        // Extract link
        let detailLink = $link.attr('href') ? $link.attr('href') : null

        if (!detailLink) return

        detailLink = makeAbsoluteUrl(detailLink, BASE_URL)

        // Try to find summary/description
        let summary = ''
        const $parent = $article.parent()
        summary = cleanText(
          $parent.find('.article__summary').text() ||
          $parent.find('.article__description').text() ||
          $parent.find('.article__excerpt').text() ||
          $parent.find('p').first().text() ||
          $article.next('p').text()
        )

        // Use headline as content if no summary
        const contentEn = summary || headlineEn
        const shortEn = truncate(contentEn, 200)

        if (headlineEn && detailLink) {
          // Generate slug
          const slugEn = slugifyEnglish(headlineEn)

          // Generate hash
          const hash = generateArticleHash(detailLink, headlineEn)

          articles.push({
            headlineEn,
            slugEn,
            shortEn,
            contentEn,
            detailLink,
            pageCited: 'MarketWatch',
            hash
          })

          console.log(`   ✅ Found: "${headlineEn.substring(0, 50)}..."`)
        }
      } catch (error) {
        console.error(`⚠️  [MarketWatch] Error parsing article ${index + 1}:`, error instanceof Error ? error.message : 'Unknown error')
      }
    })

    console.log(`✅ [MarketWatch] Found ${articles.length} articles`)
    return articles

  } catch (error) {
    console.error('❌ [MarketWatch] Crawler failed:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

// Run standalone for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  crawlMarketWatch()
    .then(articles => {
      console.log('\n📊 MarketWatch Articles:\n')
      articles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.headlineEn}`)
        console.log(`   Slug: ${article.slugEn}`)
        console.log(`   Link: ${article.detailLink}`)
        console.log(`   Content: ${article.contentEn}`)
        console.log(`   Short: ${article.shortEn}`)
        console.log(`   Hash: ${article.hash.substring(0, 16)}...\n`)
      })
      process.exit(0)
    })
    .catch(error => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}
