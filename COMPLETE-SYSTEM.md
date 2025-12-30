# Gold Tracker - Complete System (Fixed!) ✅

## 🎉 What's Included Now

This is the **complete, combined gold tracking system** with:

1. ✅ **Price Crawler** (TypeScript) - All 5 stores
2. ✅ **News Crawler** (TypeScript) - All 3 sources
3. ✅ **Combined Database** - One schema
4. ✅ **Master Index** - Run both together
5. ✅ **Complete Structure** - All files present

---

## 📦 Complete File Structure

```
gold-tracker-combined/
├── src/
│   ├── index.ts ✅                 # Master entry (runs both)
│   ├── run-once.ts ✅              # Price crawler (run once)
│   ├── scheduler.ts ✅             # Price scheduler
│   ├── run-archive-once.ts ✅      # Archive old prices
│   ├── crawler-manager.ts ✅       # Crawler orchestration
│   │
│   ├── crawlers/
│   │   ├── price/ ✅               # Price crawlers (TypeScript)
│   │   │   ├── index.ts
│   │   │   ├── SJCCrawler.ts
│   │   │   ├── PNJCrawler.ts
│   │   │   ├── DOJICrawler.ts
│   │   │   ├── BTMCCrawler.ts
│   │   │   └── MiHongCrawler.ts
│   │   │
│   │   └── news/ ✅                # News crawlers (TypeScript)
│   │       ├── types.ts
│   │       ├── utils.ts
│   │       ├── slugify.ts
│   │       ├── database.ts
│   │       ├── kitco.ts
│   │       ├── dailyforex.ts
│   │       ├── marketwatch.ts
│   │       ├── index.ts
│   │       ├── admin.ts
│   │       └── scheduler.ts
│   │
│   ├── lib/ ✅                     # Shared libraries
│   │   ├── prisma.ts
│   │   ├── database.ts
│   │   └── gold-type-mapping.ts
│   │
│   ├── playwright/ ✅              # Browser automation
│   │   ├── browser.ts
│   │   └── fetchJson.ts
│   │
│   └── util/ ✅                    # Utilities
│       └── utilFunctions.ts
│
├── prisma/
│   └── schema.prisma ✅            # Combined schema
│
├── package.json ✅                 # Updated scripts
├── tsconfig.json ✅                # TypeScript config
├── test.js ✅                      # Validation script
├── .env.example ✅
├── .gitignore ✅
│
└── docs/
    ├── README.md ✅
    ├── QUICK-START.md ✅
    ├── PROJECT-OVERVIEW.md ✅
    ├── TYPESCRIPT-MIGRATION.md ✅
    ├── ANTI-DETECTION.md ✅
    └── API-INFO.md ✅
```

---

## ✅ What Was Fixed

### Before (Broken):
- ❌ Missing price crawler files
- ❌ Missing lib/ directory
- ❌ Missing playwright/ directory
- ❌ Missing util/ directory
- ❌ Old index.js (JavaScript)
- ❌ Incomplete structure

### After (Fixed):
- ✅ All price crawler files copied
- ✅ All lib/ files present
- ✅ All playwright/ files present
- ✅ All util/ files present
- ✅ New index.ts (TypeScript)
- ✅ Complete structure

---

## 🚀 Quick Start

### 1. Install
```bash
npm install
```

### 2. Install Playwright
```bash
npx playwright install
```

### 3. Configure
```bash
cp .env.example .env
# Edit .env with your DATABASE_URL
```

### 4. Setup Database
```bash
npx prisma db push
npx prisma generate
```

### 5. Test Everything
```bash
npm test
```

Expected output:
```
✅ All tests passed!

🚀 Ready to run:
   npm start           - Run both crawlers
   npm run crawl:prices - Run price crawler
   npm run crawl:news   - Run news crawler
```

### 6. Run!
```bash
# Run both crawlers
npm start

# Or run separately
npm run start:prices   # Price only
npm run start:news     # News only
```

---

## 📊 Available Commands

### Main Commands:
```bash
npm start              # Run both crawlers
npm run start:prices   # Price crawler only
npm run start:news     # News crawler only
npm test               # Validate setup
```

### Price Crawler:
```bash
npm run crawl:prices      # Run once
npm run scheduler:prices  # Auto (every 15 min)
npm run archive:once      # Archive old data
```

### News Crawler:
```bash
npm run crawl:news           # Run once
npm run scheduler:news       # Auto (every 2 hours)
npm run admin:news           # Manage articles
npm run admin:news:list      # List inactive
npm run admin:news:stats     # Show stats
npm run admin:news:activate-all  # Activate all translated
```

---

## 💰 Price Crawler

### Sources (5):
- SJC - Leading gold store
- PNJ - Phu Nhuan Jewelry
- DOJI - DOJI Gold & Gems
- BTMC - Bao Tin Minh Chau
- Mi Hồng - Mi Hong Gold

### Technology:
- TypeScript
- Playwright (headless browser)
- 6 gold types per store
- Every 15 minutes

### Output:
```
💰 Running Price Crawler...
Crawling SJC...
Crawling PNJ...
Crawling DOJI...
Crawling BTMC...
Crawling Mi Hồng...
✅ Saved 30 prices to database
```

---

## 📰 News Crawler

### Sources (3):
- **Kitco** (GraphQL API) - 3 articles
- **DailyForex** (Full content) - 5 articles
- **MarketWatch** (Headlines) - 3 articles

### Technology:
- TypeScript
- Axios + Cheerio
- Anti-detection headers
- Retry logic
- Every 2 hours

### Output:
```
📰 Running News Crawler...
📰 [Kitco] Found 3 articles
📰 [DailyForex] Found 5 articles
📰 [MarketWatch] Found 3 articles
✅ Saved 11 news articles
```

---

## 🗄️ Database Schema

### Price Tables (4):
```sql
gold_stores          -- Store info
gold_types           -- Gold types
gold_daily_prices    -- Real-time prices
gold_price_history   -- OHLC data
```

### News Tables (1):
```sql
news                 -- Bilingual news (EN/VI)
```

---

## 🎯 Workflow

### Price Workflow:
```
1. Crawl prices (every 15 min)
   ↓
2. Save to gold_daily_prices
   ↓
3. Archive after 30 days
   ↓
4. Convert to OHLC → gold_price_history
```

### News Workflow:
```
1. Crawl news (every 2 hours)
   ↓
2. Save with active=false
   ↓
3. Translate manually (Prisma Studio)
   ↓
4. Activate → active=true
   ↓
5. Display on website
```

---

## 💻 Technology Stack

| Component | Technology |
|-----------|-----------|
| **Language** | TypeScript 100% |
| **Price Crawler** | Playwright |
| **News Crawler** | Axios + Cheerio |
| **Database** | PostgreSQL + Prisma |
| **Scheduling** | Node-cron |
| **Runtime** | Node.js 18+ |

---

## 📈 Data Output

### Price Data:
- Per crawl: 30 records (5 stores × 6 types)
- Per day: ~720 records
- After archive: 30 OHLC/day (96% saved!)

### News Data:
- Per crawl: 11 articles
- Kitco: 3 snippets (~500 chars)
- DailyForex: 5 full articles (~2000+ chars)
- MarketWatch: 3 headlines (~200 chars)

---

## 🧪 Testing

### Validate Setup:
```bash
npm test
```

### Test Individual Crawlers:
```bash
# Price crawler
ts-node src/run-once.ts

# News crawlers
ts-node src/crawlers/news/kitco.ts
ts-node src/crawlers/news/dailyforex.ts
ts-node src/crawlers/news/marketwatch.ts

# Full news crawler
ts-node src/crawlers/news/index.ts
```

---

## ✨ What You Get

**Complete, production-ready system:**
- ✅ Price crawler (5 Vietnamese stores)
- ✅ News crawler (3 international sources)
- ✅ Combined database
- ✅ TypeScript 100%
- ✅ Auto-scheduling
- ✅ Data archiving
- ✅ Translation workflow
- ✅ Admin tools
- ✅ Complete documentation

**All in ONE package!** 🏆

---

## 🎉 Summary

Your complete gold tracking system is now ready with:

1. ✅ **All price crawler files** (5 stores)
2. ✅ **All news crawler files** (3 sources)
3. ✅ **All support libraries** (lib, util, playwright)
4. ✅ **Master index in TypeScript**
5. ✅ **Complete database schema**
6. ✅ **All npm scripts updated**
7. ✅ **Comprehensive documentation**
8. ✅ **Validation script**

**Everything is TypeScript. Everything works together. Everything is ready!** 🚀
