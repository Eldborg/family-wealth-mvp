# Development Guide

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Docker and Docker Compose ([Download](https://www.docker.com/products/docker-desktop))
- Git

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/anthropics/family-wealth-mvp.git
cd family-wealth-mvp
```

### 2. Install Dependencies

```bash
npm install
```

This installs dependencies for all workspaces (apps and packages).

### 3. Start Infrastructure (PostgreSQL + Redis)

```bash
docker-compose up -d
```

Verify services are running:
```bash
docker-compose ps
```

### 4. Setup Database

```bash
cd apps/api
npm run db:migrate
npm run db:seed
cd ../..
```

This creates database tables and populates seed data.

### 5. Start Development Servers

```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:3000 (Next.js dev server)
- **Backend**: http://localhost:3001 (Express server)
- **Database**: localhost:5432 (PostgreSQL)
- **Cache**: localhost:6379 (Redis)

## Development Workflow

### File Structure

```
apps/
├── web/               # Frontend (Next.js)
│   ├── app/          # Next.js app directory
│   ├── components/   # React components
│   └── styles/       # Global styles
│
└── api/              # Backend (Express)
    ├── src/
    │   ├── index.ts  # Server entry point
    │   ├── routes/   # API routes
    │   ├── models/   # Data models
    │   └── middleware/ # Express middleware
    └── prisma/       # Database schema

packages/
├── shared-types/     # Shared TypeScript interfaces
└── ui/              # Reusable React components
```

### Making Changes

#### Frontend Changes

1. Edit files in `apps/web/app` or `apps/web/components`
2. Changes auto-reload thanks to Next.js HMR

```bash
# Run frontend tests
cd apps/web
npm run test
```

#### Backend Changes

1. Edit files in `apps/api/src`
2. Server auto-restarts via `ts-node-dev`

```bash
# Run backend tests
cd apps/api
npm run test
```

#### Shared Types Changes

1. Edit `packages/shared-types/src/index.ts`
2. Rebuild: `npm run build` (from root)
3. Changes apply to both frontend and backend

### Database Migrations

After modifying `schema.prisma`:

```bash
cd apps/api
npm run db:migrate
```

Create a named migration:
```bash
npx prisma migrate dev --name add_new_table
```

View database in Prisma Studio:
```bash
npx prisma studio
```

## Testing

### Run All Tests

```bash
npm run test
```

### Run Tests for Specific App

```bash
cd apps/web
npm run test       # Frontend tests

cd ../api
npm run test       # Backend tests
```

### Watch Mode

```bash
cd apps/web
npm run test -- --watch
```

## Linting & Formatting

### Check Code Quality

```bash
npm run lint        # Check for issues
npm run format:check # Check formatting
```

### Fix Issues

```bash
npm run format      # Auto-format code
npm run lint -- --fix # Fix linting issues
```

## Building

### Build for Production

```bash
npm run build       # Builds all apps and packages
```

### Frontend Production Build

```bash
cd apps/web
npm run build
npm run start       # Start production server on :3000
```

### Backend Production Build

```bash
cd apps/api
npm run build
npm run start       # Start production server on :3001
```

## Debugging

### Frontend Debugging

1. Open http://localhost:3000 in browser
2. Use Chrome DevTools (F12)
3. Edit breakpoints in VS Code with debugger

### Backend Debugging

```bash
cd apps/api
node --inspect-brk dist/index.js
```

Then open `chrome://inspect` in Chrome.

### Database Inspection

```bash
# Open Prisma Studio (web UI for database)
cd apps/api
npx prisma studio
```

## Environment Variables

### Local Development

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values. For Docker Compose, use `.env.development`.

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for signing JWTs
- `NEXT_PUBLIC_API_URL` - Backend API URL (must be public)

## Docker Commands

### View Logs

```bash
docker-compose logs -f postgres    # PostgreSQL logs
docker-compose logs -f redis       # Redis logs
```

### Stop Services

```bash
docker-compose down
```

### Reset Database

```bash
docker-compose down -v             # Remove volume
docker-compose up -d               # Start fresh
npm run db:migrate                 # Recreate tables
```

## Troubleshooting

### Port Already in Use

If 3000, 3001, 5432, or 6379 are already in use:

1. Find the process: `lsof -i :PORT_NUMBER`
2. Kill it: `kill -9 PID`
3. Or change ports in docker-compose.yml and .env files

### Database Connection Refused

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Check connection string in .env.development
```

### npm Dependencies Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 3000/3001 already in use

Find what's running:
```bash
lsof -i :3000
lsof -i :3001
```

Kill the process:
```bash
kill -9 <PID>
```

## Git Workflow

### Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Commit Changes

```bash
git add .
git commit -m "feat: describe your changes"
```

### Push to Remote

```bash
git push origin feature/your-feature-name
```

### Create Pull Request

Open a PR on GitHub for code review.

## Further Reading

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
