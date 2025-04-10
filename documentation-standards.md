# SalesBlanket v4 Documentation Standards

## Overview

This document outlines the documentation standards for the SalesBlanket v4 project. Consistent documentation is essential for maintainability, onboarding new developers, and ensuring the long-term success of the project.

## Documentation Types

### 1. Code Documentation

#### TypeScript/JavaScript

- Use JSDoc for documenting functions, classes, and interfaces
- Include descriptions, parameter types, return types, and examples
- Document complex algorithms with step-by-step explanations

Example:

```typescript
/**
 * Finds zones that intersect with a given boundary
 * 
 * @param boundary - GeoJSON polygon representing the boundary to check
 * @param options - Search options
 * @param options.maxResults - Maximum number of results to return (default: 10)
 * @param options.zoneTypeIds - Optional array of zone type IDs to filter by
 * @returns Promise resolving to an array of matching zones
 * 
 * @example
 * // Find neighborhoods intersecting a sales territory
 * const neighborhoods = await findIntersectingZones(
 *   salesTerritory.boundary,
 *   { zoneTypeIds: [neighborhoodTypeId] }
 * );
 */
async function findIntersectingZones(
  boundary: GeoJSON.Polygon,
  options: FindZonesOptions = {}
): Promise<Zone[]> {
  // Implementation
}
```

#### GraphQL Schema

- All types, fields, queries, and mutations must have descriptions
- Document required fields, field types, and any constraints
- Include examples for complex input types

Example:

```graphql
"""
A geographic zone with boundary information
"""
type Zone {
  """
  Unique identifier for the zone
  """
  id: UUID!
  
  """
  User-friendly name of the zone
  """
  name: String!
  
  """
  The type of zone (e.g., country, state, city, neighborhood)
  """
  zoneType: ZoneType!
  
  """
  Geographic boundary as a PostGIS polygon
  """
  boundary: Geography
}
```

### 2. API Documentation

- Document all GraphQL queries and mutations
- Include example requests and responses
- Document authentication requirements
- Specify error handling behavior

Example:

```markdown
## Get Zone Details

Retrieves detailed information about a specific zone.

### Query

```graphql
query GetZone($id: UUID!) {
  zone(id: $id) {
    id
    name
    description
    boundary
    zoneType {
      id
      name
    }
    parentZone {
      id
      name
    }
    childZones {
      id
      name
    }
  }
}
```

### Variables

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Response

```json
{
  "data": {
    "zone": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Downtown",
      "description": "Downtown business district",
      "boundary": { /* GeoJSON Polygon */ },
      "zoneType": {
        "id": "987e6543-e21b-43d3-b654-321614174000",
        "name": "Neighborhood"
      },
      "parentZone": {
        "id": "456e7890-e12b-34d3-c456-789614174000",
        "name": "Central City"
      },
      "childZones": []
    }
  }
}
```

### Authentication

Requires a valid JWT token with read permissions for zones.

### Errors

| Code | Description |
|------|-------------|
| 401 | Unauthorized - Invalid or missing token |
| 404 | Zone not found |
```

### 3. Architecture Documentation

- Document high-level system architecture
- Include diagrams (component, sequence, entity-relationship)
- Explain design decisions and trade-offs
- Update when significant architectural changes occur

Example:

```markdown
# Zone System Architecture

## Overview

The Zone System is responsible for managing geographic boundaries in SalesBlanket. It integrates with Google Places API for retrieving administrative boundaries and supports custom user-defined sales territories.

## Components

1. **ZoneService**: Core service for CRUD operations on zones
2. **GoogleZonesService**: Integration with Google Places API
3. **ZoneResolvers**: GraphQL resolvers for zone-related queries and mutations
4. **ZoneBoundaryCache**: In-memory cache of frequently accessed zone boundaries

## Data Flow

1. When a user requests zone data, the request is processed through the ZoneResolvers
2. ZoneResolvers delegate to ZoneService for business logic
3. ZoneService may retrieve data from the database or from GoogleZonesService
4. ZoneBoundaryCache is used to optimize performance for frequently accessed zones

## Design Decisions

### PostGIS for Spatial Data

We chose PostGIS for storing spatial data because:
- Native support for spatial indexing
- Efficient spatial queries (contains, intersects, etc.)
- Built-in functions for geometric operations

### Zone Hierarchy

Zones are organized in a hierarchical structure:
- Countries
- States/Provinces
- Cities
- Neighborhoods
- Custom territories

This hierarchy allows for efficient queries and respects administrative boundaries.
```

### 4. How-To Guides

- Step-by-step instructions for common tasks
- Include code examples and expected outcomes
- Cover both development and operational tasks

Example:

```markdown
# How to Create a Custom Sales Territory

This guide explains how to create a custom sales territory zone in SalesBlanket.

## Prerequisites

- Admin or manager permissions
- Access to the map view

## Steps

1. **Navigate to Zone Management**

   Go to Settings > Zones > Manage Zones

2. **Create New Zone**

   Click the "Create Zone" button in the top right corner

3. **Set Zone Properties**

   Fill in the following details:
   - Name: Enter a descriptive name (e.g., "Northeast Region")
   - Zone Type: Select "Sales Territory" from the dropdown
   - Parent Zone: (Optional) Select a parent zone if this is a sub-territory
   - Color: Choose a color for display on the map

4. **Draw Boundary**

   Use the drawing tools to define the territory boundary:
   - Click the "Draw" button
   - Click on the map to create boundary points
   - Complete the polygon by clicking on the first point
   - Use the "Edit" tool to refine the boundary if needed

5. **Save Zone**

   Click the "Save" button to create the zone

## Result

The new sales territory will appear on the map and be available for assignment to users.

## Troubleshooting

- **Error: "Boundary is too complex"** - Simplify the boundary by using fewer points
- **Error: "Boundary overlaps restricted zone"** - Adjust the boundary to avoid overlap with restricted zones
```

## Documentation Maintenance

### Review Process

1. Documentation changes should be reviewed alongside code changes
2. Technical accuracy should be verified by domain experts
3. Documentation PRs should include screenshots or diagrams where applicable

### Version Control

1. Documentation should be stored in the same repository as code
2. Major documentation files should be in Markdown format
3. Keep a change log for significant documentation updates

### Accessibility

1. Use clear, concise language
2. Avoid jargon where possible, or explain terms when first used
3. Organize documentation with clear headings and structure
4. Include a table of contents for longer documents

## Tools and Resources

### Recommended Documentation Tools

- **Diagrams**: Mermaid, Draw.io, Lucidchart
- **API Documentation**: GraphQL Playground, Apollo Studio
- **Code Documentation**: JSDoc, TypeDoc
- **Knowledge Base**: GitHub Wiki or dedicated documentation site

### Templates

Standard templates for different documentation types are available in the `/docs/templates` directory:
- Architecture Document Template
- How-To Guide Template
- API Endpoint Documentation Template