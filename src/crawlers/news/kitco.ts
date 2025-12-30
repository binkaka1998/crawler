// Kitco News Crawler (GraphQL API)
import axios from 'axios'
import type { NewsArticle } from './types.js'
import { cleanText, truncate, generateArticleHash } from './utils.js'
import { slugifyEnglish } from './slugify.js'

const GRAPHQL_URL = 'https://cms.prod.kitco.com/graphql'

/**
 * GraphQL query for Kitco news
 */
const GRAPHQL_QUERY = `
  fragment ArticleFragment on NewsArticle {
    id
    category {
      id
      name
      urlAlias
    }
    teaserSnippet
    title
    teaserHeadline
    urlAlias
    createdAt
  }

  query GetGoldNews($urlAlias: String!, $limit: Int, $offset: Int) {
    nodeListByCategory(
      limit: $limit
      offset: $offset
      urlAlias: $urlAlias
      includeRelatedCategories: false
      includeEntityQueues: false
    ) {
      total
      items {
        ... on NewsArticle {
          ...ArticleFragment
        }
      }
    }
  }
`

interface KitcoResponse {
  data: {
    nodeListByCategory: {
      total: number
      items: Array<{
        id: number
        title?: string
        teaserHeadline?: string
        teaserSnippet?: string
        urlAlias?: string
        createdAt?: string
      }>
    }
  }
}

/**
 * Crawl top 3 news articles from Kitco using GraphQL API
 */
export async function crawlKitco(): Promise<NewsArticle[]> {
  console.log('📰 [Kitco] Starting crawler (GraphQL API)...')
  
  try {
    const response = await axios.post<KitcoResponse>(
      GRAPHQL_URL,
      {
        query: GRAPHQL_QUERY,
        variables: {
          urlAlias: '/news/category/commodities/gold',
          limit: 3,
          offset: 0
        }
      },
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/graphql-response+json, application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
        }
      }
    )

    const items = response.data?.data?.nodeListByCategory?.items || []
    const articles: NewsArticle[] = []

    items.forEach((item, index) => {
      try {
        // Extract data from GraphQL response
        const headlineEn = cleanText(item.title || item.teaserHeadline || '')
        const contentEn = cleanText(item.teaserSnippet || '')
        const shortEn = truncate(contentEn, 200)
        
        // Build full URL
        const detailLink = item.urlAlias 
          ? `https://www.kitco.com${item.urlAlias}`
          : null

        if (headlineEn && detailLink && contentEn) {
          // Generate slug from headline
          const slugEn = slugifyEnglish(headlineEn)
          
          // Generate unique hash
          const hash = generateArticleHash(detailLink, headlineEn)
          
          articles.push({
            headlineEn,
            slugEn,
            shortEn,
            contentEn,
            detailLink,
            pageCited: 'Kitco',
            hash
          })
        }
      } catch (error) {
        console.error(`⚠️  [Kitco] Error parsing article ${index + 1}:`, error instanceof Error ? error.message : 'Unknown error')
      }
    })

    console.log(`✅ [Kitco] Found ${articles.length} articles`)
    return articles

  } catch (error) {
    console.error('❌ [Kitco] Crawler failed:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

// Run standalone for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  crawlKitco()
    .then(articles => {
      console.log('\n📊 Kitco Articles:\n')
      articles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.headlineEn}`)
        console.log(`   Slug: ${article.slugEn}`)
        console.log(`   Link: ${article.detailLink}`)
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
