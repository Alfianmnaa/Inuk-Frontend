# Technology Stack

**Analysis Date:** 2026-03-13

## Languages

**Primary:**
- TypeScript 5.9.3 - Type-safe JavaScript for entire frontend codebase
- JavaScript (ES2022) - Compiled output targets

**Secondary:**
- CSS - Styling via Tailwind CSS

## Runtime

**Environment:**
- Node.js >=18 - Development and build runtime
- Browser (ES2022 + DOM) - Target runtime

**Package Manager:**
- npm (via package-lock.json)
- Lockfile: Present (package-lock.json)

## Frameworks

**Core:**
- React 19.2.3 - UI library
- React Router DOM 7.11.0 - Client-side routing
- Vite 7.1.7 - Build tool and dev server

**Styling:**
- Tailwind CSS 4.1.18 - Utility-first CSS framework
- @tailwindcss/vite 4.1.18 - Vite plugin for Tailwind
- @tailwindcss/typography 0.5.19 - Prose styling for content

**Rich Text Editor:**
- Tiptap 3.14.0 - Headless rich text editor
  - @tiptap/react - React adapter
  - @tiptap/starter-kit - Basic extensions
  - @tiptap/extension-image - Image support
  - @tiptap/extension-link - Link support
  - @tiptap/extension-text-align - Text alignment
  - @tiptap/extension-underline - Underline support
  - @tiptap/extension-youtube - YouTube embed
  - @tiptap/html - HTML serialization

**Animation:**
- Framer Motion 12.23.26 - React animation library
- Lucide React 0.562.0 - Icon components
- React Icons 5.5.0 - Icon library (FontAwesome)

**Charts:**
- Chart.js 4.5.1 - Charting library
- React Chartjs 2 5.3.1 - React wrapper for Chart.js

**Data Export:**
- xlsx (npm:@e965/xlsx@0.20.3) - Excel file generation
- file-saver 2.0.5 - File download utility

**HTTP Client:**
- Axios 1.13.2 - HTTP client for API calls

**Notifications:**
- React Hot Toast 2.6.0 - Toast notifications

**PWA:**
- Vite Plugin PWA 1.2.0 - Progressive Web App support

## Testing

**Development:**
- ESLint 9.39.2 - JavaScript/TypeScript linting
- TypeScript ESLint 8.50.1 - TypeScript ESLint support
- eslint-plugin-react-hooks 7.0.1 - React hooks linting
- eslint-plugin-react-refresh 0.4.26 - React refresh linting

## Key Dependencies

**Critical:**
- react@19.2.3 - UI framework
- react-dom@19.2.3 - React DOM rendering
- react-router-dom@7.11.0 - Client-side routing
- vite@7.1.7 - Build tool

**Infrastructure:**
- tailwindcss@4.1.18 - CSS framework
- @vitejs/plugin-react@5.1.2 - React Fast Refresh
- axios@1.13.2 - HTTP client

## Configuration

**Environment:**
- Vite uses `import.meta.env` for environment variables
- Key variables:
  - `VITE_API_URL` - Backend API URL (default: http://localhost:8000)
  - `CLIENT_DOMAIN` - Client domain for CORS/CSP

**Environment Files:**
- `.env.dev` - Development configuration
- `.env.prod` - Production configuration
- `.env.staging` - Staging configuration
- `.env.example` - Template

**Build:**
- `vite.config.ts` - Vite configuration with PWA, Tailwind, React plugins
- `tsconfig.json` - TypeScript base config
- `tsconfig.app.json` - Application TypeScript config
- `tsconfig.node.json` - Node TypeScript config
- `eslint.config.js` - ESLint configuration

## Platform Requirements

**Development:**
- Node.js >=18
- npm
- Development server runs on port 5173 (Vite default)

**Production:**
- Docker container with nginx 1.29
- Multi-stage build (dev -> build -> prod)
- Static file serving via nginx
- PWA with service worker for offline support
- Let's Encrypt TLS via Traefik reverse proxy

---

*Stack analysis: 2026-03-13*
