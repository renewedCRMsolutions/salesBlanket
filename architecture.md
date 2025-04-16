# salesBlanket Architecture

## Overview

salesBlanket v4 uses a modern three-tier architecture:

1. **Frontend**: Vanilla JavaScript running on salesBlanket.com
2. **Middleware**: GraphQL API server built with TypeScript/Node.js
3. **Database**: PostgreSQL with PostGIS on AWS RDS

The service registry with dependency injection provides a clean architecture that will scale well as your app grows.

## View - Services

Dependency Injection - Foundation for Services

Use Case: Primarily for managing your services and making them available to components. Services are things like data fetching, API clients, utility libraries, authentication services, etc.
Role: DI sets the stage for creating modular and testable services. You would likely use DI to make your services available to components that need them.
Example: You might have a ProductService for fetching product data. You would use DI to inject this ProductService into components like ProductListComponent or ProductDetailsComponent.

Pub/Sub (For Decoupled Component Communication):

Use Case: For communication between components, especially when you want components to be loosely coupled and not directly aware of each other. Good for events, notifications, and actions that need to trigger responses in different parts of the UI.
Role: Pub/Sub handles inter-component communication effectively. Components can publish events when something significant happens (e.g., "product added to cart," "user logged in"), and other components that are interested can subscribe to these events and react accordingly.
Example: A AddToCartButton component might publish a "productAddedToCart" event when clicked. A ShoppingCartBadge component (in a completely different part of the UI) could subscribe to this event and update the cart badge count.

Web Components with Context (For Component Hierarchies and Shared State/Services within a Component Tree):

Use Case: Most relevant if you are building your UI using Web Components and have nested component structures. Context is excellent for sharing data or services down a component tree without prop drilling. It's about providing a shared environment for a group of related components.
Role: Context manages shared state or services within a component hierarchy. It's a way to make certain things accessible to all components within a subtree without passing them explicitly as props through every level.
Example: Imagine a complex form built with Web Components. You might use Context to provide a shared form validation service or form state management to all the form input components nested within the form. Or, a theme provider context to share theme settings across UI components.



## Architecture Diagram

```
┌─────────────────┐      ┌───────────────────┐      ┌─────────────────┐
│   Frontend      │      │     Middleware    │      │    Database     │
│                 │      │                   │      │                 │
│  Vanilla JS     │◄────►│  GraphQL API      │◄────►│  PostgreSQL     │
│  HTML/CSS       │      │  Apollo Server    │      │  PostGIS        │
│  Service Files  │      │  TypeScript/Node  │      │  AWS RDS        │
└─────────────────┘      └───────────────────┘      └─────────────────┘
     salesBlanket.com          api.salesBlanket.com     AWS RDS instance
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
export const API_URL = 'https://api.salesBlanket.com/graphql';

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

- Assignment tables written parent_child_assignments
- Junction tables - table_table

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

- `salesBlanket.com`: Frontend website
- `api.salesBlanket.com`: GraphQL API
- Use Route 53 or your existing DNS provider for configuration

State Management Model:

{
  "stateManagementSchema": {
    "stores": [
      "UserStore", "EntityStore", "CollectionStore", 
      "WorkflowStore", "UIStore", "GeospatialStore"
    ]
  },
  "entityStoreExample": {
    "state": {
      "entities": {
        "byId": {
          "entity_uuid_1": {
            "id": "entity_uuid_1",
            "type": "ADDRESS",
            "attributes": {
              "street": "123 Main St",
              "city": "Springfield"
            },
            "status": "ACTIVE",
            "relationships": {
              "collection": "collection_uuid_1",
              "contacts": ["contact_uuid_1", "contact_uuid_2"]
            },
            "metadata": {
              "lastVisited": "2025-04-08T14:30:00.000Z",
              "tags": ["high_value"]
            }
          }
        },
        "allIds": ["entity_uuid_1", "entity_uuid_2"],
        "byType": {
          "ADDRESS": ["entity_uuid_1"],
          "CONTACT": ["entity_uuid_2"]
        },
        "byCollection": {
          "collection_uuid_1": ["entity_uuid_1", "entity_uuid_2"]
        }
      },
      "ui": {
        "loading": false,
        "selectedEntityId": "entity_uuid_1",
        "filters": {
          "status": "ACTIVE",
          "types": ["ADDRESS", "CONTACT"]
        },
        "pagination": {
          "page": 1,
          "pageSize": 25,
          "totalItems": 126
        }
      }
    },
    "actions": [
      "FETCH_ENTITIES_REQUEST",
      "FETCH_ENTITIES_SUCCESS",
      "FETCH_ENTITIES_FAILURE",
      "CREATE_ENTITY",
      "UPDATE_ENTITY",
      "DELETE_ENTITY",
      "SELECT_ENTITY",
      "FILTER_ENTITIES",
      "SORT_ENTITIES"
    ],
    "selectors": [
      "getEntityById",
      "getEntitiesByType",
      "getEntitiesByCollection",
      "getFilteredEntities",
      "getSelectedEntity"
    ]
  }
}

# Advanced Logging

Consider implementing a comprehensive event-driven logging system with:

JSON-structured log entries for easy querying
Transaction IDs that flow through all related operations
User context (who, when, where) with IP and device info
Separate operational vs. security logs
Log aggregation for analytics

sample:

{
  "logSchema": {
    "version": "1.0",
    "eventTypes": [
      "ENTITY_CREATE", "ENTITY_UPDATE", "ENTITY_DELETE",
      "COLLECTION_CREATE", "COLLECTION_UPDATE", "COLLECTION_DELETE",
      "WORKFLOW_START", "WORKFLOW_COMPLETE", "WORKFLOW_STAGE_CHANGE",
      "USER_LOGIN", "USER_LOGOUT", "PERMISSION_CHANGE",
      "ZONE_CREATE", "ZONE_UPDATE", "TERRITORY_ASSIGNMENT"
    ],
    "severityLevels": ["INFO", "WARNING", "ERROR", "CRITICAL"],
    "contextFields": ["user_id", "ip_address", "device_type", "location"]
  },
  "sampleLogEntry": {
    "id": "log_uuid_here",
    "timestamp": "2025-04-11T14:22:31.000Z",
    "eventType": "ENTITY_CREATE",
    "severity": "INFO",
    "entityType": "ADDRESS",
    "entityId": "entity_uuid_here",
    "transactionId": "transaction_uuid_here",
    "changes": {
      "street": "123 Main St",
      "city": "Springfield"
    },
    "context": {
      "userId": "user_uuid_here",
      "userName": "john.doe",
      "ipAddress": "192.168.1.1",
      "deviceType": "desktop",
      "deviceId": "device_uuid_here",
      "location": {
        "lat": 37.7749,
        "lng": -122.4194
      }
    },
    "metadata": {
      "collectionId": "collection_uuid_here",
      "zoneId": "zone_uuid_here",
      "tags": ["new_customer", "high_priority"]
    }
  }
}

