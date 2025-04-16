When you create a new entity type, you would need to select which entity it belongs to. 

This creates a clear hierarchical structure in your system.

When creating a new address type like "Corporate Office," you would associate it with the "Address" entity

When creating a new opportunity type like "Roof Replacement," you would associate it with the "Opportunity" entity

Here's how you can structure this in your database:
sqlCREATE TABLE entity_type_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES entities(id),
    entity_type_id UUID NOT NULL REFERENCES entity_types(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(entity_id, entity_type_id)
);
With this table in place, you can:

Define which types are available for which entities
Query available types for a specific entity context
Keep your database structure clean and maintainable

For example, to map the "Commercial" type to both "Address" and "Opportunity" entities:
sqlINSERT INTO entity_type_mappings (entity_id, entity_type_id)
VALUES
  ('address-entity-id', 'commercial-type-id'),
  ('opportunity-entity-id', 'commercial-type-id');
Then when building your UI, you can easily query:
sql-- Get all types available for an Address
SELECT et.*
FROM entity_types et
JOIN entity_type_mappings etm ON et.id = etm.entity_type_id
WHERE etm.entity_id = 'address-entity-id';
This approach gives you exactly what you need - a simple way to define which types can be used with which entities, without any additional complexity.