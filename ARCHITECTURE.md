# Project Architecture: Page-First Approach

This project follows a **Page-First Architecture** pattern, organizing code around Next.js pages and routes.

## 📁 Directory Structure

```
src/
├── app/
│   ├── dashboard/                    # Dashboard page and related functionality
│   │   ├── components/               # Dashboard-specific components
│   │   │   ├── DashboardLayout.tsx   # Layout wrapper for dashboard
│   │   │   ├── IncidentsTab.tsx      # Incidents management tab
│   │   │   ├── IncidentSerpoList.tsx # Incident list component
│   │   │   ├── OverviewTab.tsx       # Dashboard overview tab
│   │   │   ├── SettingsTab.tsx       # Settings tab
│   │   │   ├── GoogleTestCard.tsx    # Google integration test card
│   │   │   ├── UserDetailsCard.tsx   # User details display
│   │   │   └── ui/                   # Dashboard-specific UI components
│   │   │       ├── ErrorAlert.tsx
│   │   │       ├── GoogleAuthAlert.tsx
│   │   │       ├── LoadingSkeleton.tsx
│   │   │       └── SyncingBadge.tsx
│   │   ├── hooks/                    # Dashboard-specific hooks
│   │   │   ├── useIncidentManagement.ts  # Main incident management logic
│   │   │   ├── useIncidentSerpo.ts       # Incident operations
│   │   │   ├── useIncidentSerpoList.ts   # Incident list data fetching
│   │   │   └── useUser.ts                # User authentication and data
│   │   ├── services/                 # Dashboard-specific services
│   │   │   └── incidentSupabase.ts   # Supabase incident operations
│   │   └── page.tsx                  # Dashboard main page
│   ├── profile/                      # Profile page
│   ├── oauth/                        # OAuth callback handling
│   └── api/                          # API routes
├── components/                       # Shared/global components
│   ├── ui/                          # Reusable UI components
│   ├── layouts/                     # Global layout components
│   ├── AppTopbar.tsx               # Application header
│   └── ConnectGoogleButton.tsx     # Google OAuth button
├── hooks/                           # Shared/global hooks
│   ├── use-mobile.ts               # Mobile device detection
│   └── useDriveSync.ts             # Google Drive synchronization
├── lib/                            # Shared utilities and configurations
│   ├── supabase.ts                 # Supabase client configuration
│   └── utils.ts                    # General utility functions
├── types/                          # Shared TypeScript type definitions
│   └── incident-serpo.ts           # Incident-related types
└── utils/                          # Additional utility modules
    └── supabase/                   # Supabase-specific utilities
```

## 🎯 Key Principles

### 1. **Page-Centric Organization**
- Each page directory (`dashboard/`, `profile/`, etc.) contains all its related functionality
- Components, hooks, and services are co-located with their respective pages
- Easy to understand what code belongs to which page

### 2. **Clear Separation of Concerns**
- **Components**: UI components specific to the page
- **Hooks**: Business logic and state management for the page
- **Services**: Data access and external API interactions
- **Types**: Page-specific TypeScript definitions (when needed)

### 3. **Shared Resources**
- Global components in `/components` for reuse across pages
- Shared hooks in `/hooks` for cross-page functionality
- Common types in `/types` for application-wide interfaces
- Utilities in `/lib` and `/utils` for helper functions

## 📋 Dashboard Page Structure

The dashboard page demonstrates the Page-First approach:

### Components (`/dashboard/components/`)
- **DashboardLayout.tsx**: Layout wrapper with loading and error states
- **IncidentsTab.tsx**: Main incidents management interface
- **IncidentSerpoList.tsx**: Incident list display and actions
- **OverviewTab.tsx**: Dashboard overview and statistics
- **UI Components**: Specialized UI components for dashboard functionality

### Hooks (`/dashboard/hooks/`)
- **useIncidentManagement.ts**: Orchestrates incident operations and Google Sheets sync
- **useIncidentSerpoList.ts**: Manages incident data fetching from Supabase
- **useIncidentSerpo.ts**: Handles individual incident operations
- **useUser.ts**: Manages user authentication and profile data

### Services (`/dashboard/services/`)
- **incidentSupabase.ts**: Supabase database operations for incidents

## 🔄 Data Flow

1. **Page Component** (`page.tsx`) renders the main layout
2. **Tab Components** handle specific functionality areas
3. **Hooks** manage state and business logic
4. **Services** handle data persistence and external APIs
5. **Components** render UI based on hook state

## ✅ Benefits of This Architecture

- **Intuitive Navigation**: Easy to find code related to specific pages
- **Next.js Alignment**: Naturally follows Next.js App Router conventions
- **Page Isolation**: Changes to one page are less likely to affect others
- **Team Collaboration**: Different teams can work on different pages independently
- **Code Splitting**: Natural boundaries for code splitting and lazy loading
- **Maintainability**: Clear structure makes code easier to maintain and debug

## 🚀 Adding New Features

When adding new functionality:

1. **Page-Specific**: Add to the relevant page directory (`/dashboard`, `/profile`, etc.)
2. **Shared**: Add to the appropriate shared directory (`/components`, `/hooks`, `/lib`)
3. **Follow the Pattern**: Maintain the same structure (components, hooks, services)

## 📝 Migration Notes

This project was refactored from a Feature-First to Page-First architecture:

- Moved incident management from `/features/incidentSerpo/` to `/dashboard/`
- Consolidated dashboard functionality from `/features/dashboard/` to `/dashboard/`
- Updated all import paths to reflect the new structure
  - Dashboard components now use `@/app/dashboard/components/`
  - Dashboard hooks now use `@/app/dashboard/hooks/`
  - Dashboard services now use `@/app/dashboard/services/`
- Fixed import paths in profile page and other components
- Maintained backward compatibility where possible

The refactoring improves code organization and aligns with Next.js best practices while maintaining all existing functionality.