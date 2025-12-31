// DailyForex News Crawler - Full Article Content
import axios, { AxiosResponse } from 'axios'
import * as cheerio from 'cheerio'
import type { NewsArticle } from './types.js'
import { cleanText, truncate, makeAbsoluteUrl, generateArticleHash, sleep } from './utils.js'
import { slugifyEnglish } from './slugify.js'

const BASE_URL = 'https://www.dailyforex.com'
const NEWS_URL = 'https://www.dailyforex.com/forex-technical-analysis/gold-price-forecast/page-1'

/**
 * Get realistic browser headers to avoid detection
 */
function getBrowserHeaders() {
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
    'sec-ch-ua-platform': '"Windows"'
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
        headers: {
          ...getBrowserHeaders()
        },
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
 * Fetch full article content from detail page
 */
async function fetchArticleContent(detailUrl: string): Promise<string | null> {
  try {
    const response = await fetchWithRetry(detailUrl)

    if (!response || !response.data) {
      return null
    }

    const $ = cheerio.load(response.data)

    // Remove unwanted elements
    $('script, style, img, figure, iframe, video, audio, noscript, .ad, .advertisement, .social-share').remove()

    // Find article content - try multiple selectors
    let content = ''

    const contentSelectors = [
      '.article-content',
      '.article-body',
      '.entry-content',
      '.post-content',
      'article .content',
      '[itemprop="articleBody"]',
      '.article-text',
      '.main-content',
      '.post-body',
      '.content-body'
    ]

    for (const selector of contentSelectors) {
      const element = $(selector)
      if (element.length > 0) {
        content = element.text()
        break
      }
    }

    // Fallback: get all paragraphs
    if (!content || content.length < 100) {
      const paragraphs: string[] = []
      $('article p, .article p, .post p, .content p, main p').each((i, elem) => {
        const text = $(elem).text().trim()
        if (text.length > 50) {
          paragraphs.push(text)
        }
      })
      content = paragraphs.join('\n\n')
    }

    return cleanText(content)

  } catch (error) {
    console.error(`⚠️  Failed to fetch content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return null
  }
}

/**
 * Crawl top 5 most recent articles from DailyForex
 */
export async function crawlDailyForex(): Promise<NewsArticle[]> {
  console.log('📰 [DailyForex] Starting crawler...')

  try {
    const response = await fetchWithRetry(NEWS_URL)

    if (!response || !response.data) {
      console.error('❌ [DailyForex] Failed to fetch listing page')
      return []
    }

    const $ = cheerio.load(response.data)
    const articles: NewsArticle[] = []

    // Find most-recent articles (top 5)
    const articleElements = $('.most-recent .article-title, .most-recent h3, .most-recent h2').slice(0, 5)

    if (articleElements.length === 0) {
      console.log('⚠️  [DailyForex] No articles found with selector, trying alternative...')

      const fallbackElements = $('a[href*="forex-technical-analysis"]').slice(0, 5)

      if (fallbackElements.length === 0) {
        console.error('❌ [DailyForex] No articles found')
        return []
      }

      console.log(`✅ Found ${fallbackElements.length} articles with fallback selector`)
    }

    const elements = articleElements.length > 0 ? articleElements : $('a[href*="forex-technical-analysis"]').slice(0, 5)

    for (let i = 0; i < Math.min(elements.length, 5); i++) {
      const element = elements[i]

      try {
        const $elem = $(element)
        const $link = $elem.is('a') ? $elem : $elem.find('a')

        const headlineEn = cleanText($link.text() || $elem.text())
        let detailLink = $link.attr('href') ? $link.attr('href') : null

        if (!detailLink) continue

        detailLink = makeAbsoluteUrl(detailLink, BASE_URL)

        if (!headlineEn || !detailLink) continue

        console.log(`📄 [DailyForex] (${i + 1}/5) Fetching: "${headlineEn.substring(0, 50)}..."`)

        // Fetch full article content
        const fullContent = await fetchArticleContent(detailLink)

        if (!fullContent || fullContent.length < 100) {
          console.log(`   ⚠️  Content too short, skipping`)
          continue
        }

        // Generate slug
        const slugEn = slugifyEnglish(headlineEn)

        // Create short excerpt
        const shortEn = truncate(fullContent, 200)

        // Generate hash
        const hash = generateArticleHash(detailLink, headlineEn)

        articles.push({
          headlineEn,
          slugEn,
          shortEn,
          contentEn: fullContent,
          detailLink,
          pageCited: 'DailyForex',
          hash
        })

        console.log(`   ✅ Success (${fullContent.length} chars)`)

        // Polite delay between requests (2-3 seconds random)
        if (i < Math.min(elements.length, 5) - 1) {
          const delay = 2000 + Math.random() * 1000
          await sleep(delay)
        }

      } catch (error) {
        console.error(`⚠️  [DailyForex] Error processing article ${i + 1}:`, error instanceof Error ? error.message : 'Unknown error')
      }
    }

    console.log(`✅ [DailyForex] Found ${articles.length} articles`)
    return articles

  } catch (error) {
    console.error('❌ [DailyForex] Crawler failed:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
}

// Run standalone for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  crawlDailyForex()
    .then(articles => {
      console.log('\n📊 DailyForex Articles:\n')
      articles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.headlineEn}`)
        console.log(`   Slug: ${article.slugEn}`)
        console.log(`   Link: ${article.detailLink}`)
        console.log(`   Content: ${article.contentEn.length} chars`)
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
