# Gold Tracker - Complete System 🏆

**All-in-one gold tracking solution:** Price crawler + News crawler

---

## 🎯 What It Does

### 1. **Gold Price Crawler** 💰
- Crawls 5 Vietnamese gold stores every 15 minutes
- Stores: SJC, PNJ, DOJI, BTMC, Mi Hồng
- Tracks buy/sell prices for 6 gold types
- Auto-archives old data to OHLC format

### 2. **Gold News Crawler** 📰
- Crawls 3 international news sources
- Sources: Kitco (GraphQL API), DailyForex (full articles), MarketWatch (headlines)
- 11 articles per crawl
- Manual translation workflow
- Publish control (active/inactive)

---

## 📁 Project Structure

```
gold-tracker-combined/
├── src/
│   ├── index.ts                # Master entry point (TypeScript)
│   ├── run-once.ts             # Run price crawler once
│   ├── scheduler.ts            # Price crawler scheduler
│   ├── run-archive-once.ts     # Archive old prices
│   ├── crawler-manager.ts      # Crawler orchestration
│   ├── crawlers/
│   │   ├── price/              # Price crawlers (TypeScript)
│   │   │   ├── index.ts
│   │   │   ├── SJCCrawler.ts
│   │   │   ├── PNJCrawler.ts
│   │   │   ├── DOJICrawler.ts
│   │   │   ├── BTMCCrawler.ts
│   │   │   └── MiHongCrawler.ts
│   │   └── news/               # News crawlers (TypeScript)
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
│   ├── lib/                    # Shared libraries
│   │   ├── prisma.ts
│   │   ├── database.ts
│   │   └── gold-type-mapping.ts
│   ├── playwright/             # Browser automation
│   │   ├── browser.ts
│   │   └── fetchJson.ts
│   └── util/                   # Utilities
│       └── utilFunctions.ts
├── prisma/
│   └── schema.prisma           # Combined database schema
├── package.json
├── tsconfig.json
└── .env
```

---

## 🚀 Quick Start

### 1. Install

```bash
npm install
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL
```

### 3. Setup Database

```bash
npx prisma db push
npx prisma generate
```

### 4. Install Playwright (for price crawler)
```bash
npx playwright install
```

### 5. Run Crawlers

```bash
# Run both crawlers
npm start

# Run price crawler only
npm run start:prices

# Run news crawler only
npm run start:news
```

---

## 📊 Database Schema

### Price Tables:
- `gold_stores` - Store information (SJC, PNJ, etc.)
- `gold_types` - Gold types (SJC 1L, SJC 5C, etc.)
- `gold_daily_prices` - Detailed prices (every 15 min)
- `gold_price_history` - Historical OHLC data

### News Tables:
- `news` - News articles with English/Vietnamese fields

---

## ⚙️ Available Scripts

### Price Crawler:
```bash
npm run crawl:prices          # Run once
npm run scheduler:prices      # Auto-run every 15min
npm run archive:once          # Archive old prices (manual)
```

### News Crawler:
```bash
npm run crawl:news            # Run once
npm run scheduler:news        # Auto-run every 2 hours
npm run admin:news            # Manage news
npm run admin:news:list       # List inactive news
npm run admin:news:stats      # Show statistics
```

### Combined:
```bash
npm start                     # Run both crawlers
npm test                      # Test setup
npm run build                 # Build TypeScript
```

---

## 📰 News Workflow

### 1. Crawl News
```bash
npm run crawl:news
# → Saves 11 articles (active=false)
```

### 2. Translate
```bash
npx prisma studio
# Fill in: headlineVi, contentVi, slugVi
```

### 3. Activate
```bash
node src/crawlers/news/admin.js activate <id>
# Or activate all translated:
node src/crawlers/news/admin.js activate-all
```

---

## 💰 Price Workflow

### 1. Crawl Prices
```bash
npm run crawl:prices
# → Updates prices from 5 stores
```

### 2. Schedule Auto-Crawl
```bash
npm run scheduler:prices
# → Runs every 15 minutes
```

### 3. Archive Old Data
```bash
npm run archive:once
# → Archives prices older than 30 days
```

---

## 🎯 Features

### Price Crawler:
- ✅ 5 Vietnamese stores
- ✅ 6 gold types per store
- ✅ Every 15 minutes
- ✅ Auto-archive to OHLC
- ✅ TypeScript + Playwright

### News Crawler:
- ✅ 3 international sources
- ✅ 11 articles per run
- ✅ Full content (DailyForex)
- ✅ Anti-detection headers
- ✅ Retry logic
- ✅ Manual translation
- ✅ Publish control

---

## 📈 Data Flow

```
Price Crawler:
Store websites → Playwright scraper → gold_daily_prices → (30 days) → gold_price_history

News Crawler:
News sites → HTTP fetch → news (active=false) → Manual translation → news (active=true)
```

---

## 🔧 Configuration

### Price Crawler:
- Frequency: Every 15 minutes
- Archive threshold: 30 days
- Stores: 5 (SJC, PNJ, DOJI, BTMC, Mi Hồng)
- Gold types: 6 per store

### News Crawler:
- Frequency: Every 2 hours
- Sources: 3 (Kitco, DailyForex, MarketWatch)
- Articles: 11 total (3+5+3)
- Default status: inactive (requires translation)

---

## 🧪 Testing

```bash
# Test setup
npm test

# Test price crawler
npx ts-node src/run-once.ts

# Test news crawler
node src/crawlers/news/index.js

# Test individual news sources
node src/crawlers/news/kitco.js
node src/crawlers/news/dailyforex.js
node src/crawlers/news/marketwatch.js
```

---

## 📦 Dependencies

### Core:
- `@prisma/client` - Database ORM
- `axios` - HTTP client
- `cheerio` - HTML parser (news)
- `playwright` - Browser automation (prices)
- `node-cron` - Scheduling
- `dotenv` - Environment config

### Dev:
- `typescript` - Type safety
- `ts-node` - TypeScript execution
- `prisma` - Database toolkit

---

## 🚀 Deployment

### Option 1: Local Server
```bash
# Start both schedulers
npm run scheduler:prices &
npm run scheduler:news &

# Archive monthly
0 2 1 * * npm run archive:once
```

### Option 2: Cloud (Vercel/Railway)
- Deploy as separate services
- Use cron jobs for scheduling
- Shared database

### Option 3: Docker
```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
CMD ["npm", "start"]
```

---

## ✅ Production Checklist

- [ ] Database setup
- [ ] Environment variables configured
- [ ] Prisma client generated
- [ ] Price crawler tested
- [ ] News crawler tested
- [ ] Archive task tested
- [ ] Schedulers running
- [ ] Monitoring setup
- [ ] Backup strategy

---

## 💡 Tips

### Price Crawler:
- Run archive task monthly
- Monitor database size
- Check store website changes

### News Crawler:
- Translate daily
- Check for duplicate articles
- Monitor source availability

---

## 🆘 Troubleshooting

### Price Crawler Issues:
```bash
# Playwright browser not found
npx playwright install

# TypeScript errors
npm run build
```

### News Crawler Issues:
```bash
# Timeout errors
# → Anti-detection headers applied
# → Retry logic in place

# No articles found
# → Check selector in crawler
# → Test individual source
```

---

## 📚 Documentation

- `README.md` - This file
- `QUICK-START.md` - 2-minute setup
- `ANTI-DETECTION.md` - News crawler strategies
- `API-INFO.md` - News sources details
- `ARCHIVE-GUIDE.md` - Price archiving guide

---

## ✨ What You Get

**Complete gold tracking system:**
- 💰 Real-time prices (5 stores, 6 types)
- 📰 International news (11 articles)
- 📊 Historical data (OHLC)
- 🌐 Bilingual (EN/VI)
- ⚡ Auto-scheduled
- 💾 Auto-archived

**Perfect for:**
- Gold price tracking website
- Financial news portal
- Investment platform
- Market analysis tool

---

## 🎉 Summary

**This is a complete, production-ready gold tracking system combining:**
1. Price crawler (Vietnamese stores)
2. News crawler (International sources)
3. Auto-scheduling
4. Data archiving
5. Translation workflow

**Everything you need in one package!** 🏆
