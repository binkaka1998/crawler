// Database functions for News Crawler
import { PrismaClient } from '@prisma/client'
import type { NewsArticle, SaveStats, DBStats, NewsRecord } from './types.js'
import { slugifyEnglish } from './slugify.js'

const prisma = new PrismaClient()

/**
 * Save articles to database
 */
export async function saveArticles(articles: NewsArticle[]): Promise<SaveStats> {
  const stats: SaveStats = {
    total: articles.length,
    saved: 0,
    skipped: 0,
    failed: 0
  }

  for (const article of articles) {
    try {
      // Check if article already exists by hash
      const existing = await prisma.news.findUnique({
        where: { hash: article.hash }
      })

      if (existing) {
        console.log(`   ⏭️  Skipped (duplicate): "${article.headlineEn.substring(0, 50)}..."`)
        stats.skipped++
        continue
      }

      // Create new article
      await prisma.news.create({
        data: {
          headlineEn: article.headlineEn,
          slugEn: article.slugEn,
          slugVi: article.slugEn, // Initially same as English
          shortEn: article.shortEn,
          contentEn: article.contentEn,
          detailLink: article.detailLink,
          pageCited: article.pageCited,
          hash: article.hash,
          active: false // Inactive by default (needs translation)
        }
      })

      console.log(`   ✅ Saved: "${article.headlineEn.substring(0, 50)}..." [active=false]`)
      stats.saved++

    } catch (error) {
      console.error(`   ❌ Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`)
      stats.failed++
    }
  }

  return stats
}

/**
 * Get latest news articles
 */
export async function getLatestNews(options: {
  limit?: number
  active?: boolean
  source?: string
} = {}): Promise<NewsRecord[]> {
  const { limit = 10, active, source } = options

  const where: any = {}
  if (active !== undefined) where.active = active
  if (source) where.pageCited = source

  return prisma.news.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

/**
 * Get news by ID
 */
export async function getNewsById(id: number): Promise<NewsRecord | null> {
  return prisma.news.findUnique({
    where: { id }
  })
}

/**
 * Update news article
 */
export async function updateNews(id: number, data: Partial<NewsRecord>): Promise<NewsRecord> {
  return prisma.news.update({
    where: { id },
    data
  })
}

/**
 * Activate news article
 */
export async function activateNews(id: number): Promise<NewsRecord> {
  return prisma.news.update({
    where: { id },
    data: { active: true }
  })
}

/**
 * Deactivate news article
 */
export async function deactivateNews(id: number): Promise<NewsRecord> {
  return prisma.news.update({
    where: { id },
    data: { active: false }
  })
}

/**
 * Get database statistics
 */
export async function getStats(): Promise<DBStats> {
  const [total, active, inactive, bySource] = await Promise.all([
    prisma.news.count(),
    prisma.news.count({ where: { active: true } }),
    prisma.news.count({ where: { active: false } }),
    prisma.news.groupBy({
      by: ['pageCited'],
      _count: true
    })
  ])

  return {
    total,
    active,
    inactive,
    bySource: bySource.map(s => ({
      source: s.pageCited,
      count: s._count
    }))
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  await prisma.$disconnect()
}
