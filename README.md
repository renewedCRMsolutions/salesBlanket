# SalesBlanket v4

A door-to-door sales application with a modern, API-first architecture featuring GraphQL, PostgreSQL with PostGIS, and Google Zones integration.

## Core Architecture

- **Database Layer**: PostgreSQL with PostGIS for geographic data
- **API Layer**: GraphQL with Apollo Server
- **Frontend**: React with Apollo Client and TypeScript
- **Integration**: Google Maps Platform and Google Workspace APIs

## Getting Started

### Prerequisites

- Node.js v16+
- PostgreSQL 13+ with PostGIS extension
- Google Cloud Platform account with:
  - Maps JavaScript API
  - Places API
  - Geocoding API

### Environment Setup

1. Set up your `.env` file in the server directory:

```
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=salesblanketv4
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1d

# Google API Keys
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
GOOGLE_PLACES_API_KEY=your-google-places-api-key
```

### Database Setup

1. Create and seed the database:

```bash
# In the server directory
npm run db:create   # Create the database
npm run db:init     # Initialize schema
npm run db:seed     # Add seed data

# Or run everything at once
npm run db:reset
```

### Server Setup

1. Install dependencies:

```bash
# In the server directory
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Access GraphQL Playground at http://localhost:4000/graphql

## Key Features

### Entity System

The system uses a polymorphic entity approach with:

- Base Entity interface
- Entity types (Address, Contact, Opportunity)
- Entity relationships

### Zone System

A flexible geographic boundary system with:

- Zone Types (Country, State, City, Neighborhood, SalesTerritory)
- Google Places API integration
- PostGIS spatial queries

### View System

A database-driven UI configuration system:

- View Types (Map, List, Grid, Hybrid)
- View Configurations
- User View Preferences

### Authentication

Multiple authentication options:

- Email/Password authentication
- Social login (Google, Facebook, Amazon)
- JWT token-based sessions

## Development Guidelines

### Code Style

The project follows strict code quality rules:

1. **No Duplicate Code**: Follow DRY principles rigorously
2. **No Fallbacks or Workarounds**: Address root causes
3. **Lightweight Code**: Minimize dependencies
4. **TypeScript Enforcement**: No `any` type

### API Access

All data access happens through GraphQL:

- Queries for data retrieval
- Mutations for data modification
- Subscriptions for real-time updates

### Database Schema

- All tables include `id`, `created_at`, and `updated_at`
- Geographic data uses PostGIS types
- JSONB for structured data

## Documentation

For more details, see:

- [View System](./view-system.md)
- [Debugging System](./debugging-system.md)
- [Final Schema](./FINALSCHEMA.md)

## Testing

```bash
# Run tests
npm test

# Check TypeScript types
npm run typecheck

# Lint code
npm run lint
```

## License

Proprietary - All rights reserved