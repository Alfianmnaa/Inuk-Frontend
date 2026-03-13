# External Integrations

**Analysis Date:** 2026-03-13

## APIs & External Services

**Backend API:**
- Go Backend API (self-hosted)
  - Base URL: Configured via `VITE_API_URL` env var
  - Default: `http://localhost:8000` (dev), production URL from environment
  - Client: Axios HTTP library
  - Authentication: Bearer token (JWT)

**API Endpoints Consumed:**
- `/admin/profile` - Admin profile data
- `/admin/users` - User management
- `/admin/user/:id` - User detail
- `/admin/register` - User registration
- `/superadmin/admins` - Superadmin user management
- `/superadmin/admin/:id` - Admin CRUD operations
- `/user/profile` - User profile
- `/user/treasurer` - Treasurer data
- `/register` - Public registration
- `/donations` - Donation transactions (paginated)
- `/donations/extract` - Full donation data export
- `/donation` - Create/update donation
- `/donations-recap` - Donation statistics
- `/export/donation` - Async donation export
- `/infaqs` - Infaq management
- `/masjids` - Masjid/ mosque management
- `/regions` - Geographic region management
- `/cms/articles` - CMS article management

**Role-based Access:**
- `user` - Regular donors
- `admin` - Regional administrators
- `superadmin` - System administrators

## Data Storage

**Backend Database:**
- Not directly configured in frontend
- Backend handles database connections (likely PostgreSQL based on Go ecosystem)

**File Storage:**
- Local filesystem via nginx
- Export directories mounted from host:
  - `/exports/donations/` - Donation Excel exports
  - `/exports/infaqs/` - Infaq Excel exports
  - `/uploads/` - User uploaded files (images)
- Served via nginx with no-cache headers

**Caching:**
- Service Worker (PWA) - Asset caching
  - JS/CSS: StaleWhileRevalidate (7 days)
  - Images: CacheFirst (30 days)
  - Fonts: CacheFirst (1 year)
  - HTML: NetworkFirst (never precached)
  - Exports: NetworkOnly (never cache)

## Authentication & Identity

**Auth Provider:**
- Custom JWT-based authentication (self-hosted)
  - Token stored in localStorage
  - Role stored in localStorage (`userRole`)
  - Token passed via Authorization Bearer header

**Auth Flow:**
- Login stores token and role
- AuthContext provides authentication state throughout app
- ProtectedRoute component guards admin/superadmin routes

## Monitoring & Observability

**Error Tracking:**
- Not explicitly configured in frontend
- Errors caught and displayed via react-hot-toast

**Logs:**
- Console logging for development
- No external logging service integrated

## CI/CD & Deployment

**Hosting:**
- Docker containerization
- nginx for static file serving
- Traefik for reverse proxy and TLS

**Docker Build:**
- Multi-stage Dockerfile:
  1. Dev stage (node:25-alpine)
  2. Build stage (node:25-bookworm-slim)
  3. Production stage (nginx:1.29-bookworm)

**CI Pipeline:**
- Not explicitly configured in this repository
- Could be integrated with GitHub Actions, GitLab CI, etc.

## Environment Configuration

**Required env vars:**
- `VITE_API_URL` - Backend API base URL
- `CLIENT_DOMAIN` - Domain for CSP headers and Traefik routing

**Development:**
```
VITE_API_URL=http://localhost:8000
CLIENT_DOMAIN=localhost
```

**Production:**
- Set via `.env.prod` file
- Injected during Docker build

## Webhooks & Callbacks

**Incoming:**
- None detected - This is a frontend-only application

**Outgoing:**
- API calls to backend (documented above)
- No third-party webhooks

## External CDN Resources

**Fonts:**
- Google Fonts (fonts.googleapis.com)
- Google Fonts static (fonts.gstatic.com)
- CSP configured to allow these domains

**YouTube:**
- YouTube embeds (youtube-nocookie.com, youtube.com)
- For donation/thank you video content

---

*Integration audit: 2026-03-13*
