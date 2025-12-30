# News Crawler - API Information

## ✅ Kitco - GraphQL API (Already Implemented!)

### Endpoint:
```
POST https://cms.prod.kitco.com/graphql
```

### Query:
```graphql
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
```

### Variables:
```json
{
  "urlAlias": "/news/category/commodities/gold",
  "limit": 3,
  "offset": 0
}
```

### Response Format:
```json
{
  "data": {
    "nodeListByCategory": {
      "total": 3670,
      "items": [
        {
          "id": 214601,
          "category": {
            "id": 48,
            "name": "Gold",
            "urlAlias": "/news/category/commodities/gold"
          },
          "teaserSnippet": "Gold and silver prices are steady...",
          "title": "Gold, silver see modest profit taking...",
          "teaserHeadline": null,
          "urlAlias": "/news/article/2025-12-24/gold-silver-see-modest...",
          "createdAt": "2025-12-24T11:45:25-0500"
        }
      ]
    }
  }
}
```

### Implementation:
✅ Already implemented in `src/crawlers/kitco.js`
✅ Uses axios POST request
✅ Proper error handling
✅ Extracts: title, snippet, URL, date
✅ Generates slugs and hashes

---

## 📰 DailyForex - Detail Page Fetching

### URL:
```
List: https://www.dailyforex.com/forex-technical-analysis/gold-price-forecast/page-1
Detail: https://www.dailyforex.com/forex-technical-analysis/2024/12/24/...
```

### Method:
1. **List page**: HTML scraping for headlines (`.most-recent .article-title`)
2. **Detail pages**: Fetch each article's full content
3. **Content extraction**: Remove HTML, images, ads - get clean text
4. **Articles**: Top 5 (with full content ~2000+ chars)

### Implementation:
✅ Implemented in `src/crawlers/dailyforex.js`
✅ Fetches full article content
✅ 5 articles total
✅ 2000+ characters per article
✅ Clean text extraction

---

## 📊 MarketWatch - Headlines Only

### URL:
```
https://www.marketwatch.com/investing/future/gc00
```

### Method:
- HTML scraping from gold futures page
- Selector: `.module--section.top--quote--headlines .article__headline`
- Extracts: headline + summary (if available)
- **No detail page fetch** (subscription required)
- Articles: Top 3 (headlines + summaries only)

### Why Headlines Only:
❌ Detail pages require subscription
✅ Headlines available on listing page
✅ Summaries available on listing page
✅ Good for SEO and news index
✅ No copyright issues

### Implementation:
✅ Implemented in `src/crawlers/marketwatch.js`
✅ Gets headlines + summaries
✅ No subscription needed
✅ 3 articles total

---

## 🔄 How It Works Now

### Kitco (GraphQL - Fast & Reliable):
```javascript
POST https://cms.prod.kitco.com/graphql
→ Returns structured JSON
→ Fast, reliable, no HTML parsing
→ Direct access to data
→ 3 articles with snippets
```

### DailyForex (HTML + Detail Fetch - Full Content):
```javascript
GET https://www.dailyforex.com/forex-technical-analysis/gold-price-forecast/page-1
→ Parse listing page HTML
→ Extract top 5 article links
→ Fetch each detail page (5 requests)
→ Extract full article content (2000+ chars)
→ Clean text (remove HTML, images, ads)
→ 5 articles with full content
```

### MarketWatch (HTML - Headlines Only):
```javascript
GET https://www.marketwatch.com/investing/future/gc00
→ Parse gold futures page HTML
→ Extract headlines + summaries from listing
→ No detail page fetch (subscription required)
→ 3 articles with headlines + summaries
```

---

## ✅ Current Status

| Source | Method | Articles | Content Type | Speed | Reliability |
|--------|---------|----------|--------------|-------|-------------|
| Kitco | GraphQL API | 3 | Snippets (~500 chars) | ⚡ Fast | ⭐⭐⭐⭐⭐ |
| DailyForex | HTML + Detail Fetch | 5 | **Full Articles (~2000+ chars)** | 🐌 Slower | ⭐⭐⭐⭐ |
| MarketWatch | HTML Scraping | 3 | Headlines + Summaries (~200 chars) | ⚡ Fast | ⭐⭐⭐⭐ |
| **TOTAL** | | **11** | **Mixed** | | |

---

## 🚀 Benefits of GraphQL (Kitco)

### Advantages:
✅ **Fast** - Direct data access, no HTML parsing
✅ **Reliable** - Structured schema, won't break easily
✅ **Efficient** - Only request needed fields
✅ **Typed** - Clear data structure
✅ **Documented** - GraphQL introspection

### vs HTML Scraping:
❌ HTML structure can change anytime
❌ Need to parse entire page
❌ Fragile selectors
❌ Slower processing
❌ No data typing

---

## 📝 Example Output

All 3 crawlers return the same format:

```javascript
{
  headlineEn: "Gold Prices Surge to Record Highs",
  slugEn: "gold-prices-surge-to-record-highs",
  shortEn: "Gold futures jumped 2% on Friday as investors...",
  contentEn: "Gold futures jumped 2% on Friday as investors sought...",
  detailLink: "https://www.kitco.com/news/article/2025-12-24/...",
  pageCited: "Kitco",
  hash: "a7b8c9d1e2f3..."
}
```

This consistent format works with your database schema perfectly!

---

## 🔍 Testing

Test each crawler individually:

```bash
# Kitco (GraphQL)
node src/crawlers/kitco.js

# DailyForex (HTML)
node src/crawlers/dailyforex.js

# MarketWatch (HTML)
node src/crawlers/marketwatch.js
```

---

## 💡 Future Improvements

If DailyForex or MarketWatch offer APIs:
1. Find API endpoint
2. Check if public or needs key
3. Update crawler to use API
4. Enjoy faster, more reliable crawling!

For now, Kitco's GraphQL implementation is the gold standard! ⭐
