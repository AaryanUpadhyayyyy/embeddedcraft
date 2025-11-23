# Database Migration Strategy - EmbeddedCraft

**Created:** November 20, 2025  
**Priority:** P0 - Critical  
**Estimated Time:** 2-3 days  
**Target:** PostgreSQL with Prisma ORM  

---

## Current State (JSON File Storage)

### Problems
1. **Race Conditions**: Concurrent writes cause data corruption
2. **No Transactions**: Can't guarantee data integrity
3. **No Indexing**: Slow queries as data grows
4. **Data Loss Risk**: Crash during write = lost data
5. **No Backups**: Single point of failure
6. **No Scalability**: File size limit ~100MB

### Current Data Structure
```javascript
// data.json
{
  "campaigns": [
    {
      "id": "uuid",
      "name": "string",
      "type": "string",
      "status": "active|paused|draft",
      "trigger": "string",
      "rules": [...],
      "config": {...},
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "users": {
    "user_id": {
      "trait_key": "trait_value"
    }
  },
  "events": [
    {
      "id": "uuid",
      "user_id": "string",
      "event": "string",
      "properties": {...},
      "ts": timestamp
    }
  ],
  "segments": [...]
}
```

---

## Migration Plan

### Phase 1: Setup PostgreSQL (Day 1)

#### 1.1 Install Dependencies
```bash
npm install @prisma/client
npm install -D prisma
npm install pg
```

#### 1.2 Initialize Prisma
```bash
npx prisma init
```

#### 1.3 Configure Database Connection
```env
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/embeddedcraft?schema=public"
```

#### 1.4 Create Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Campaign {
  id        String   @id @default(uuid())
  name      String
  type      String
  status    String   @default("draft")
  trigger   String?
  rules     Json?
  config    Json
  targeting Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([status])
  @@index([trigger])
  @@index([createdAt])
}

model User {
  id         String   @id
  traits     Json     @default("{}")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  events     Event[]
  
  @@index([createdAt])
}

model Event {
  id         String   @id @default(uuid())
  userId     String
  event      String
  properties Json     @default("{}")
  timestamp  DateTime @default(now())
  
  user       User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([event])
  @@index([timestamp])
}

model Segment {
  id          String   @id @default(uuid())
  name        String
  description String?
  rules       Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### 1.5 Generate Prisma Client
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Phase 2: Implement Database Layer (Day 1-2)

#### 2.1 Create Database Service
```javascript
// server/db.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Campaigns
export async function createCampaign(data) {
  return await prisma.campaign.create({
    data: {
      name: data.name,
      type: data.type,
      status: data.status || 'draft',
      trigger: data.trigger,
      rules: data.rules || [],
      config: data.config,
      targeting: data.targeting,
    },
  });
}

export async function updateCampaign(id, data) {
  return await prisma.campaign.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export async function deleteCampaign(id) {
  return await prisma.campaign.delete({
    where: { id },
  });
}

export async function getCampaign(id) {
  return await prisma.campaign.findUnique({
    where: { id },
  });
}

export async function listCampaigns({ limit = 20, offset = 0, status } = {}) {
  const where = status ? { status } : {};
  
  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.campaign.count({ where }),
  ]);
  
  return { campaigns, total };
}

export async function getActiveCampaigns() {
  return await prisma.campaign.findMany({
    where: { status: 'active' },
  });
}

// Users
export async function upsertUser(userId, traits) {
  return await prisma.user.upsert({
    where: { id: userId },
    update: {
      traits,
      updatedAt: new Date(),
    },
    create: {
      id: userId,
      traits,
    },
  });
}

export async function getUser(userId) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

// Events
export async function createEvent(data) {
  return await prisma.event.create({
    data: {
      userId: data.user_id,
      event: data.event,
      properties: data.properties || {},
    },
  });
}

export async function getUserEvents(userId, limit = 100) {
  return await prisma.event.findMany({
    where: { userId },
    take: limit,
    orderBy: { timestamp: 'desc' },
  });
}

export async function getEventsByName(eventName, limit = 100) {
  return await prisma.event.findMany({
    where: { event: eventName },
    take: limit,
    orderBy: { timestamp: 'desc' },
  });
}

// Cleanup old events (run as cron job)
export async function cleanupOldEvents(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const deleted = await prisma.event.deleteMany({
    where: {
      timestamp: {
        lt: cutoffDate,
      },
    },
  });
  
  console.log(`🗑️  Cleaned up ${deleted.count} old events`);
  return deleted.count;
}

// Graceful shutdown
export async function disconnect() {
  await prisma.$disconnect();
}

export default prisma;
```

#### 2.2 Update Server Routes
```javascript
// server/index.js
import * as db from './db.js';

// Admin: create campaign
app.post('/v1/admin/campaigns', 
  requireAdminAuth,
  adminLimiter,
  [
    body('name').trim().notEmpty(),
    body('status').optional().isIn(['active', 'paused', 'draft']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validation failed', details: errors.array() });
      }
      
      const campaign = await db.createCampaign(req.body);
      console.log(`✅ Campaign created: "${campaign.name}" (${campaign.id})`);
      return res.status(201).json(campaign);
    } catch (error) {
      next(error);
    }
  }
);

// Update campaign
app.put('/v1/admin/campaigns/:id', 
  requireAdminAuth, 
  adminLimiter,
  async (req, res, next) => {
    try {
      const campaign = await db.updateCampaign(req.params.id, req.body);
      console.log(`✅ Campaign updated: "${campaign.name}" (${campaign.id})`);
      return res.json(campaign);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      next(error);
    }
  }
);

// Delete campaign
app.delete('/v1/admin/campaigns/:id', 
  requireAdminAuth, 
  adminLimiter,
  async (req, res, next) => {
    try {
      await db.deleteCampaign(req.params.id);
      console.log(`🗑️  Campaign deleted: ${req.params.id}`);
      return res.json({ ok: true });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      next(error);
    }
  }
);

// List campaigns
app.get('/v1/admin/campaigns', 
  requireAdminAuth,
  async (req, res, next) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const offset = Math.max(parseInt(req.query.offset) || 0, 0);
      const status = req.query.status;
      
      const result = await db.listCampaigns({ limit, offset, status });
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Track event
app.post('/v1/track', 
  requireAuth,
  async (req, res, next) => {
    try {
      const { user_id, event, properties } = req.body;
      
      const evt = await db.createEvent({ user_id, event, properties });
      
      // Get active campaigns triggered by this event
      const campaigns = await db.getActiveCampaigns();
      const user = await db.getUser(user_id);
      
      const matched = campaigns.filter(c => {
        if (c.trigger !== event) return false;
        if (!c.rules || c.rules.length === 0) return true;
        return c.rules.every(r => ruleMatches(r, user?.traits || {}, properties));
      });
      
      console.log(`📊 Event tracked: ${event} for user ${user_id} - ${matched.length} campaigns matched`);
      res.json({ ok: true, matched, event: evt });
    } catch (error) {
      next(error);
    }
  }
);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connection...');
  await db.disconnect();
  process.exit(0);
});
```

### Phase 3: Data Migration (Day 2)

#### 3.1 Create Migration Script
```javascript
// server/migrate-data.js
import fs from 'fs';
import * as db from './db.js';

async function migrateData() {
  console.log('🔄 Starting data migration...');
  
  try {
    // Read existing JSON data
    const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));
    
    // Migrate campaigns
    console.log(`📦 Migrating ${data.campaigns.length} campaigns...`);
    for (const campaign of data.campaigns) {
      await db.createCampaign({
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        trigger: campaign.trigger,
        rules: campaign.rules,
        config: campaign.config,
        targeting: campaign.targeting,
      });
    }
    console.log('✅ Campaigns migrated');
    
    // Migrate users
    const userIds = Object.keys(data.users);
    console.log(`👤 Migrating ${userIds.length} users...`);
    for (const userId of userIds) {
      await db.upsertUser(userId, data.users[userId]);
    }
    console.log('✅ Users migrated');
    
    // Migrate events
    console.log(`📊 Migrating ${data.events.length} events...`);
    for (const event of data.events) {
      await db.createEvent({
        user_id: event.user_id,
        event: event.event,
        properties: event.properties,
      });
    }
    console.log('✅ Events migrated');
    
    // Backup old data
    const backupName = `data-backup-${Date.now()}.json`;
    fs.copyFileSync('./data.json', backupName);
    console.log(`💾 Backup created: ${backupName}`);
    
    console.log('🎉 Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.disconnect();
  }
}

migrateData();
```

#### 3.2 Run Migration
```bash
node server/migrate-data.js
```

### Phase 4: Testing & Validation (Day 3)

#### 4.1 Test Checklist
- [ ] Create campaign via API
- [ ] Update campaign via API
- [ ] Delete campaign via API
- [ ] List campaigns with pagination
- [ ] Filter campaigns by status
- [ ] Track events
- [ ] Identify users
- [ ] Fetch campaigns for user
- [ ] Campaign targeting works correctly
- [ ] All existing campaigns still work
- [ ] Dashboard can CRUD campaigns
- [ ] Flutter SDK can fetch campaigns

#### 4.2 Performance Testing
```javascript
// Load test script
import autocannon from 'autocannon';

autocannon({
  url: 'http://localhost:4000/v1/campaigns?user_id=test',
  connections: 10,
  duration: 10,
  headers: {
    'x-api-key': 'your_api_key'
  }
}, console.log);
```

#### 4.3 Rollback Plan
If migration fails:
```bash
# 1. Stop server
pm2 stop server

# 2. Restore backup
cp data-backup-*.json data.json

# 3. Revert code changes
git revert HEAD

# 4. Restart server
pm2 start server
```

---

## Benefits After Migration

### Performance
- **10-100x faster queries** with indexing
- **Concurrent writes** without data corruption
- **Efficient pagination** with LIMIT/OFFSET
- **Complex queries** with JOINs

### Reliability
- **ACID transactions** guarantee data integrity
- **Automatic backups** via pg_dump
- **Point-in-time recovery** possible
- **No data loss** on crashes

### Scalability
- **No file size limits**
- **Horizontal scaling** with read replicas
- **Connection pooling** for high load
- **Query optimization** possible

### Features Enabled
- **Full-text search** on campaigns
- **Analytics queries** on events
- **User segmentation** with complex rules
- **Campaign scheduling** with DB triggers
- **Audit trails** with history tables

---

## Production Deployment

### Environment Setup
```env
# Production
DATABASE_URL="postgresql://prod_user:secure_pass@prod-db.amazonaws.com:5432/embeddedcraft"

# Staging
DATABASE_URL="postgresql://stage_user:pass@stage-db.amazonaws.com:5432/embeddedcraft"

# Development
DATABASE_URL="postgresql://localhost:5432/embeddedcraft_dev"
```

### Deployment Steps
1. Create production database
2. Run migrations: `npx prisma migrate deploy`
3. Test connections
4. Deploy code
5. Monitor for errors
6. Run migration script during maintenance window
7. Verify data integrity
8. Enable production traffic

### Monitoring
```javascript
// Add Prisma logging
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    console.warn('Slow query detected:', e.query, e.duration + 'ms');
  }
});

prisma.$on('error', (e) => {
  console.error('Database error:', e);
});
```

---

## Cost Estimate

### AWS RDS PostgreSQL
- **db.t3.micro**: $15/month (dev/staging)
- **db.t3.small**: $30/month (small production)
- **db.t3.medium**: $60/month (medium production)

### Alternatives
- **Railway.app**: $5/month (hobby)
- **Render**: $7/month (starter)
- **DigitalOcean**: $15/month (basic)
- **Self-hosted**: $5/month (VPS)

---

## Timeline

| Day | Task | Hours |
|-----|------|-------|
| 1 | Setup Prisma & schema | 4h |
| 1-2 | Implement DB layer | 8h |
| 2 | Data migration | 4h |
| 3 | Testing & validation | 8h |
| **Total** | | **24h** |

---

## Next Steps

1. **Review this plan** with team
2. **Setup staging database** for testing
3. **Create Prisma schema** and generate client
4. **Implement DB layer** incrementally
5. **Test migration script** on staging
6. **Schedule production migration** (off-hours)
7. **Execute migration** with monitoring
8. **Validate and monitor**

---

**Status:** ✅ Planning Complete - Ready for Implementation  
**Estimated Completion:** 3 working days  
**Risk Level:** Medium (have rollback plan)  
**Impact:** High (eliminates P0 issue)
