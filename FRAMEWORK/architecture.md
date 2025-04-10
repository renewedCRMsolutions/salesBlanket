# SalesBlanket Architecture

## Overview

SalesBlanket v4 uses a modern three-tier architecture:

1. **Frontend**: Vanilla JavaScript running on salesblanket.com
2. **Middleware**: GraphQL API server built with TypeScript/Node.js
3. **Database**: PostgreSQL with PostGIS on AWS RDS

## Architecture Diagram

```
┌─────────────────┐      ┌───────────────────┐      ┌─────────────────┐
│   Frontend      │      │     Middleware    │      │    Database     │
│                 │      │                   │      │                 │
│  Vanilla JS     │◄────►│  GraphQL API      │◄────►│  PostgreSQL     │
│  HTML/CSS       │      │  Apollo Server    │      │  PostGIS        │
│  Service Files  │      │  TypeScript/Node  │      │  AWS RDS        │
└─────────────────┘      └───────────────────┘      └─────────────────┘
     salesblanket.com          api.salesblanket.com     AWS RDS instance
```

## Frontend Structure

The frontend uses vanilla JavaScript with a service-based approach to communicate with the GraphQL API:

```
frontend/
  ├── index.html
  ├── css/
  │   └── styles.css
  ├── js/
  │   ├── app.js
  │   ├── components/
  │   │   ├── addressCard.js
  │   │   ├── map.js
  │   │   └── ...
  │   └── services/
  │       ├── api.js              // Base API configuration
  │       ├── addressService.js   // Address-related API calls
  │       ├── userService.js      // User authentication and profile
  │       ├── zoneService.js      // Zone and geography operations
  │       └── ...
  └── pages/
      ├── dashboard.html
      ├── addresses.html
      └── ...
```

### Service Pattern

The frontend uses a service pattern to handle API communication:

```javascript
// Example: services/api.js
export const API_URL = 'https://api.salesblanket.com/graphql';

export async function fetchGraphQL(query, variables = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
  });

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }
  
  return data.data;
}

// Example: services/addressService.js
import { fetchGraphQL } from './api.js';

export async function getAddresses(limit = 10, offset = 0, token) {
  const query = `
    query GetAddresses($limit: Int, $offset: Int) {
      addresses(limit: $limit, offset: $offset) {
        id
        street
        city
        state
        postalCode
      }
    }
  `;
  
  return fetchGraphQL(query, { limit, offset }, token);
}
```

## Middleware Structure

The middleware is a GraphQL API server built with Apollo Server and TypeScript:

```
server/
  ├── src/
  │   ├── index.ts               // Server entry point
  │   ├── apollo/
  │   │   ├── schema/            // GraphQL schema definitions
  │   │   ├── resolvers/         // GraphQL resolvers
  │   │   └── context.ts         // Request context setup
  │   ├── db/
  │   │   ├── models/            // Database models
  │   │   ├── migrations/        // Database migrations
  │   │   └── db.ts              // Database connection
  │   ├── services/
  │   │   ├── auth/              // Authentication services
  │   │   ├── google/            // Google API integration
  │   │   └── ...
  │   └── utils/
  │       ├── auth.ts            // Authentication utilities
  │       └── ...
  ├── package.json
  └── tsconfig.json
```

## Database Schema

The database uses PostgreSQL with PostGIS for geographical data. Key tables include:

- `users` - User accounts and authentication
- `addresses`, `contacts`, `opportunities` - Core entities
- `zones`, `zone_types` - Geographic zone management
- `view_configurations`, `view_types` - UI configuration
- `entity_card_pulse_*` - Google Workspace integration

## Authentication Flow

1. User logs in via the frontend using username/password or social login
2. GraphQL server authenticates and returns a JWT token
3. Frontend stores the token in localStorage
4. Subsequent requests include the token in Authorization header
5. GraphQL server validates the token and authorizes operations

## Deployment Strategy

### Frontend Hosting Options

The frontend static files (HTML, CSS, JS) can be hosted on:

1. **AWS S3 + CloudFront**:
   - Store files in S3 bucket
   - Use CloudFront for CDN and HTTPS
   - Benefits: High availability, global distribution, scalable

2. **AWS Amplify**:
   - Managed hosting solution with CI/CD
   - Built-in HTTPS and global CDN
   - Benefits: Easy deployment, CI/CD integration

3. **Netlify/Vercel**:
   - Modern static site hosting
   - Benefits: Free tier, easy deployment, CI/CD, preview deployments

### API Server Hosting Options

The GraphQL API server can be hosted on:

1. **AWS EC2**:
   - Virtual server running Node.js
   - Benefits: Full control, persistent server, flexibility

2. **AWS Lambda + API Gateway**:
   - Serverless function architecture
   - Benefits: Cost-effective, auto-scaling, no server management

3. **AWS App Runner**:
   - Managed container service
   - Benefits: Simplified deployment, auto-scaling, no infrastructure management

4. **AWS Elastic Beanstalk**:
   - PaaS solution for Node.js applications
   - Benefits: Easy deployment, managed environment

## Domain and DNS

- `salesblanket.com`: Frontend website
- `api.salesblanket.com`: GraphQL API
- Use Route 53 or your existing DNS provider for configuration