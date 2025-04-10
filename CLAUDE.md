# SalesBlanket v4 Development Guide

## Core Rules

1. **ALWAYS follow the documentation and existing patterns**. If you encounter an issue not covered by existing rules or documentation, STOP and discuss it with me first.
2. **ABSOLUTELY NO EXTRA CODE. ONLY IMPLEMENT WHAT IS NEEDED**:
   - NEVER add code that isn't immediately required
   - NEVER import modules, components, or files that aren't used
   - It's ALWAYS easier to add code than to find and remove duplicates
   - Follow YAGNI (You Aren't Gonna Need It) principle strictly
   - Each function, import, and variable must have clear, immediate purpose
3. Do not write code without confirmation
4. Primary Goal is to complete the web app for BETA with lightweight code using modern JS web application techniques
5. NO FallBackCode for DEV - need to get the database wired in correctly

## Core Architecture

**Important Reference Files**:
- `/FINALSCHEMA.md` - Complete GraphQL schema definition
- `/FRAMEWORK/architecture.md` - System architecture and deployment strategy
- `/FRAMEWORK/DataBase/DBqueryfordatabaseschema.csv` - Complete database schema
- `/debugging-system.md` - Debugging tools and procedures
- `/view-system.md` - Database-driven view configuration system

SalesBlanket v4 is built on a modern, API-first architecture with these core components:

1. **Frontend**: Vanilla JavaScript with service-based API communication
2. **Middleware**: GraphQL API with Apollo Server (TypeScript/Node.js)
3. **Database**: PostgreSQL with PostGIS on AWS RDS
4. **Integration**: Google Maps Platform and Google Workspace APIs

## Key Design Principles

1. **DRY (Don't Repeat Yourself)**: Every piece of knowledge or logic must have a single, unambiguous representation within the system.
2. **Database-Driven UI**: All view configurations must be stored in the database, not hardcoded.
3. **Zone-Based Geography**: Unified geographic model replacing traditional regions/territories/districts.
4. **Entity-Based Architecture**: Generic entity system with specialized implementations.
5. **GraphQL-First**: API designed for GraphQL from the ground up.
6. **Type Safety**: TypeScript throughout the codebase.

## Non-Negotiable Code Quality Rules

1. **Absolutely No Duplicate Code**:

   - Create abstractions (hooks, components, services) instead of copying code
   - Extract common patterns into reusable functions
   - Use composition over inheritance to share functionality
   - ALWAYS follow the "once and only once" principle

2. **No Fallbacks or Workarounds**:

   - Address the root cause of issues, never implement a workaround
   - No hardcoded values or magic strings
   - No feature flags or conditional code paths (use database-driven configuration instead)
   - No "temporary" solutions that bypass the architecture

3. **Lightweight Code**:

   - Minimize dependencies - no unnecessary libraries
   - Components must be focused and do exactly one job
   - Remove unused code immediately
   - Follow YAGNI (You Aren't Gonna Need It) principle - only implement what's needed now

4. **TypeScript Enforcement**:

   - No `any` type - use proper typing everywhere
   - No type assertions except in test code
   - Use interfaces for entities that match the GraphQL schema exactly
   - Define and reuse type definitions consistently

5. **Service Structure**:

   - Each service must have a single responsibility
   - Logic must live in services, not components
   - Services must be stateless wherever possible
   - All API access must go through GraphQL, never direct HTTP calls

6. **Component Hierarchy**:
   - Components must be pure whenever possible
   - No direct DOM manipulation
   - Use database-driven view configurations
   - Follow a strict container/presentational component pattern

## Directory Structure

```
salesBlanketv4/
├── server/                       # Backend server code
│   ├── src/                      # Source code
│   │   ├── apollo/               # Apollo Server setup
│   │   │   ├── schema/           # GraphQL schema definitions
│   │   │   ├── resolvers/        # GraphQL resolvers
│   │   │   └── directives/       # GraphQL directives
│   │   ├── db/                   # Database access layer
│   │   │   ├── models/           # Database models
│   │   │   ├── migrations/       # Database migrations
│   │   │   └── seed/             # Seed data
│   │   ├── services/             # Business logic services
│   │   ├── utils/                # Utility functions
│   │   └── middleware/           # Express middleware
│   ├── tests/                    # Backend tests
│   └── package.json              # Backend dependencies
├── client/                       # Frontend client code
│   ├── src/                      # Source code
│   │   ├── apollo/               # Apollo Client setup
│   │   ├── components/           # React components
│   │   │   ├── base/             # Base/shared components
│   │   │   ├── maps/             # Map-related components
│   │   │   ├── views/            # View components (map, sheet, hybrid)
│   │   │   └── entities/         # Entity-specific components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── context/              # React context providers
│   │   ├── utils/                # Utility functions
│   │   └── styles/               # Global styles
│   ├── tests/                    # Frontend tests
│   └── package.json              # Frontend dependencies
├── docs/                         # Documentation
│   ├── architecture/             # Architecture documentation
│   ├── api/                      # API documentation
│   └── guides/                   # Development guides
└── README.md                     # Project README
```

## Key Entity Relationships

The SalesBlanket system revolves around these core entities and their relationships:

1. **Entities & Types**:

   - `Entity` is the base interface for all business objects
   - `EntityType` defines the characteristics of each entity category
   - Specific entity implementations include `Address`, `Contact`, and `Opportunity`

2. **Zone System**:

   - `ZoneType` defines types of geographic areas
   - `Zone` represents actual geographic boundaries
   - `EntityZone` connects entities to zones

3. **View System**:

   - `ViewType` defines basic view patterns (map, list, grid, etc.)
   - `ViewConfiguration` contains specific view settings
   - `UserViewPreference` stores user-specific view preferences

4. **Pulse & Card System**:

   - `EntityCard` represents a configurable display card
   - `EntityCardPulse` connects to various external systems (Google Workspace)

5. **Touchpoint System**:
   - `TouchpointType` defines categories of interactions
   - `EntityTouchpoint` records specific entity interactions

## Database Schema Requirements

1. **All tables must include**:

   - `id` (UUID primary key)
   - `created_at` (timestamp with timezone)
   - `updated_at` (timestamp with timezone)

2. **Geographic data must use**:

   - PostGIS geography/geometry types
   - Appropriate spatial indexing
   - Standardized coordinate systems (SRID 4326)

3. **JSON storage**:
   - Use JSONB for all structured data
   - Follow consistent object structure patterns
   - Include schema validation at the application level

## GraphQL Schema

The GraphQL schema is the contract between frontend and backend. It must follow these rules:

1. **Interfaces**:

   - Use the `Entity` interface for all business objects
   - Define shared behavior through interfaces

2. **Type Definitions**:

   - Include descriptions for all types and fields
   - Use consistent naming patterns
   - Follow the schema defined in FINALSCHEMA.md exactly

3. **Resolver Implementation**:
   - Separate resolvers by domain
   - Use DataLoader for batching and caching
   - Implement proper error handling and validation

## Authentication & Authorization

1. **Auth Flow**:

   - JWT-based authentication
   - Token refresh mechanism
   - Secure cookie storage

2. **Permission System**:
   - Role-based access control
   - Field-level permissions in GraphQL
   - Entity-specific authorization checks

## Google Integration Requirements

1. **Maps Platform**:

   - Use the Google Maps JavaScript API v3
   - Implement Advanced Markers for entity visualization
   - Use Places API for address validation and geocoding

2. **Workspace Integration**:

   - Google Drive for document storage
   - Google Calendar for scheduling
   - Gmail for communication tracking
   - Google Meet for virtual appointments

3. **Google Zones**
   - Leverage Google Zones to handle our Zones boundary system
   - Google Places API to pull Address Data to load into the database
   - GEO fencing for salesman route tracking

## Conventions

1. **Naming**:

   - PascalCase for React components and TypeScript interfaces
   - camelCase for variables, functions, and instances
   - snake_case for database tables and columns
   - UPPER_CASE for constants

2. **Code Organization**:

   - One component per file
   - Index files for exporting multiple components
   - Co-locate tests with code (e.g., `Component.tsx` and `Component.test.tsx`)

3. **TypeScript Patterns**:

   - Use interfaces for object shapes
   - Use type unions for variants
   - Use generics for reusable types
   - Define entity types that exactly match GraphQL schema

4. **Component Patterns**:
   - Use functional components with hooks
   - Props interfaces must be explicitly defined
   - Destructure props in function signature
   - Use React.memo for performance optimization when appropriate

## Performance Requirements

1. **Rendering Optimization**:

   - Virtualized lists for all large collections
   - Request only needed fields in GraphQL queries
   - Use React.memo, useMemo, and useCallback appropriately
   - Implement lazy loading and code splitting

2. **Network Efficiency**:

   - Cache policies must be defined for all queries
   - Implement persisted queries for common operations
   - Use optimistic UI updates for mutations

3. **Geographic Data**:
   - Use clustering for map markers
   - Implement level-of-detail for boundaries
   - Cache geographic data locally when possible

## Testing Requirements

1. **Coverage Goals**:

   - 100% coverage for critical business logic
   - 85%+ coverage for UI components
   - 90%+ coverage for GraphQL resolvers

2. **Test Types**:
   - Unit tests for individual functions and hooks
   - Integration tests for service interactions
   - Component tests for UI validation
   - E2E tests for critical user flows

## Development Workflow

1. **Code Reviews**:

   - All code must be reviewed by at least one other developer
   - Reviews must check for DRY violations
   - CI must pass before merging
   - No direct commits to main branch

2. **Issue Tracking**:

   - Every feature must have a corresponding issue
   - Issues must be prioritized and estimated
   - Code must reference the issue number

3. **Documentation**:
   - API endpoints must be documented in schema
   - Business logic must have clear comments
   - Architecture decisions must be documented

## Implementation Phases

1. **Phase 1**: Set up project structure, database migrations, GraphQL schema
2. **Phase 2**: Implement core entity and zone management
3. **Phase 3**: Build view system and UI components
4. **Phase 4**: Integrate Google Maps and Workspace APIs
5. **Phase 5**: User management, permissions, and advanced features
