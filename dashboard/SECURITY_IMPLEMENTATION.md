# Nudge-Flow Security Implementation Guide

## 🎯 Overview

This guide documents the comprehensive security implementation for the Nudge-Flow system, including API key authentication, role-based access control, rate limiting, and production deployment guidelines.

## 🔐 Security Features Implemented

### 1. API Key Authentication

**Two Authentication Methods Supported:**
- `x-api-key` header (used by in_app_ninja SDK)
- `Authorization: Bearer <token>` header (used by web dashboard)

**Two Types of API Keys:**
- **Admin Keys**: Full CRUD access to campaigns, feature flags, analytics, and segments
- **Client Keys**: Read campaigns, write events/identify only (for SDK integration)

### 2. Role-Based Access Control (RBAC)

**Admin Endpoints** (require admin API key):
- `POST /v1/admin/campaigns` - Create campaign
- `PUT /v1/admin/campaigns/:id` - Update campaign
- `DELETE /v1/admin/campaigns/:id` - Delete campaign
- `GET /v1/admin/campaigns` - List all campaigns
- `GET /v1/admin/campaigns/:id` - Get single campaign
- `POST /v1/admin/features` - Create/update feature flag
- `GET /v1/admin/features` - List all feature flags
- `POST /v1/admin/segments` - Create segment
- `PUT /v1/admin/segments/:id` - Update segment
- `DELETE /v1/admin/segments/:id` - Delete segment
- `GET /v1/admin/segments` - List all segments
- `GET /v1/analytics/overview` - View analytics

**SDK Endpoints** (require client or admin API key):
- `GET /v1/campaigns` - Fetch active campaigns for user
- `POST /v1/track` - Track events
- `POST /v1/identify` - Identify users
- `GET /v1/features/:key` - Get feature flag

**Public Endpoints** (no authentication required):
- `GET /v1/health` - Health check

### 3. Rate Limiting

- **General Endpoints**: 100 requests per 15 minutes per IP
- **Admin Endpoints**: 50 requests per 15 minutes per IP (stricter limit)

### 4. Security Headers

- Helmet.js integration (optional, controlled by `HELMET_ENABLED` env var)
- CORS configuration with origin whitelisting

### 5. Input Validation

- Campaign creation validates name and status fields
- Proper error messages with validation details
- Sanitized user input to prevent injection attacks

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server/` directory:

```bash
# Server Configuration
PORT=4000

# Authentication Mode
# Set to 'true' to enable API key authentication
# Set to 'false' for local development (no auth required)
AUTH_REQUIRED=false

# API Keys (comma-separated)
# Admin keys: Full access to all endpoints
ADMIN_API_KEYS=admin-key-123,admin-key-456

# Client keys: Limited to SDK endpoints (track, identify, campaigns)
CLIENT_API_KEYS=demo-api-key-123,client-key-789

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100   # Max requests per window

# CORS Configuration
# Use '*' for development, specific domains for production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:8081

# Security Headers
# Set to 'true' in production to enable helmet.js
HELMET_ENABLED=false
```

### Development vs Production Configuration

**Development Mode** (`.env` file):
```bash
AUTH_REQUIRED=false
ALLOWED_ORIGINS=*
HELMET_ENABLED=false
```
- No authentication required
- All origins allowed
- Security headers disabled
- Faster local development

**Production Mode** (`.env` file):
```bash
AUTH_REQUIRED=true
ADMIN_API_KEYS=<strong-random-admin-key>
CLIENT_API_KEYS=<strong-random-client-key>
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
HELMET_ENABLED=true
```
- Authentication required
- Strong, unique API keys
- Specific domain whitelist
- Security headers enabled

---

## 📱 SDK Integration (Flutter App)

### Current Integration (`untitled/lib/main.dart`)

```dart
await AppNinja.init(
  'demo-api-key-123',  // Client API key
  baseUrl: 'http://10.0.2.2:4000',  // Android emulator
  autoRender: true,
);
```

**What happens:**
1. SDK sends `x-api-key: demo-api-key-123` in all requests
2. Server validates the key against `CLIENT_API_KEYS` env var
3. If `AUTH_REQUIRED=false`, key is ignored (dev mode)
4. If `AUTH_REQUIRED=true`, key must be valid or request is rejected (401)

### Production Deployment

**Option 1: Hardcoded Client Key (Simple)**
```dart
await AppNinja.init(
  'prod-client-key-xyz',  // Replace with your production client key
  baseUrl: 'https://api.yourdomain.com',
  autoRender: true,
);
```

**Option 2: Dynamic Key from Backend (Recommended)**
```dart
// First, authenticate user with your backend
final authResponse = await yourBackend.login(email, password);
final apiKey = authResponse['nudge_api_key'];

// Then initialize SDK with user-specific key
await AppNinja.init(
  apiKey,
  baseUrl: 'https://api.yourdomain.com',
  autoRender: true,
);
```

---

## 🌐 Web Dashboard Integration

### Current Integration (`src/lib/api.ts`)

The dashboard uses `Authorization: Bearer` header:

```typescript
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  
  return headers;
}
```

### Update Required

Add admin API key to your dashboard environment:

**Create `src/config.ts`:**
```typescript
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  adminApiKey: import.meta.env.VITE_ADMIN_API_KEY || 'admin-key-123',
};
```

**Create `.env.local`** in project root:
```bash
VITE_API_URL=http://localhost:4000
VITE_ADMIN_API_KEY=admin-key-123
```

**Update `src/lib/api.ts`:**
```typescript
import { API_CONFIG } from '@/config';

const API_BASE_URL = API_CONFIG.baseUrl;
const API_KEY = API_CONFIG.adminApiKey;

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  };
}
```

---

## 🧪 Testing Authentication

### 1. Health Check (No Auth Required)

```bash
curl http://localhost:4000/v1/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-16T...",
  "auth": "disabled",
  "version": "1.0.0"
}
```

### 2. Test Admin Endpoint (With Auth)

**Set AUTH_REQUIRED=true in .env, then restart server**

**Without API Key (should fail):**
```bash
curl -X GET http://localhost:4000/v1/admin/campaigns
```

**Expected Response:**
```json
{
  "error": "Unauthorized",
  "message": "Admin API key required."
}
```

**With Admin API Key (should succeed):**
```bash
curl -X GET http://localhost:4000/v1/admin/campaigns \
  -H "x-api-key: admin-key-123"
```

**Or using Bearer token:**
```bash
curl -X GET http://localhost:4000/v1/admin/campaigns \
  -H "Authorization: Bearer admin-key-123"
```

**Expected Response:**
```json
{
  "campaigns": [...],
  "total": 20
}
```

### 3. Test Client Endpoint (SDK)

**With Client API Key:**
```bash
curl -X GET "http://localhost:4000/v1/campaigns?user_id=user_123" \
  -H "x-api-key: demo-api-key-123"
```

**Expected Response:**
```json
{
  "campaigns": [...]
}
```

### 4. Test Rate Limiting

**Send 101 requests within 15 minutes:**
```bash
for i in {1..101}; do
  curl http://localhost:4000/v1/campaigns?user_id=test \
    -H "x-api-key: demo-api-key-123"
done
```

**After 100 requests, you'll get:**
```json
{
  "error": "Too many requests, please try again later."
}
```

---

## 🚀 Production Deployment Checklist

### Pre-Deployment

- [ ] Generate strong, random API keys (use `openssl rand -hex 32`)
- [ ] Update `.env` with production API keys
- [ ] Set `AUTH_REQUIRED=true`
- [ ] Set `HELMET_ENABLED=true`
- [ ] Configure `ALLOWED_ORIGINS` with your domain(s)
- [ ] Review rate limits for your use case
- [ ] Test all endpoints with authentication
- [ ] Update Flutter app with production API key
- [ ] Update web dashboard with production admin key
- [ ] Set up SSL/TLS certificate
- [ ] Configure reverse proxy (Nginx/Apache)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for data.json
- [ ] Set up alerting for failed auth attempts

### Deployment Steps

1. **Clone repository to server**
   ```bash
   git clone <your-repo-url>
   cd nudge-flow-express-main/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create production .env file**
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

4. **Generate strong API keys**
   ```bash
   # Generate admin key
   openssl rand -hex 32
   
   # Generate client key
   openssl rand -hex 32
   ```

5. **Start server with PM2 (process manager)**
   ```bash
   npm install -g pm2
   pm2 start index.js --name nudge-server
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

7. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

8. **Monitor logs**
   ```bash
   pm2 logs nudge-server
   ```

---

## 🔒 Security Best Practices

### API Key Management

1. **Never commit API keys to version control**
   - Add `.env` to `.gitignore`
   - Use environment variables
   - Rotate keys regularly

2. **Use strong, random keys**
   ```bash
   # Generate secure random key (32 bytes = 64 hex characters)
   openssl rand -hex 32
   ```

3. **Separate keys for different environments**
   - Development keys (weak, for local testing)
   - Staging keys (moderate strength)
   - Production keys (strong, rotated regularly)

4. **Key rotation strategy**
   - Support multiple valid keys simultaneously
   - Add new key, deploy to all clients
   - Remove old key after grace period

### Request Logging

Add logging for security events:

```javascript
// Log failed auth attempts
console.warn(`⚠️  Failed auth: ${req.method} ${req.path} from ${req.ip}`);

// Log successful admin operations
console.log(`✅ Admin operation: ${req.method} ${req.path} by ${req.apiKey}`);
```

### Monitoring

Monitor these metrics:
- Failed authentication attempts per IP
- Rate limit violations
- Admin operations (create/update/delete)
- Unusual traffic patterns
- Response times and error rates

---

## 📊 API Reference

### Authentication Headers

**Option 1: x-api-key (Recommended for SDK)**
```
x-api-key: your-api-key-here
```

**Option 2: Authorization Bearer (Recommended for Dashboard)**
```
Authorization: Bearer your-api-key-here
```

### Error Responses

**401 Unauthorized**
```json
{
  "error": "Unauthorized",
  "message": "API key required. Provide x-api-key header or Authorization: Bearer token."
}
```

**403 Forbidden**
```json
{
  "error": "Forbidden",
  "message": "Admin API key required for this operation."
}
```

**429 Too Many Requests**
```json
{
  "error": "Too many requests, please try again later."
}
```

**400 Bad Request (Validation Error)**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "msg": "Campaign name is required",
      "param": "name",
      "location": "body"
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" error even with API key

**Solution:**
1. Check if `AUTH_REQUIRED=true` in .env
2. Verify API key is in `ADMIN_API_KEYS` or `CLIENT_API_KEYS`
3. Check header name: `x-api-key` or `Authorization: Bearer`
4. Restart server after changing .env file

### Issue: CORS error in browser

**Solution:**
1. Add your domain to `ALLOWED_ORIGINS` in .env
2. Format: `http://localhost:3000,https://yourdomain.com`
3. Use `*` for development (not recommended for production)

### Issue: Rate limit blocking legitimate traffic

**Solution:**
1. Increase `RATE_LIMIT_MAX_REQUESTS` in .env
2. Adjust `RATE_LIMIT_WINDOW_MS` (in milliseconds)
3. Consider per-API-key rate limiting instead of per-IP

### Issue: Server not reading .env file

**Solution:**
1. Verify .env file is in `server/` directory
2. Check file permissions: `chmod 600 .env`
3. Restart server after changes
4. Verify dotenv is installed: `npm list dotenv`

---

## 📚 Additional Resources

- [Express Rate Limit Documentation](https://github.com/express-rate-limit/express-rate-limit)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Validator Documentation](https://express-validator.github.io/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

---

## 🎉 Summary

Your Nudge-Flow system now has:
- ✅ API key authentication with dual header support
- ✅ Role-based access control (Admin vs Client)
- ✅ Rate limiting to prevent abuse
- ✅ Input validation for data integrity
- ✅ Security headers via Helmet.js
- ✅ CORS configuration for cross-origin requests
- ✅ Development and production modes
- ✅ Comprehensive logging and monitoring

**Next Steps:**
1. Test all endpoints with authentication enabled
2. Update Flutter app and web dashboard with API keys
3. Deploy to production with strong API keys
4. Set up monitoring and alerting
5. Document API keys securely for your team
