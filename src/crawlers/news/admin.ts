#!/usr/bin/env node

// Admin tool for managing news articles
import { 
  getLatestNews, 
  getNewsById, 
  activateNews, 
  deactivateNews, 
  getStats, 
  closeDatabase 
} from './database.js'

const command = process.argv[2]
const arg = process.argv[3]

async function main(): Promise<void> {
  try {
    switch (command) {
      case 'list':
      case 'list-inactive': {
        const limit = arg ? parseInt(arg) : 10
        const articles = await getLatestNews({ limit, active: false })
        
        if (articles.length === 0) {
          console.log('✅ No inactive articles found (all translated!)')
        } else {
          console.log(`\n📋 Inactive Articles (need translation):\n`)
          articles.forEach((article, index) => {
            console.log(`${index + 1}. ID: ${article.id}`)
            console.log(`   Headline (EN): ${article.headlineEn}`)
            console.log(`   Source: ${article.pageCited}`)
            console.log(`   Link: ${article.detailLink}`)
            console.log(`   Date: ${article.createdAt.toLocaleString('vi-VN')}\n`)
          })
        }
        break
      }

      case 'list-active': {
        const limit = arg ? parseInt(arg) : 10
        const articles = await getLatestNews({ limit, active: true })
        
        if (articles.length === 0) {
          console.log('⚠️  No active articles found')
        } else {
          console.log(`\n📋 Active Articles (published):\n`)
          articles.forEach((article, index) => {
            console.log(`${index + 1}. ID: ${article.id}`)
            console.log(`   Headline (VI): ${article.headlineVi || '[Not translated]'}`)
            console.log(`   Headline (EN): ${article.headlineEn}`)
            console.log(`   Slug (VI): ${article.slugVi}`)
            console.log(`   Source: ${article.pageCited}`)
            console.log(`   Date: ${article.createdAt.toLocaleString('vi-VN')}\n`)
          })
        }
        break
      }

      case 'view': {
        if (!arg) {
          console.log('❌ Usage: node admin.ts view <id>')
          break
        }
        
        const id = parseInt(arg)
        const article = await getNewsById(id)
        
        if (!article) {
          console.log(`❌ Article ${id} not found`)
        } else {
          console.log(`\n📄 Article ${id}\n`)
          console.log('--- ENGLISH ---')
          console.log(`Headline: ${article.headlineEn}`)
          console.log(`Slug: ${article.slugEn}`)
          console.log(`Short: ${article.shortEn || '[None]'}`)
          console.log(`Content: ${article.contentEn.substring(0, 200)}...`)
          console.log(`\n--- VIETNAMESE ---`)
          console.log(`Headline: ${article.headlineVi || '[Not translated]'}`)
          console.log(`Slug: ${article.slugVi}`)
          console.log(`Short: ${article.shortVi || '[Not translated]'}`)
          console.log(`Content: ${article.contentVi ? article.contentVi.substring(0, 200) + '...' : '[Not translated]'}`)
          console.log(`\n--- METADATA ---`)
          console.log(`Source: ${article.pageCited}`)
          console.log(`Link: ${article.detailLink}`)
          console.log(`Active: ${article.active ? '✅ Yes' : '❌ No'}`)
          console.log(`Created: ${article.createdAt.toLocaleString('vi-VN')}\n`)
        }
        break
      }

      case 'activate': {
        if (!arg) {
          console.log('❌ Usage: node admin.ts activate <id>')
          break
        }
        
        const id = parseInt(arg)
        await activateNews(id)
        console.log(`✅ Article ${id} activated`)
        break
      }

      case 'deactivate': {
        if (!arg) {
          console.log('❌ Usage: node admin.ts deactivate <id>')
          break
        }
        
        const id = parseInt(arg)
        await deactivateNews(id)
        console.log(`⏸️  Article ${id} deactivated`)
        break
      }

      case 'activate-all': {
        const articles = await getLatestNews({ active: false, limit: 1000 })
        
        let activated = 0
        for (const article of articles) {
          // Only activate if translated (has Vietnamese headline)
          if (article.headlineVi) {
            await activateNews(article.id)
            activated++
          }
        }
        
        console.log(`✅ Activated ${activated} translated articles`)
        break
      }

      case 'stats': {
        const stats = await getStats()
        
        console.log('\n📊 Database Statistics\n')
        console.log(`Total articles: ${stats.total}`)
        console.log(`✅ Active: ${stats.active}`)
        console.log(`⏸️  Inactive: ${stats.inactive}`)
        console.log(`\nBy Source:`)
        stats.bySource.forEach(s => {
          console.log(`  ${s.source}: ${s.count}`)
        })
        console.log()
        break
      }

      case 'export': {
        const limit = arg ? parseInt(arg) : 100
        const articles = await getLatestNews({ limit, active: false })
        
        console.log('id,headlineEn,shortEn,detailLink,pageCited,createdAt')
        articles.forEach(article => {
          const headline = article.headlineEn.replace(/"/g, '""')
          const short = (article.shortEn || '').replace(/"/g, '""')
          console.log(`${article.id},"${headline}","${short}","${article.detailLink}","${article.pageCited}","${article.createdAt.toISOString()}"`)
        })
        break
      }

      default: {
        console.log('\n📰 Gold News Admin Tool\n')
        console.log('Usage:')
        console.log('  node admin.ts <command> [args]\n')
        console.log('Commands:')
        console.log('  node admin.ts list [limit]          - List inactive news')
        console.log('  node admin.ts list-active [limit]   - List active news')
        console.log('  node admin.ts view <id>             - View article details')
        console.log('  node admin.ts activate <id>         - Activate article')
        console.log('  node admin.ts deactivate <id>       - Deactivate article')
        console.log('  node admin.ts activate-all          - Activate all translated')
        console.log('  node admin.ts stats                 - Show statistics')
        console.log('  node admin.ts export [limit]        - Export for translation (CSV)')
        console.log()
      }
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error')
  } finally {
    await closeDatabase()
  }
}

main()
