// Utility functions for News Crawler
import crypto from 'crypto'

export function generateHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex')
}

export function generateArticleHash(url: string, headline: string): string {
  return generateHash(`${url}||${headline}`)
}

export function cleanText(text: string | null | undefined): string {
  if (!text) return ''
  return text.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim()
}

export function truncate(text: string | null | undefined, maxLength: number = 200): string {
  if (!text || text.length <= maxLength) return text || ''
  const truncated = text.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...'
}

export function makeAbsoluteUrl(url: string | null | undefined, baseUrl: string): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  try {
    return new URL(url, baseUrl).href
  } catch {
    return url
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
