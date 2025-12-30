# Quick Start - Gold Tracker System ⚡

## 🚀 Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
```bash
cp .env.example .env
nano .env
```

Add your DATABASE_URL:
```
DATABASE_URL="postgresql://user:password@host:5432/gold_tracker"
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

---

## ✅ You're Ready!

### Run Everything:
```bash
npm start
```

### Run Separately:

**Price Crawler Only:**
```bash
npm run crawl:prices
```

**News Crawler Only:**
```bash
npm run crawl:news
```

---

## 📊 What Happens

### Price Crawler:
```
💰 Crawling SJC...
💰 Crawling PNJ...
💰 Crawling DOJI...
💰 Crawling BTMC...
💰 Crawling Mi Hồng...
✅ Saved 30 prices to database
```

### News Crawler:
```
📰 [Kitco] Found 3 articles
📰 [DailyForex] Found 5 articles
📰 [MarketWatch] Found 3 articles
✅ Saved 11 news articles
```

---

## 🔄 Auto-Schedule

### Price Crawler (Every 15 min):
```bash
npm run scheduler:prices
```

### News Crawler (Every 2 hours):
```bash
npm run scheduler:news
```

---

## 📝 News Management

### List Articles Needing Translation:
```bash
npm run admin:news:list
```

### Translate Articles:
```bash
npx prisma studio
```
Fill in: `headlineVi`, `contentVi`, `slugVi`

### Activate When Ready:
```bash
node src/crawlers/news/admin.js activate <id>
```

---

## 💾 Archive Old Prices

### Run Once:
```bash
npm run archive:once
```

### Schedule Monthly:
```bash
# Cron: Every 1st of month at 2 AM
0 2 1 * * cd /path/to/project && npm run archive:once
```

---

## 🧪 Test Everything

```bash
npm test
```

Expected output:
```
✅ Node.js: v20.x.x
✅ Database: Connected
✅ Prisma: Generated
✅ Playwright: Installed
✅ All files present
✅ Ready to run!
```

---

## 📈 Usage Patterns

### Development:
```bash
# Test price crawler
npm run crawl:prices

# Test news crawler
npm run crawl:news

# Translate news
npx prisma studio
```

### Production:
```bash
# Start both schedulers
npm run scheduler:prices &
npm run scheduler:news &

# Monitor logs
tail -f logs/prices.log
tail -f logs/news.log
```

---

## 🎯 Common Tasks

### Check Database:
```bash
npx prisma studio
```

### View Latest Prices:
```sql
SELECT * FROM gold_daily_prices 
ORDER BY timestamp DESC LIMIT 10;
```

### View Active News:
```sql
SELECT * FROM news 
WHERE active = true 
ORDER BY "createdAt" DESC;
```

### Archive Prices:
```bash
npm run archive:once
```

---

## 🆘 Quick Fixes

### "Playwright not found":
```bash
npx playwright install
```

### "Database not found":
```bash
npx prisma db push
```

### "Prisma client not generated":
```bash
npx prisma generate
```

### "TypeScript errors":
```bash
npm run build
```

---

## ✨ You're All Set!

Your complete gold tracking system is ready:
- ✅ Price crawler (5 stores)
- ✅ News crawler (3 sources)
- ✅ Auto-scheduling
- ✅ Translation workflow
- ✅ Data archiving

**Start crawling:** `npm start` 🚀
