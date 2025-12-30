# Troubleshooting Guide

## Issue: `npm start` returns immediately without output

### Cause:
The main function isn't executing.

### Solution:
The issue is fixed in the latest version. The `src/index.js` now executes `main()` directly.

---

## Issue: `Cannot find package 'dotenv'`

### Cause:
Dependencies not installed.

### Solution:
```bash
npm install
```

---

## Issue: `Cannot find module '@prisma/client'`

### Cause:
Prisma client not generated.

### Solution:
```bash
npm install
npx prisma generate
```

---

## Issue: `Invalid prisma.news...`

### Cause:
Database tables not created.

### Solution:
```bash
# Create .env file with DATABASE_URL
cp .env.example .env
nano .env  # Add your DATABASE_URL

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

---

## Issue: Crawler runs but no output

### Debugging Steps:

1. **Test database connection:**
```bash
npx prisma studio
# Should open browser. If not, DATABASE_URL is wrong.
```

2. **Test individual crawler:**
```bash
node src/crawlers/kitco.js
```

Expected output:
```
📰 [Kitco] Starting crawler...
✅ [Kitco] Found 3 articles

📊 Kitco Articles:

1. Gold Prices Surge...
   Slug: gold-prices-surge
   Link: https://...
```

3. **Check for errors:**
```bash
node src/index.js 2>&1 | tee log.txt
# Check log.txt for errors
```

---

## Issue: Articles saved but all `active = false`

### This is correct!
Articles are saved as inactive (draft) by default. You need to:
1. Translate them manually
2. Activate them

```bash
# List articles
npm run admin:list

# Activate after translation
node src/admin.js activate 1
```

---

## Issue: `Module not found` errors

### Cause:
Using CommonJS syntax in ES modules.

### Check:
- File has `"type": "module"` in package.json ✅
- Using `import` not `require` ✅
- Using `export` not `module.exports` ✅

---

## Quick Test

Run the test script:
```bash
node test.js
```

This will verify:
- ✅ Node version
- ✅ Dependencies installed
- ✅ File structure correct
- ✅ Ready to run

---

## Complete Setup Checklist

```bash
# 1. Install dependencies
npm install

# 2. Create .env
cp .env.example .env
# Edit DATABASE_URL

# 3. Setup database
npx prisma db push
npx prisma generate

# 4. Test
node test.js

# 5. Run
npm start
```

Expected output when working:
```
🚀 Starting Gold News Crawler
📅 26/12/2024 10:00:00

📰 [Kitco] Starting crawler...
✅ [Kitco] Found 3 articles

📰 [DailyForex] Starting crawler...
✅ [DailyForex] Found 3 articles

📰 [MarketWatch] Starting crawler...
✅ [MarketWatch] Found 3 articles

📊 Total articles found: 9

💾 Saving articles to database...
✅ Saved: "Gold Prices Surge..." [active=false]
...

✅ Crawler completed in 12.34s
```

---

## Still Having Issues?

Check these:
1. Node version >= 18.0.0: `node --version`
2. Database accessible: `npx prisma studio`
3. .env file exists: `cat .env`
4. All dependencies: `npm list`

If still stuck, run:
```bash
node test.js > debug.txt 2>&1
# Share debug.txt
```
