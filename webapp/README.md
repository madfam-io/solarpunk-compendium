# Solarpunk Almanac - Web Application

The full-stack SvelteKit application for The Solarpunk Almanac platform.

## Tech Stack

- **Framework:** SvelteKit 2.x
- **Styling:** Tailwind CSS 3.x
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** [Janua](https://github.com/madfam-io/janua) (self-hosted)
- **Email:** Resend (via Janua)
- **Deployment:** [Enclii](https://github.com/madfam-io/enclii) (self-hosted PaaS)
- **Language:** TypeScript

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cloudflare                               │
│  (DNS, TLS, CDN, R2 Storage, Tunnel)                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      Enclii (K8s)                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  SvelteKit  │  │   Janua     │  │  PostgreSQL │             │
│  │   (Web)     │──│   (Auth)    │──│  (Ubicloud) │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                          │                                       │
│                   ┌──────▼──────┐                               │
│                   │   Resend    │                               │
│                   │  (Email)    │                               │
│                   └─────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- [Janua](https://github.com/madfam-io/janua) running locally or deployed
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Development

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # Type checking
npm run db:studio    # Open Prisma Studio
```

### Running with Janua

```bash
# In a separate terminal, start Janua
cd /path/to/janua
docker-compose up -d postgres redis
uvicorn app.main:app --reload --port 8001

# Then start this app
npm run dev
```

## Project Structure

```
webapp/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte      # App shell
│   │   ├── +page.svelte        # Home
│   │   ├── (auth)/             # Auth pages (no nav/footer)
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── directory/          # Project directory
│   │   ├── editions/           # Seasonal editions
│   │   ├── tools/              # Interactive tools
│   │   │   └── solar-calculator/
│   │   └── community/          # Chapters & events
│   ├── lib/
│   │   ├── components/         # Reusable Svelte components
│   │   ├── stores/             # Svelte stores (auth, etc.)
│   │   │   └── auth.ts         # Janua auth store
│   │   ├── janua.ts            # Janua client configuration
│   │   ├── server/             # Server-only code
│   │   │   └── env.ts          # Environment config
│   │   └── utils/              # Helper functions
│   ├── hooks.server.ts         # Auth middleware
│   ├── app.html
│   ├── app.css
│   └── app.d.ts
├── static/
│   └── favicon.svg
├── prisma/
│   └── schema.prisma
├── .enclii.yml                 # Enclii deployment config
├── Dockerfile                  # Production container
└── package.json
```

## Features

### Implemented

- [x] Home page with email signup
- [x] Project Directory with search/filter
- [x] Seasonal Editions viewer
- [x] Interactive Tools (Solar Calculator)
- [x] Community pages
- [x] Dark/Light theme
- [x] Responsive design
- [x] Login/Signup pages
- [x] Janua auth integration
- [x] Enclii deployment config

### In Progress

- [ ] OAuth (GitHub, Google) via Janua
- [ ] User profiles
- [ ] Project submission flow
- [ ] Email verification

### Planned

- Full CRUD for projects
- Edition content management
- More interactive tools
- Chapter management
- Events calendar
- API for mobile app

## Authentication (Janua)

Authentication is handled by [Janua](https://github.com/madfam-io/janua), MADFAM's self-hosted auth platform.

### Auth Store

```typescript
import { auth, user, isAuthenticated } from '$lib/stores/auth';

// Sign up
await auth.signUp({ email, password, firstName, lastName });

// Sign in
await auth.signIn({ email, password });

// Sign out
await auth.signOut();

// OAuth
await auth.signInWithOAuth('github');
```

### Protected Routes

Routes are protected in `hooks.server.ts`:

```typescript
// These routes require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings'];
```

## Deployment (Enclii)

Deployment is managed by [Enclii](https://github.com/madfam-io/enclii), MADFAM's self-hosted PaaS.

### Deploy

```bash
# Initialize (first time)
enclii init solarpunk-almanac

# Deploy to staging
enclii deploy --environment staging

# Deploy to production
enclii deploy --environment production
```

### Configuration

See `.enclii.yml` for full deployment configuration including:
- Auto-scaling (2-10 replicas)
- Health checks
- TLS/SSL via Let's Encrypt
- PostgreSQL + Redis
- Secrets management
- CI/CD pipeline

## Design System

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Solarpunk Teal | `#01D4A9` | Primary accent |
| Solar Gold | `#F4A020` | Secondary accent |
| Leaf Green | `#4CAF50` | Tertiary accent |
| Slate 950 | `#020617` | Dark backgrounds |

### Typography

- **Orbitron:** Headlines, branding
- **Inter:** Body text, UI elements

### Components

All components use the glassmorphic design system:
- `glass` - Backdrop blur card
- `btn-primary` - Teal button
- `btn-secondary` - Outline button
- `input` - Form inputs
- `badge-*` - Status badges

## Environment Variables

See `.env.example` for full list. Key variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# Janua Auth
JANUA_API_URL="http://localhost:8001"
JANUA_API_SECRET="..."
PUBLIC_JANUA_API_URL="http://localhost:8001"
PUBLIC_JANUA_APP_ID="solarpunk-almanac"

# Email
RESEND_API_KEY="re_..."

# App
PUBLIC_SITE_URL="http://localhost:5173"
PUBLIC_SITE_NAME="The Solarpunk Almanac"
```

## Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT License - see main repository for details.
