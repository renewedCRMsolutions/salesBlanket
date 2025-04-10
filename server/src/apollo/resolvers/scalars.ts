import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

// UUID Scalar
const UUIDScalar = new GraphQLScalarType({
  name: 'UUID',
  description: 'UUID custom scalar type',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    // Check if it's a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (typeof value === 'string' && uuidRegex.test(value)) {
      return value;
    }
    throw new Error('Invalid UUID format');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(ast.value)) {
        return ast.value;
      }
    }
    throw new Error('Invalid UUID format');
  },
});

// Timestamp Scalar
const TimestampScalar = new GraphQLScalarType({
  name: 'Timestamp',
  description: 'Timestamp custom scalar type',
  serialize(value) {
    return value instanceof Date ? value.toISOString() : value;
  },
  parseValue(value) {
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Date(ast.kind === Kind.INT ? parseInt(ast.value, 10) : ast.value);
    }
    throw new Error('Invalid timestamp');
  },
});

// Date Scalar
const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type (YYYY-MM-DD)',
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return value;
  },
  parseValue(value) {
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    throw new Error('Invalid date');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    throw new Error('Invalid date');
  },
});

// Geography Scalar
const GeographyScalar = new GraphQLScalarType({
  name: 'Geography',
  description: 'PostGIS Geography custom scalar type',
  serialize(value) {
    // Convert from database representation to GeoJSON
    return value;
  },
  parseValue(value) {
    // Convert from GeoJSON to database representation
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      try {
        return JSON.parse(ast.value);
      } catch (error) {
        throw new Error('Invalid Geography value');
      }
    }
    throw new Error('Invalid Geography value');
  },
});

// Geometry Scalar
const GeometryScalar = new GraphQLScalarType({
  name: 'Geometry',
  description: 'PostGIS Geometry custom scalar type',
  serialize(value) {
    // Convert from database representation to GeoJSON
    return value;
  },
  parseValue(value) {
    // Convert from GeoJSON to database representation
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      try {
        return JSON.parse(ast.value);
      } catch (error) {
        throw new Error('Invalid Geometry value');
      }
    }
    throw new Error('Invalid Geometry value');
  },
});

// JSON Scalar
const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
        try {
          return JSON.parse(ast.value);
        } catch (err) {
          return ast.value;
        }
      case Kind.OBJECT:
        return parseObject(ast);
      case Kind.INT:
        return parseInt(ast.value, 10);
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.BOOLEAN:
        return ast.value === 'true';
      case Kind.NULL:
        return null;
      case Kind.LIST:
        return ast.values.map(parseAst);
      default:
        throw new Error(`Unexpected kind in parseLiteral: ${ast.kind}`);
    }
  },
});

// JSONB Scalar
const JSONBScalar = new GraphQLScalarType({
  name: 'JSONB',
  description: 'JSONB custom scalar type',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      try {
        return JSON.parse(ast.value);
      } catch (error) {
        throw new Error('Invalid JSONB value');
      }
    }
    throw new Error('Invalid JSONB value');
  },
});

// Helper function for JSON scalar
function parseObject(ast) {
  const value = Object.create(null);
  ast.fields.forEach(field => {
    value[field.name.value] = parseAst(field.value);
  });

  return value;
}

function parseAst(ast) {
  switch (ast.kind) {
    case Kind.STRING:
      return ast.value;
    case Kind.INT:
      return parseInt(ast.value, 10);
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.BOOLEAN:
      return ast.value === 'true';
    case Kind.NULL:
      return null;
    case Kind.LIST:
      return ast.values.map(parseAst);
    case Kind.OBJECT:
      return parseObject(ast);
    default:
      throw new Error(`Unexpected kind in parseAst: ${ast.kind}`);
  }
}

// Export scalar resolvers
export const scalarResolvers = {
  UUID: UUIDScalar,
  Timestamp: TimestampScalar,
  Date: DateScalar,
  Geography: GeographyScalar,
  Geometry: GeometryScalar,
  JSON: JSONScalar,
  JSONB: JSONBScalar,
};