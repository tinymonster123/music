# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `yarn dev` - Start development server with debugging enabled (uses Next.js Turbo)
- `yarn build` - Build production application
- `yarn start` - Start production server
- `yarn lint` - Run ESLint code linting

### Testing
- `yarn test` - Run Jest tests
- `yarn test:watch` - Run Jest tests in watch mode

Note: TypeScript and ESLint errors are ignored during builds for faster development.

## Architecture Overview

### Framework and Stack
- **Next.js 15** with App Router (pages in `/src/app/pages/`)
- **TypeScript** with React 19
- **TailwindCSS** with custom design system
- **Next-Auth v5** for authentication
- **Zustand** for client-side state management
- **MySQL** database with SSH tunnel support

### Database Architecture
- **Production**: Direct database connection to MySQL
- **Development**: SSH tunnel connection via `ssh2`
- Connection pooling and automatic reconnection handling
- Database adapter: PostgreSQL adapter for Next-Auth (despite MySQL usage)

### Authentication System
- **NextAuth v5** with JWT strategy
- **Providers**: GitHub OAuth + Credentials (email/password)
- **Session**: 30-day expiration, JWT-based
- **Database**: User data stored in PostgreSQL via adapter
- **Custom pages**: Login at `/pages/login`

### State Management
- **Global state**: Zustand stores in `/src/app/hooks/`
- **SQL data store**: `useSQLStore` for query results and columns
- **Session state**: NextAuth handles authentication state
- **Component state**: React hooks for local state

### API Architecture
- **Route handlers** in `/src/app/api/` following App Router patterns
- **Authentication middleware**: `withAuth` wrapper for protected routes
- **Error handling**: Custom `ApiErrorResponse` class with structured error responses
- **External services**: Text-to-SQL API integration with token-based auth

### Key API Endpoints
- `/api/text2sql` - Text-to-SQL conversion with authentication
- `/api/dataStatics` - Album date statistics with caching
- `/api/connection` - Database connection management
- `/api/auth/[...nextauth]` - NextAuth authentication handlers

### Component Structure
- **Pages**: Main application pages in `/src/app/pages/`
- **Components**: Reusable UI components in `/src/app/component/`
- **Layout**: Single SessionProvider in root layout, avoid nesting providers
- **Animation**: Framer Motion integration for SVG animations

### Database Connection Management
The app uses a sophisticated connection system:
- Automatic connection pooling with 10-connection limit
- SSH tunnel for development environments
- Direct connection for production with SSL
- Connection timeout and retry logic
- Fallback handling for connection failures

### Performance Optimizations
- **Turbo mode** enabled for faster builds
- **Code splitting** with optimized chunk strategy
- **Brotli compression** for static assets
- **CSS optimization** with PostCSS and TailwindCSS
- **SVG optimization** with SVGR webpack loader

### Key Files to Understand
- `auth.ts` - NextAuth configuration with custom callbacks
- `src/app/api/connection/connection.ts` - Database connection logic
- `src/app/api/middleware/auth.ts` - API authentication middleware
- `next.config.ts` - Complex webpack configuration for SSH/crypto modules
- `src/app/hooks/sqldate/index.tsx` - SQL result state management

### Development Notes
- Uses Yarn 4.6.0 as package manager
- SWC for fast TypeScript compilation
- Custom fonts: Mona Sans, Source Serif, Helvetica Rounded
- Environment variables required for database, SSH, and OAuth configuration
- Tests use SWC Jest for fast execution

### Data Flow
1. User authenticates via NextAuth (GitHub or credentials)
2. Protected pages use session data from JWT tokens
3. Text queries sent to external text2sql service
4. SQL results stored in Zustand store
5. Virtualized lists render large datasets efficiently
6. Database queries cached with Last-Modified headers