import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, query, validationResult } from 'express-validator';

// Load environment variables
dotenv.config();

const app = express();

// Security: Helmet for security headers (optional, controlled by env)
if (process.env.HELMET_ENABLED === 'true') {
  app.use(helmet());
  console.log('🛡️  Helmet security headers enabled');
}

// CORS configuration with environment-based origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow all origins if configured with '*'
    if (allowedOrigins.includes('*')) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: '50mb' }));

const PORT = process.env.PORT || 4000;
const AUTH_REQUIRED = process.env.AUTH_REQUIRED === 'true';
const ADMIN_API_KEYS = new Set(process.env.ADMIN_API_KEYS?.split(',') || []);
const CLIENT_API_KEYS = new Set(process.env.CLIENT_API_KEYS?.split(',') || []);

// Log auth configuration on startup
console.log('🔐 Authentication:', AUTH_REQUIRED ? 'ENABLED' : 'DISABLED (Development Mode)');
if (AUTH_REQUIRED) {
  console.log('🔑 Admin keys configured:', ADMIN_API_KEYS.size);
  console.log('🔑 Client keys configured:', CLIENT_API_KEYS.size);
}

// Data persistence
// Use process.cwd() to ensure data.json is written to the server folder on Windows
const DATA_FILE = path.join(process.cwd(), 'data.json');

let store = {
  campaigns: [
    {
      id: '1',
      name: 'Checkout Boost',
      status: 'active',
      trigger: 'Checkout_Started',
      rules: [{ id: 1, type: 'attribute', field: 'cart_total', operator: '>=', value: '150' }],
      config: {
        type: 'floater',
        text: 'Get Free Delivery on orders above ₹150!',
        backgroundColor: '#8B5CF6',
        textColor: '#FFFFFF',
        buttonText: 'Claim Now',
        position: 'bottom',
      },
    }
  ],
  users: {},
  events: [],
};

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      store = JSON.parse(raw);
      console.log('Loaded store from', DATA_FILE);
    } else {
      saveStore();
    }
  } catch (e) {
    console.warn('Failed to load store, using default in-memory', e);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.warn('Failed to save store', e);
  }
}

loadStore();

// Migration: Fix existing campaigns that have type in config instead of root
store.campaigns = store.campaigns.map(c => {
  if (!c.type && c.config && c.config.type) {
    console.log(`Migrating campaign "${c.name}": extracting type from config`);
    return { ...c, type: c.config.type };
  }
  return c;
});
saveStore();

const campaigns = store.campaigns;
const users = store.users;
const events = store.events;

// ==================== AUTHENTICATION MIDDLEWARE ====================

/**
 * Extract API key from request headers
 * Supports both 'x-api-key' (SDK) and 'Authorization: Bearer' (Dashboard)
 */
function extractApiKey(req) {
  // Check x-api-key header (used by in_app_ninja SDK)
  if (req.headers['x-api-key']) {
    return req.headers['x-api-key'];
  }

  // Check Authorization header (used by web dashboard)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Validate if API key is an admin key
 */
function isAdminKey(apiKey) {
  return ADMIN_API_KEYS.has(apiKey);
}

/**
 * Validate if API key is a client key
 */
function isClientKey(apiKey) {
  return CLIENT_API_KEYS.has(apiKey);
}

/**
 * Validate if API key is valid (either admin or client)
 */
function isValidApiKey(apiKey) {
  return isAdminKey(apiKey) || isClientKey(apiKey);
}

/**
 * Middleware: Require any valid API key (admin or client)
 */
function requireAuth(req, res, next) {
  // Skip auth if disabled (development mode)
  if (!AUTH_REQUIRED) {
    return next();
  }

  const apiKey = extractApiKey(req);

  if (!apiKey) {
    console.warn(`⚠️  Unauthorized request to ${req.method} ${req.path} - No API key provided`);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key required. Provide x-api-key header or Authorization: Bearer token.'
    });
  }

  if (!isValidApiKey(apiKey)) {
    console.warn(`⚠️  Unauthorized request to ${req.method} ${req.path} - Invalid API key`);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key.'
    });
  }

  // Store API key info for logging
  req.apiKey = apiKey;
  req.isAdmin = isAdminKey(apiKey);
  req.isClient = isClientKey(apiKey);

  next();
}

/**
 * Middleware: Require admin API key
 */
function requireAdminAuth(req, res, next) {
  // Skip auth if disabled (development mode)
  if (!AUTH_REQUIRED) {
    return next();
  }

  const apiKey = extractApiKey(req);

  if (!apiKey) {
    console.warn(`⚠️  Admin access denied to ${req.method} ${req.path} - No API key`);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Admin API key required.'
    });
  }

  if (!isAdminKey(apiKey)) {
    console.warn(`⚠️  Admin access denied to ${req.method} ${req.path} - Not an admin key`);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin API key required for this operation.'
    });
  }

  req.apiKey = apiKey;
  req.isAdmin = true;

  next();
}

// ==================== RATE LIMITING ====================

// General rate limiter for all endpoints
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for admin endpoints
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // stricter limit for admin operations
  message: { error: 'Too many admin requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply general rate limiting to all routes
app.use('/v1/', generalLimiter);

// ==================== HELPER FUNCTIONS ====================

function evalValue(op, left, right) {
  // Try numeric compare first
  const ln = Number(left);
  const rn = Number(right);
  const numeric = !Number.isNaN(ln) && !Number.isNaN(rn);

  switch (op) {
    case '==':
      return left == right;
    case '!=':
      return left != right;
    case '>':
      return numeric ? ln > rn : String(left) > String(right);
    case '>=':
      return numeric ? ln >= rn : String(left) >= String(right);
    case '<':
      return numeric ? ln < rn : String(left) < String(right);
    case '<=':
      return numeric ? ln <= rn : String(left) <= String(right);
    case 'contains':
      return String(left).includes(String(right));
    default:
      return false;
  }
}

function ruleMatches(rule, userAttrs, eventProps) {
  const source = rule.type === 'attribute' ? userAttrs : eventProps || {};
  const left = source?.[rule.field];
  if (left === undefined) return false;
  return evalValue(rule.operator, left, rule.value);
}

// ==================== CAMPAIGN ENDPOINTS ====================

// Admin: create campaign (requires admin auth + validation)
app.post('/v1/admin/campaigns',
  requireAdminAuth,
  adminLimiter,
  [
    body('name').trim().notEmpty().withMessage('Campaign name is required'),
    body('status').optional().isIn(['active', 'paused', 'draft']).withMessage('Invalid status'),
  ],
  (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const c = req.body;
    const id = uuidv4();

    // Extract type from config if not at root level (for SDK compatibility)
    const type = c.type || (c.config && c.config.type) || 'modal';

    const newC = { ...c, id, type, createdAt: new Date().toISOString() };
    store.campaigns.unshift(newC);
    saveStore();

    console.log(`✅ Campaign created: "${newC.name}" (${id}) by ${req.isAdmin ? 'admin' : 'user'}`);
    return res.status(201).json(newC);
  }
);

// Fetch campaigns for user (SDK endpoint - requires client or admin auth)
app.get('/v1/campaigns',
  requireAuth,
  [
    query('user_id').optional().trim().isLength({ max: 255 }).withMessage('user_id too long'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const userId = req.query.user_id;
    const userAttrs = store.users[userId] || {};
    const matching = store.campaigns.filter(c => c.status === 'active').filter(c => {
      // all rules must match
      if (!c.rules || c.rules.length === 0) return true;
      return c.rules.every(r => ruleMatches(r, userAttrs, null));
    });

    console.log(`📱 Campaigns fetched for user: ${userId} - ${matching.length} active campaigns`);
    res.json({ campaigns: matching });
  }
);

// Identify: store user attributes (SDK endpoint - requires client or admin auth)
app.post('/v1/identify',
  requireAuth,
  [
    body('user_id').trim().notEmpty().withMessage('user_id is required')
      .isLength({ max: 255 }).withMessage('user_id too long'),
    body('traits').optional().isObject().withMessage('traits must be an object'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { user_id, traits } = req.body;
    store.users[user_id] = { ...(store.users[user_id] || {}), ...(traits || {}) };
    saveStore();

    console.log(`👤 User identified: ${user_id}`);
    return res.json({ ok: true, user: store.users[user_id] });
  }
);

// Track: store event, attempt to match campaigns (SDK endpoint - requires client or admin auth)
app.post('/v1/track',
  requireAuth,
  [
    body('user_id').trim().notEmpty().withMessage('user_id is required')
      .isLength({ max: 255 }).withMessage('user_id too long'),
    body('event').trim().notEmpty().withMessage('event is required')
      .isLength({ max: 100 }).withMessage('event name too long')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('event must contain only letters, numbers, and underscores'),
    body('properties').optional().isObject().withMessage('properties must be an object'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { user_id, event, properties } = req.body;

    const evt = { id: uuidv4(), user_id, event, properties: properties || {}, ts: Date.now() };
    store.events.push(evt);
    saveStore();

    // Find campaigns triggered by this event
    const userAttrs = store.users[user_id] || {};
    const matched = store.campaigns.filter(c => c.status === 'active' && c.trigger === event).filter(c => {
      if (!c.rules || c.rules.length === 0) return true;
      return c.rules.every(r => ruleMatches(r, userAttrs, properties || {}));
    });

    console.log(`📊 Event tracked: ${event} for user ${user_id} - ${matched.length} campaigns matched`);
    // For prototype we return matched campaigns so SDK can render immediately
    res.json({ ok: true, matched, event: evt });
  }
);

// Update campaign (requires admin auth)
app.put('/v1/admin/campaigns/:id',
  requireAdminAuth,
  adminLimiter,
  [
    body('name').optional().trim().notEmpty().withMessage('Campaign name cannot be empty'),
    body('status').optional().isIn(['active', 'paused', 'draft']).withMessage('Invalid status'),
    body('type').optional().isIn(['modal', 'banner', 'tooltip', 'bottom_sheet', 'bottom_sheet_v2', 'inline', 'pip', 'scratch_card', 'story']).withMessage('Invalid campaign type'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;
    console.log('PUT /v1/admin/campaigns/:id - Requested ID:', id);
    console.log('PUT /v1/admin/campaigns/:id - Payload size:', JSON.stringify(updates).length, 'bytes');
    const idx = store.campaigns.findIndex(c => c.id === id);
    if (idx === -1) {
      console.log('PUT /v1/admin/campaigns/:id - Campaign NOT FOUND');
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Extract type from config if not at root level (for SDK compatibility)
    const type = updates.type || (updates.config && updates.config.type) || store.campaigns[idx].type || 'modal';

    store.campaigns[idx] = { ...store.campaigns[idx], ...updates, id, type, updatedAt: new Date().toISOString() };
    saveStore();

    console.log(`✅ Campaign updated: "${store.campaigns[idx].name}" (${id})`);
    return res.json(store.campaigns[idx]);
  }
);

// Delete campaign (requires admin auth)
app.delete('/v1/admin/campaigns/:id', requireAdminAuth, adminLimiter, (req, res) => {
  const { id } = req.params;
  const idx = store.campaigns.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Campaign not found' });

  const deleted = store.campaigns.splice(idx, 1)[0];
  saveStore();

  console.log(`🗑️  Campaign deleted: "${deleted.name}" (${id})`);
  return res.json({ ok: true, deleted });
});

// Get single campaign (requires admin auth)
app.get('/v1/admin/campaigns/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  console.log('GET /v1/admin/campaigns/:id - Requested ID:', id);
  console.log('GET /v1/admin/campaigns/:id - Available campaign IDs:', store.campaigns.map(c => c.id));

  const campaign = store.campaigns.find(c => c.id === id);
  if (!campaign) {
    console.log('GET /v1/admin/campaigns/:id - Campaign NOT FOUND');
    return res.status(404).json({ error: 'Campaign not found' });
  }

  console.log('GET /v1/admin/campaigns/:id - Campaign FOUND:', campaign.name);
  return res.json(campaign);
});

// Get all campaigns (requires admin auth)
app.get('/v1/admin/campaigns', requireAdminAuth, (req, res) => {
  const limit = parseInt(req.query.limit) || store.campaigns.length;
  const offset = parseInt(req.query.offset) || 0;
  const filtered = store.campaigns.slice(offset, offset + limit);

  console.log(`📊 Admin campaigns list: ${filtered.length} of ${store.campaigns.length} total`);
  return res.json({ campaigns: filtered, total: store.campaigns.length });
});

// Get all events (requires admin auth)
app.get('/v1/admin/events', requireAdminAuth, (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;
  // Events are appended, so reverse to show newest first
  const allEvents = [...store.events].reverse();
  const filtered = allEvents.slice(offset, offset + limit);

  return res.json({ events: filtered, total: store.events.length });
});

// Get all users (requires admin auth)
app.get('/v1/admin/users', requireAdminAuth, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const userIds = Object.keys(store.users);
  const slicedIds = userIds.slice(offset, offset + limit);

  const usersList = slicedIds.map(id => ({
    id,
    ...store.users[id]
  }));

  return res.json({ users: usersList, total: userIds.length });
});

// ==================== ANALYTICS ENDPOINTS ====================

// Analytics overview (requires admin auth)
app.get('/v1/analytics/overview', requireAdminAuth, (req, res) => {
  const totalCampaigns = store.campaigns.length;
  const activeCampaigns = store.campaigns.filter(c => c.status === 'active').length;
  const totalEvents = store.events.length;
  const totalUsers = Object.keys(store.users).length;

  // Calculate metrics from events
  const impressions = store.events.filter(e => e.event === 'nudge_impression').length;
  const clicks = store.events.filter(e => e.event === 'nudge_click').length;
  const conversions = store.events.filter(e => e.event === 'nudge_conversion').length;

  return res.json({
    totalCampaigns,
    activeCampaigns,
    totalEvents,
    totalUsers,
    impressions,
    clicks,
    conversions,
    ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0,
    conversionRate: clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0,
  });
});

// Campaign analytics
app.get('/v1/analytics/campaigns/:id', (req, res) => {
  const { id } = req.params;
  const campaign = campaigns.find(c => c.id === id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const campaignEvents = events.filter(e => e.properties?.campaign_id === id);
  const impressions = campaignEvents.filter(e => e.event === 'nudge_impression').length;
  const clicks = campaignEvents.filter(e => e.event === 'nudge_click').length;
  const conversions = campaignEvents.filter(e => e.event === 'nudge_conversion').length;
  const dismissals = campaignEvents.filter(e => e.event === 'nudge_dismiss').length;

  return res.json({
    campaign_id: id,
    campaign_name: campaign.name,
    impressions,
    clicks,
    conversions,
    dismissals,
    ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0,
    conversionRate: clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : 0,
  });
});

// ==================== FEATURE FLAGS ENDPOINTS ====================

// Feature flags
let featureFlags = store.featureFlags || {};
store.featureFlags = featureFlags;

// Get feature flag (SDK endpoint - requires client or admin auth)
app.get('/v1/features/:key', requireAuth, (req, res) => {
  const { key } = req.params;
  const flag = featureFlags[key];
  return res.json({
    key,
    enabled: flag?.enabled || false,
    value: flag?.value
  });
});

// Create/update feature flag (requires admin auth)
app.post('/v1/admin/features', requireAdminAuth, adminLimiter, (req, res) => {
  const { key, enabled, value } = req.body;
  if (!key) return res.status(400).json({ error: 'key required' });

  featureFlags[key] = { enabled: enabled !== false, value };
  store.featureFlags = featureFlags;
  saveStore();

  console.log(`🚩 Feature flag updated: ${key} = ${enabled}`);
  return res.json({ ok: true, flag: featureFlags[key] });
});

// Get all feature flags (requires admin auth)
app.get('/v1/admin/features', requireAdminAuth, (req, res) => {
  return res.json({ flags: featureFlags });
});

// ==================== SEGMENTS ENDPOINTS ====================

// Segments
let segments = store.segments || [];
store.segments = segments;

// Create segment (requires admin auth)
app.post('/v1/admin/segments', requireAdminAuth, adminLimiter, (req, res) => {
  const segment = { ...req.body, id: uuidv4(), createdAt: new Date().toISOString() };
  segments.push(segment);
  store.segments = segments;
  saveStore();

  console.log(`🎯 Segment created: ${segment.name || segment.id}`);
  return res.status(201).json(segment);
});

// Get all segments (requires admin auth)
app.get('/v1/admin/segments', requireAdminAuth, (req, res) => {
  return res.json({ segments });
});

// Update segment (requires admin auth)
app.put('/v1/admin/segments/:id', requireAdminAuth, adminLimiter, (req, res) => {
  const { id } = req.params;
  const idx = segments.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Segment not found' });

  segments[idx] = { ...segments[idx], ...req.body, id, updatedAt: new Date().toISOString() };
  store.segments = segments;
  saveStore();

  console.log(`✅ Segment updated: ${segments[idx].name || id}`);
  return res.json(segments[idx]);
});

// Delete segment (requires admin auth)
app.delete('/v1/admin/segments/:id', requireAdminAuth, adminLimiter, (req, res) => {
  const { id } = req.params;
  const idx = segments.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Segment not found' });

  const deleted = segments.splice(idx, 1)[0];
  store.segments = segments;
  saveStore();

  console.log(`🗑️  Segment deleted: ${deleted.name || id}`);
  return res.json({ ok: true });
});

// ==================== HEALTH CHECK ====================

// Public health check (no auth required)
app.get('/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    auth: AUTH_REQUIRED ? 'enabled' : 'disabled',
    version: '1.0.0'
  });
});

// ==================== ERROR HANDLING ====================

// 404 handler for undefined routes
app.use((req, res) => {
  console.warn(`⚠️  404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
    availableRoutes: [
      'GET /v1/health',
      'POST /v1/track',
      'POST /v1/identify',
      'GET /v1/campaigns',
      'GET /v1/admin/campaigns',
      'POST /v1/admin/campaigns',
      'PUT /v1/admin/campaigns/:id',
      'DELETE /v1/admin/campaigns/:id',
    ]
  });
});

// Global error handler (must be last)
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }

  // JSON parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid JSON in request body'
    });
  }

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'CORS Error',
      message: 'Origin not allowed'
    });
  }

  // Generic 500 error
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ==================== SERVER START ====================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Nudge-Flow Server Started`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🌐 Network URL: http://0.0.0.0:${PORT} (accessible from emulator via 10.0.2.2:${PORT})`);
  console.log(`🔒 Auth Mode: ${AUTH_REQUIRED ? 'PRODUCTION (Auth Required)' : 'DEVELOPMENT (No Auth)'}`);
  console.log(`📁 Data File: ${DATA_FILE}`);
  console.log(`🎯 Campaigns: ${store.campaigns.length}`);
  console.log(`\nAPI Endpoints:`);
  console.log(`  GET  /v1/health - Health check`);
  console.log(`  POST /v1/track - Track events (SDK)`);
  console.log(`  POST /v1/identify - Identify users (SDK)`);
  console.log(`  GET  /v1/campaigns - Fetch campaigns (SDK)`);
  console.log(`  GET  /v1/admin/campaigns - List all campaigns (Admin)`);
  console.log(`  POST /v1/admin/campaigns - Create campaign (Admin)`);
  console.log(`  PUT  /v1/admin/campaigns/:id - Update campaign (Admin)`);
  console.log(`  DELETE /v1/admin/campaigns/:id - Delete campaign (Admin)\n`);
});
