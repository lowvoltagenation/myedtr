# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyEdtr is a professional video editor marketplace built with Next.js 15, Supabase, and TypeScript. It connects clients with video editors through a two-sided marketplace platform with subscription tiers, messaging, project management, and payment processing.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server on localhost:3000
- `pnpm build` - Build production application
- `pnpm start` - Start production server
- `pnpm lint` - Run Next.js linter
- `pnpm check:dark-mode` - Audit light/dark mode consistency
- `pnpm audit:dark-mode` - Generate dark mode consistency report

### Database Commands
- `supabase start` - Start local Supabase instance
- `supabase db reset` - Reset local database with migrations and seed data
- `supabase gen types typescript --local` - Generate TypeScript types from database schema
- `supabase db push` - Push schema changes to remote database
- `supabase migration new <name>` - Create new migration file

### Local Development URLs
- Frontend: http://localhost:3000
- Supabase Studio: http://localhost:54323
- Database: postgresql://postgres:postgres@localhost:54322/postgres

## Architecture Overview

### Authentication System
- **Supabase Auth** with email/password and Google OAuth
- **Middleware-based protection** (`src/middleware.ts`) for route guarding
- **Dual user types**: editors and clients with separate onboarding flows
- **Session management** via Supabase SSR cookies
- **Profile system** with separate `users` and `editor_profiles` tables

### Key Authentication Files
- `src/middleware.ts` - Route protection and auth state validation
- `src/lib/supabase/client.ts` - Browser client initialization
- `src/lib/supabase/server.ts` - Server-side client with cookie handling
- `src/app/auth/callback/route.ts` - OAuth callback handler with user type routing
- `src/components/layout/header.tsx` - Auth state management and user navigation

### Database Schema
- **Users table** - Base user accounts (client/editor types)
- **Editor profiles** - Detailed editor information, portfolios, rates, tier levels
- **Projects** - Client project postings with requirements and budgets
- **Messages** - In-app communication system between clients and editors
- **Reviews** - Rating and feedback system for completed projects
- **Project applications** - Editor application workflow with status tracking
- **Subscriptions** - Tier-based access control with usage tracking
- **Usage metrics** - Track feature usage for subscription limits

### Subscription System
- **Three tiers**: free, pro, featured with different limits
- **Feature gating** via `src/hooks/useSubscription.ts`
- **Usage tracking** for projects, applications, messages
- **Stripe integration** for payment processing
- **Circuit breaker pattern** to prevent infinite loops in subscription hooks

### UI Architecture
- **shadcn/ui components** in `src/components/ui/`
- **Feature-specific components** organized by domain (auth, client, editor, etc.)
- **Responsive design** with mobile-first approach
- **Dark mode support** with next-themes and CSS variables
- **Custom design system** with purple/cyan color scheme

## Important Patterns

### Authentication State Management (Updated with Phase 1 & 2 Fixes)
- ✅ **Hybrid AuthContext implemented** - Client-side state coordination with server-side security
- ✅ **Dashboard pages use Suspense boundaries** - Prevents blank screens during server-side auth checks
- ✅ **Single source of truth for auth state** - `useAuth()` hooks provide coordinated state access
- ✅ **Proper SSR hydration handling** - Auth context waits for hydration before rendering
- ✅ **Role-based helpers** - `useIsEditor()`, `useIsClient()`, `useRequireAuth()` for clean component logic
- ✅ **AuthGuard components** - Optional wrappers for client components needing auth protection
- ✅ **Avatar and profile helpers** - `useAvatar()`, `useProfile()` for optimized re-rendering
- Server components continue using `createClient()` for security validation

### Database Interactions
- Use typed clients with generated types from `src/types/database.ts`
- Row Level Security (RLS) policies enforce access control
- User profiles are created via database triggers on auth signup
- Always handle database errors gracefully with fallbacks

### Component Patterns
- Server components for initial data fetching
- Client components for interactive features
- Proper loading states and error boundaries
- Consistent prop interfaces and TypeScript usage

## Known Issues

### Authentication Issues (Phase 1 & 2 FIXES IMPLEMENTED)
- ✅ **FIXED: Blank screens during auth loading** - Added Suspense boundaries and loading skeletons
- ✅ **FIXED: Header component race conditions** - Implemented separate auth/profile loading states
- ✅ **FIXED: Avatar display timing issues** - Added proper loading states and error handling
- ✅ **FIXED: Missing global auth context** - Implemented hybrid AuthContext with client-side coordination
- ✅ **FIXED: Duplicate auth calls** - Single source of truth prevents multiple API calls
- ✅ **FIXED: Uncoordinated loading states** - Global auth context coordinates all loading states

### Subscription System
- **Realtime subscriptions disabled** - Temporarily disabled due to infinite loop issues
- **Complex useEffect dependencies** - May cause unnecessary re-renders
- **Circuit breaker implementation** - Prevents infinite loops but may disable features

## Common Development Tasks

### Adding New Protected Routes
1. Add route to middleware public paths or ensure proper auth checks
2. Implement loading states for auth-dependent components
3. Add proper error handling for auth failures
4. Test with both user types (client/editor)

### Database Schema Changes
1. Create migration: `supabase migration new description`
2. Write SQL in the migration file
3. Test locally: `supabase db reset`
4. Generate types: `supabase gen types typescript --local`
5. Update TypeScript interfaces in `src/types/database.ts`

### Adding Subscription Features
1. Check usage limits with `useSubscription` hook
2. Implement proper loading states and error handling
3. Add feature flags to subscription service
4. Test with different tier levels
5. Update UI to show upgrade prompts for restricted features

### Working with Supabase Storage
- Configure image domains in `next.config.ts`
- Use storage buckets for user avatars and portfolio content
- Implement proper file upload with progress indicators
- Handle storage errors gracefully with fallbacks

## Environment Configuration

### Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key for payments
- `STRIPE_SECRET_KEY` - Stripe secret key for backend operations
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret

### Development Setup
- Install dependencies: `pnpm install`
- Copy `.env.example` to `.env.local` if it exists
- Supabase project configured for local development
- Stripe keys needed for subscription features
- Google OAuth configured for authentication

## Testing Strategy

### Authentication Testing
- Test both user types (client/editor) signup and login flows
- Verify OAuth callback handling and user type routing
- Test middleware protection on all protected routes
- Verify session persistence across page refreshes

### Database Testing
- Test RLS policies with different user contexts
- Verify triggers for user profile creation
- Test subscription tier changes and usage tracking
- Validate data consistency across related tables

### UI Testing
- Test responsive design across device sizes
- Verify dark mode compatibility
- Test component loading states and error handling
- Validate subscription feature gating