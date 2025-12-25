# Gold Tracker Crawler

A standalone crawler service that fetches gold prices from various stores and saves them to the database.

## 🎯 Purpose

This crawler runs independently from the main application and is responsible for:

1. **Fetching prices** from gold stores every 15 minutes (8 AM - 6 PM)
2. **Mapping gold types** to standardized codes
3. **Saving prices** to `GoldDailyPrice` table
4. **Archiving prices** to `GoldPrice` table at end of day (11:59 PM)
5. **Logging execution** to `CrawlerLog` table

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (stores and gold types)
npm run prisma:seed

# Start crawler scheduler
npm start
```

## 📋 Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:5432/gold_tracker?schema=public"
NODE_ENV="production"
RUN_ON_STARTUP="false"  # Set to "true" to run crawler immediately
```

## 📊 Crawler Schedule

### Price Collection (Every 15 minutes)
- **Cron**: `*/15 8-18 * * *`
- **Time**: 8:00 AM - 6:00 PM
- **Action**: Crawl all stores → Save to `GoldDailyPrice`

### Daily Archive (End of day)
- **Cron**: `59 23 * * *`
- **Time**: 11:59 PM
- **Action**: 
  1. Calculate OHLC (Open, High, Low, Close)
  2. Save to `GoldPrice` table
  3. Clear `GoldDailyPrice` table

## 🏪 Supported Stores

1. **SJC** - Công ty Vàng bạc Đá quý Sài Gòn
2. **PNJ** - Công ty Vàng bạc Đá quý Phú Nhuận
3. **BTMC** - Công ty Bảo Tín Minh Châu
4. **DOJI** - Công ty Vàng bạc Đá quý DOJI

## 🗺️ Gold Type Mapping

The crawler automatically maps store-specific gold type names to standardized codes:

```typescript
// Example mappings
BTMC: "Vàng rồng Thăng Long 9999" → GOLD_9999
SJC:  "Vàng 9999"                 → GOLD_9999
PNJ:  "Vàng miếng PNJ 999.9"     → GOLD_PNJ_BAR
DOJI: "Vàng miếng DOJI 999.9"    → GOLD_DOJI_BAR
```

All mappings are defined in `src/lib/gold-type-mapping.ts`

## 🔧 Commands

```bash
# Start crawler with scheduler
npm start

# Development mode (auto-restart)
npm run dev

# Run crawler once (testing)
npm run once

# Database commands
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed initial data
npm run prisma:studio    # Open Prisma Studio
```

## 📁 Project Structure

```
gold-tracker-crawler/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts             # Seed data
├── src/
│   ├── lib/
│   │   ├── gold-type-mapping.ts  # Type mapping enum
│   │   └── database.ts           # Database service
│   ├── crawlers.ts         # Crawler implementations
│   ├── scheduler.ts        # Main scheduler
│   └── run-once.ts        # Test script
├── package.json
├── .env.example
└── README.md
```

## 🔍 How It Works

### 1. Crawler Execution

```
Scheduler triggers (every 15 mins)
    ↓
CrawlerManager.runAll()
    ↓
For each store:
    ↓
  - Fetch HTML/XML/JSON
  - Parse prices
  - Map gold type names → standard codes
  - Save to database
    ↓
Log execution to CrawlerLog
```

### 2. Price Mapping Flow

```
Store Website
    ↓ (HTTP request)
Raw price data: "Vàng rồng Thăng Long 9999" - Buy: 78,500,000 - Sell: 79,000,000
    ↓ (Parse)
CrawledPrice object
    ↓ (Map gold type)
Standard code: GOLD_9999
    ↓ (Database lookup)
GoldType { id: 1, code: "GOLD_9999", name: "Vàng 9999" }
    ↓ (Save)
GoldDailyPrice record created
```

### 3. Archive Process

```
11:59 PM - Archive trigger
    ↓
Query all GoldDailyPrice for today
    ↓ (Group by store + gold type)
Calculate OHLC statistics
    ↓
For each group:
  - Open: First price of the day
  - High: Highest price of the day
  - Low: Lowest price of the day
  - Close: Last price of the day
  - Average: Mean of all prices
  - Change: Difference from previous day
    ↓
Save to GoldPrice table
    ↓
Delete from GoldDailyPrice
```

## 🐛 Troubleshooting

### Crawler not starting
```bash
# Check logs
npm start

# Manually trigger
npm run once
```

### Database connection error
```bash
# Verify DATABASE_URL in .env
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
npm run prisma:studio
```

### No prices being saved
```bash
# Check crawler logs
# Verify stores and gold types exist
npm run prisma:studio

# Re-seed if needed
npm run prisma:seed
```

## 📊 Monitoring

### Check Execution Logs
```sql
SELECT * FROM crawler_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Latest Prices
```sql
SELECT 
  gs.name as store,
  gt.name as gold_type,
  gdp.buy_price,
  gdp.sell_price,
  gdp.timestamp
FROM gold_daily_prices gdp
JOIN gold_stores gs ON gdp.store_id = gs.id
JOIN gold_types gt ON gdp.gold_type_id = gt.id
ORDER BY gdp.timestamp DESC
LIMIT 20;
```

## 🚀 Deployment

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start crawler
pm2 start npm --name "gold-crawler" -- start

# Save configuration
pm2 save

# Auto-start on boot
pm2 startup
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
CMD ["npm", "start"]
```

```bash
docker build -t gold-crawler .
docker run -d --name gold-crawler \
  -e DATABASE_URL="postgresql://..." \
  gold-crawler
```

## 🔐 Security

- Never commit `.env` file
- Use strong database passwords
- Restrict database access to crawler IP
- Monitor for suspicious activity in logs

## 📝 Adding New Store

1. **Create crawler class** in `src/crawlers.ts`:
```typescript
class NewStoreCrawler extends BaseCrawler {
  constructor() {
    super('NEWSTORE', 'New Store Name');
  }

  async crawl(): Promise<CrawledPrice[]> {
    // Implement crawling logic
    return prices;
  }
}
```

2. **Add to CrawlerManager**:
```typescript
this.crawlers = [
  new SJCCrawler(),
  new PNJCrawler(),
  new BTMCCrawler(),
  new DOJICrawler(),
  new NewStoreCrawler(), // Add here
];
```

3. **Add type mapping** in `src/lib/gold-type-mapping.ts`:
```typescript
NEWSTORE: [
  ['Store Gold Type Name', GoldTypeCode.GOLD_9999],
  // More mappings...
],
```

4. **Seed store info**:
```bash
# Add to prisma/seed.ts then run:
npm run prisma:seed
```

## 📄 License

MIT

---

**Note**: This crawler runs independently and only writes to the database. The main application reads from the database to display prices.
