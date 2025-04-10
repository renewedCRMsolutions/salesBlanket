# Filter Tables in the Database

Filter Tables Implementation
Filter tables can serve multiple purposes in your application:

Saved Filters

sqlCREATE TABLE saved_filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type_id UUID REFERENCES entity_types(id),
    filter_definition JSONB NOT NULL, -- Store filter criteria
    is_global BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- User's favorite/recent filters
CREATE TABLE user_filters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    filter_id UUID REFERENCES saved_filters(id),
    is_favorite BOOLEAN DEFAULT FALSE,
    last_used TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

Dynamic Filter Definitions

sqlCREATE TABLE filter_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type_id UUID REFERENCES entity_types(id),
    field_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    field_type VARCHAR(50) NOT NULL, -- text, number, date, boolean, etc.
    is_filterable BOOLEAN DEFAULT TRUE,
    is_searchable BOOLEAN DEFAULT TRUE,
    filter_operators JSONB, -- available operators for this field
    default_operator VARCHAR(50),
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

Collections with Filters

sqlALTER TABLE collections ADD COLUMN filter_criteria JSONB;
Benefits of Filter Tables

Persistent Filters: Users can save and reuse complex queries
Dynamic UI Generation: Your application can use filter_fields to build dynamic filter interfaces
Filter Sharing: Team members can share useful filters
Smart Collections: Collections can be either manually curated or dynamically populated based on filter criteria

Example Usage
Creating a dynamic collection based on filters:
sqlINSERT INTO collections (name, status, filter_criteria)
VALUES (
    'High-Value Opportunities in Springfield',
    'ACTIVE',
    '{
        "entity_type": "opportunity",
        "conditions": [
            {"field": "amount", "operator": ">=", "value": 10000},
            {"field": "address.city", "operator": "=", "value": "Springfield"},
            {"field": "status", "operator": "=", "value": "ACTIVE"}
        ],
        "sort": [
            {"field": "amount", "direction": "DESC"},
            {"field": "created_at", "direction": "DESC"}
        ]
    }'::jsonb
);
Using the filter in your application:
Your application could then either:

Run this filter as a query to dynamically show matching entities
Use a scheduled job to periodically populate the collection with matching entities

Integration with Collections Model
The filters concept works very well with your collections model:

Manual Collections: Created by users who explicitly add addresses, contacts, and opportunities
Dynamic Collections: Created by defining filter criteria that automatically include matching entities
Hybrid Collections: Start with filter criteria but allow manual additions/removals

This gives your users flexibility in how they organize their data while maintaining the central collection concept.
What do you think about this approach? Would filter tables be useful for your specific application needs?