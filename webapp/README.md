# Solarpunk Almanac - Web Application

The full-stack SvelteKit application for The Solarpunk Almanac platform.

## Tech Stack

- **Framework:** SvelteKit 2.x
- **Styling:** Tailwind CSS 3.x
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Lucia Auth
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # Type checking
npm run db:studio    # Open Prisma Studio
```

## Project Structure

```
webapp/
├── src/
│   ├── routes/           # SvelteKit routes (pages)
│   │   ├── +layout.svelte
│   │   ├── +page.svelte  # Home
│   │   ├── directory/    # Project directory
│   │   ├── editions/     # Seasonal editions
│   │   ├── tools/        # Interactive tools
│   │   └── community/    # Community/chapters
│   ├── lib/
│   │   ├── components/   # Reusable Svelte components
│   │   ├── stores/       # Svelte stores
│   │   ├── utils/        # Helper functions
│   │   └── server/       # Server-only code
│   ├── app.html          # HTML template
│   ├── app.css           # Global styles
│   └── app.d.ts          # Type declarations
├── static/               # Static assets
├── prisma/
│   └── schema.prisma     # Database schema
├── svelte.config.js
├── tailwind.config.js
└── package.json
```

## Features

### MVP (Current)

- [x] Home page with email signup
- [x] Project Directory with search/filter
- [x] Seasonal Editions viewer
- [x] Interactive Tools (Solar Calculator)
- [x] Community pages
- [x] Dark/Light theme
- [x] Responsive design
- [ ] User authentication
- [ ] Project submission
- [ ] Database integration

### Planned

- User profiles and saved projects
- Full CRUD for projects
- Edition content management
- More interactive tools
- Chapter management
- Events calendar
- API for mobile app

## Design System

### Colors

- **Solarpunk Teal:** `#01D4A9` - Primary accent
- **Solar Gold:** `#F4A020` - Secondary accent
- **Leaf Green:** `#4CAF50` - Tertiary accent
- **Slate:** Dark mode backgrounds

### Typography

- **Orbitron:** Headlines, branding
- **Inter:** Body text, UI

### Components

All components use the glassmorphic design system with consistent:
- Rounded corners (1rem)
- Backdrop blur effects
- Gradient accents
- Smooth transitions

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Public
PUBLIC_SITE_URL="http://localhost:5173"
PUBLIC_SITE_NAME="The Solarpunk Almanac"
```

## Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT License - see main repository for details.
