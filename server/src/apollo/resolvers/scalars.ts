import { GraphQLScalarType, Kind, ValueNode, ObjectValueNode } from 'graphql';

// Interface for GeoJSON type
interface GeoJSON {
  type: string;
  coordinates: number[] | number[][] | number[][][];
}

export const scalarResolvers = {
  UUID: new GraphQLScalarType({
    name: 'UUID',
    description: 'UUID custom scalar type',
    serialize(value: unknown): string {
      return String(value); // Convert outgoing UUID to string
    },
    parseValue(value: unknown): string {
      return String(value); // Convert incoming UUID from client to string
    },
    parseLiteral(ast: ValueNode): string | null {
      if (ast.kind === Kind.STRING) {
        return ast.value; // Convert hard-coded AST string to string
      }
      return null; // Invalid hard-coded value
    },
  }),

  JSONB: new GraphQLScalarType({
    name: 'JSONB',
    description: 'JSONB custom scalar type for PostgreSQL JSONB data',
    serialize(value: unknown): unknown {
      return value; // Convert outgoing JSONB to JSON object
    },
    parseValue(value: unknown): unknown {
      return value; // Convert incoming JSON from client
    },
    parseLiteral(ast: ValueNode): unknown {
      if (ast.kind === Kind.OBJECT) {
        // For object literals, we'd need to recursively build the object
        // but for simplicity we'll just return a placeholder
        return {};
      } else if (ast.kind === Kind.LIST) {
        // For list literals, similar to above
        return [];
      }
      return null; // Invalid hard-coded value
    },
  }),

  Timestamp: new GraphQLScalarType({
    name: 'Timestamp',
    description: 'Timestamp custom scalar type',
    serialize(value: unknown): string {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return String(value);
    },
    parseValue(value: unknown): Date {
      if (typeof value === 'string' || typeof value === 'number') {
        return new Date(value);
      }
      throw new Error('Timestamp scalar parser expected a string or number');
    },
    parseLiteral(ast: ValueNode): Date | null {
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value);
      }
      if (ast.kind === Kind.INT) {
        return new Date(parseInt(ast.value, 10));
      }
      return null;
    },
  }),

  Geography: new GraphQLScalarType({
    name: 'Geography',
    description: 'PostGIS Geography custom scalar type',
    serialize(value: unknown): GeoJSON | unknown {
      // Check if value has coordinates property (GeoJSON structure)
      const geoValue = value as Partial<GeoJSON>;
      if (geoValue && typeof geoValue === 'object' && 'coordinates' in geoValue) {
        return {
          type: geoValue.type || 'Point',
          coordinates: geoValue.coordinates,
        };
      }
      return value;
    },
    parseValue(value: unknown): GeoJSON | unknown {
      // Convert GeoJSON input to PostGIS format
      const geoValue = value as Partial<GeoJSON>;
      if (geoValue && typeof geoValue === 'object' && 'coordinates' in geoValue) {
        return {
          type: geoValue.type || 'Point',
          coordinates: geoValue.coordinates,
        };
      }
      return value;
    },
    parseLiteral(ast: ValueNode): unknown {
      if (ast.kind === Kind.OBJECT) {
        // For object literals, we'd need proper parsing
        // This is simplified and would need a recursive approach
        return {}; 
      }
      return null;
    },
  }),
};