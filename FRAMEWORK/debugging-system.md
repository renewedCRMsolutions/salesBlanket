# SalesBlanket v4 Debugging System

## Overview

The SalesBlanket v4 debugging system provides comprehensive tools and practices for monitoring, troubleshooting, and optimizing the GraphQL API and React frontend application.

## GraphQL Debugging Tools

### Apollo Studio Explorer

Apollo Studio Explorer is our primary tool for debugging GraphQL operations:

- **URL**: https://studio.apollographql.com/
- **Features**:
  - Interactive query builder
  - Response inspector
  - Schema explorer
  - Operation tracing
  - Query performance metrics

### Local Development Tools

For local development, we use:

1. **GraphQL Playground**: Available at http://localhost:4000/graphql when the server is running
2. **Apollo Client DevTools**: Chrome extension for debugging client-side GraphQL operations

## Logging System

### Server-Side Logging

We use a structured logging system with the following levels:

- **ERROR**: Application errors that require immediate attention
- **WARN**: Potentially harmful situations that don't prevent the application from working
- **INFO**: General operational information
- **DEBUG**: Detailed information for debugging

Example log output:
```json
{
  "level": "info",
  "message": "GraphQL query executed",
  "timestamp": "2023-10-15T14:32:45.123Z",
  "operation": "getEntities",
  "executionTime": 125,
  "userId": "d8f3b1e9-8c9a-4f1d-b6e7-7a8b9c0d1e2f"
}
```

### Client-Side Logging

The React client uses:
- Console logging for development
- Error boundary components to capture and report UI errors
- Integration with the server-side logging system for production environments

## Performance Monitoring

### Apollo Tracing

Apollo Tracing is enabled in both development and production environments to capture:

- Query execution time
- Resolver timing
- Database operation timing

### Database Query Monitoring

We monitor database performance through:

- Query execution plans
- Slow query logs
- Connection pool metrics
- PostGIS spatial query optimization

## Error Handling Strategy

1. **GraphQL Errors**: Custom error codes and messages that provide meaningful feedback to clients
2. **Database Errors**: Mapped to appropriate GraphQL errors with sanitized messages
3. **Validation Errors**: Structured format for input validation errors
4. **Network Errors**: Graceful handling with retry mechanisms

## Debugging Geographic Data

For the Google Zones integration, we provide specialized debugging tools:

1. **Zone Visualizer**: Web-based tool to visualize zone boundaries
2. **Geocoding Debugger**: Tool to test address geocoding
3. **Spatial Query Analyzer**: Helps optimize geographic queries

## Development Workflow

When debugging issues:

1. Check server logs for errors or warnings
2. Use Apollo Studio to inspect the query and response
3. Verify database operations using database monitoring tools
4. Test affected functionality in isolation
5. Document the issue and solution for future reference

## Integration with External Tools

The debugging system integrates with:

- **Sentry**: For error tracking and monitoring
- **Prometheus**: For metrics collection
- **Grafana**: For visualization and alerting
- **Datadog**: For APM and infrastructure monitoring

## Adding Custom Debug Information

Developers can add custom debug information by:

```typescript
import { logger } from '../utils/logger';

// Add debug information
logger.debug('Processing entity data', {
  entityId: entity.id,
  operation: 'updateEntity',
  contextData: {
    zoneChanges: changedZones.map(z => z.id),
    updatedFields: Object.keys(updates)
  }
});
```

## Google Zones Debugging

For Google Zones integration issues:

1. Verify API credentials and quotas
2. Check Places API response codes
3. Validate geographic data format and coordinate systems
4. Test boundary intersection logic
5. Monitor API usage metrics