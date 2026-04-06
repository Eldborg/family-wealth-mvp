# Family Wealth MVP

A collaborative financial goal tracking platform for families. This monorepo contains the frontend (Next.js), backend (Express), and shared packages.

## Project Structure

```
family-wealth-mvp/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # Express backend API
├── packages/
│   ├── shared-types/ # Shared TypeScript types
│   └── ui/           # Component library
└── docs/             # Documentation
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **Monorepo**: Turborepo
- **Testing**: Jest, React Testing Library, Supertest
- **Database**: PostgreSQL with Prisma ORM

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15
- Docker (optional, for local database)

### Installation

1. Clone the repository
```bash
git clone https://github.com/anthropics/family-wealth-mvp.git
cd family-wealth-mvp
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env.local
```

4. Setup database
```bash
cd apps/api
npm run db:migrate
npm run db:seed
```

### Development

Start all services in development mode:
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- API: http://localhost:3001

### Building

Build all packages and apps:
```bash
npm run build
```

### Testing

Run tests across the monorepo:
```bash
npm run test
```

### Linting

Lint and format code:
```bash
npm run lint
npm run format
```

## Architecture Decisions

### Monorepo with Turborepo
- Single source of truth for shared types and components
- Simplified dependency management
- Consistent development experience across frontend and backend

### Frontend: Next.js
- Server-side rendering and static generation
- Built-in API routes (for future use)
- Excellent developer experience with TypeScript

### Backend: Express
- Lightweight and flexible
- Familiar to most Node.js developers
- Easy to extend with middleware

### Database: PostgreSQL + Prisma
- Strongly typed with Prisma schema
- Type-safe queries in both frontend and backend
- Migration management out of the box

## Features (Sprint 1)

- [ ] User authentication (BER-9)
  - Sign up / Login
  - Session management
  - Role-based access (family member, owner)

- [ ] Family management
  - Create family groups
  - Invite family members
  - Manage roles and permissions

- [ ] Goal tracking (BER-10)
  - Create and edit goals
  - Track progress
  - Update goal status

## Documentation

- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Development Guide](./docs/DEVELOPMENT.md)

## Contributing

This is a private MVP project. Contact the CTO for access.

## License

Internal Use Only
