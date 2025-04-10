# settings

Here's some additional documentation to help frontend developers understand the event/notification/settings architecture:
Frontend Development Guide: Events, Notifications & Settings
Core Components and Relationships

Entity Framework

Entities are the foundation of our system (addresses, contacts, etc.)
Each entity belongs to an entity_type
Entity settings allow for customization at type or instance level

Events System

Events are actions/changes that happen to entities
Events can require approval based on entity_event_types configuration
Zone events provide geographical/organizational context

Notifications System

Notifications inform users about relevant events
They can be scheduled, snoozed, and expired
Linked to users, entities, and zones

Working with Entity Settings
Entity settings use a flexible JSONB structure that allows for UI customization:
javascript// Example of retrieving entity settings
async function getEntitySettings(entityTypeId, entityId, settingKey) {
const response = await api.get(`/entity-settings`, {
params: { entityTypeId, entityId, settingKey }
});

// This will include fallback to type-level settings if entity-specific not found
return response.data;
}

// Example of entity display settings structure
const displaySettings = {
ui: {
card: {
backgroundColor: "#f8f9fa",
borderRadius: "4px",
titleFont: "Roboto"
},
list: {
rowHeight: "48px",
alternateRowColor: "#f1f3f5"
}
}
};
Approval Workflows
Events requiring approval follow this process:

Event creation triggers approval requests based on entity_event_types
Appropriate users (based on approver_roles) receive notifications
Approval actions update entity_event_approvals
Original requestor is notified of approval/rejection

Frontend components should:

Check event.needs_approval before allowing actions
Display appropriate UI for pending approvals
Show approval status on events
Allow approvers to approve/reject with comments

Notification Management
Notifications support these user interactions:

Reading: Mark as read/unread
Dismissing: Remove from active notifications
Snoozing: Temporarily hide until a later time
Filtering: By entity, zone, type, or status

The notification center should:

Show notifications sorted by priority and timestamp
Support bulk actions (mark all as read)
Display context (related entity, event type)
Allow navigation to the related record

Zones Integration
Zones provide geographical/organizational context:

Zone-specific events and settings
Entity-zone relationships via entity_zones
Zone-based notifications and approvals

Frontend should leverage zones for:

Filtering data by organizational boundaries
Context-aware notifications
Role-based access within geographical areas

Inheritance and Defaults
The system uses a hierarchical approach:

System defaults
Entity type settings
Specific entity settings
User preferences (where applicable)

Frontend components should respect this hierarchy and display appropriate default values when specific settings aren't available.
This documentation should provide frontend developers with the necessary understanding of how these interconnected systems work together and how to implement the UI components that interact with them.

I'll create the entity_settings table and help structure it for optimal usability.
sqlCREATE TABLE entity_settings (
id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
entity_type_id uuid NOT NULL,
entity_id varchar(50),
setting_key varchar(100) NOT NULL,
setting_value jsonb NOT NULL,
children_settings jsonb,
created_at timestamptz DEFAULT now(),
updated_at timestamptz DEFAULT now(),
FOREIGN KEY (entity_type_id) REFERENCES entity_types(id),
UNIQUE (entity_type_id, entity_id, setting_key)
);

CREATE INDEX idx_entity_settings_entity_type ON entity_settings(entity_type_id);
CREATE INDEX idx_entity_settings_entity_id ON entity_settings(entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX idx_entity_settings_key ON entity_settings(setting_key);
This design:

Makes entity_type_id required - Always links to an entity type for context
Makes entity_id optional - Allows settings at both type level and instance level
Includes the jsonb fields - For flexible settings storage
Has appropriate indexes - For performance on common queries

Regarding your questions:
Using entity_type_id as FK:
Yes, having the entity_type_id as a foreign key is beneficial as it:

Ensures data integrity (only valid entity types)
Makes it easier for the UI to filter and group settings
Supports hierarchical inheritance of settings

Easiest way to manipulate the data:
For the simplest developer experience, I recommend creating helper functions:
sql-- Function to get a setting (with fallback to type-level if entity-specific not found)
CREATE OR REPLACE FUNCTION get_entity_setting(
p_entity_type_id uuid,
p_entity_id varchar,
p_setting_key varchar,
p_default_value jsonb DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
v_result jsonb;
BEGIN
-- Try entity-specific setting
IF p_entity_id IS NOT NULL THEN
SELECT setting_value INTO v_result
FROM entity_settings
WHERE entity_type_id = p_entity_type_id
AND entity_id = p_entity_id
AND setting_key = p_setting_key;

        IF v_result IS NOT NULL THEN
            RETURN v_result;
        END IF;
    END IF;

    -- Try type-level setting
    SELECT setting_value INTO v_result
    FROM entity_settings
    WHERE entity_type_id = p_entity_type_id
    AND entity_id IS NULL
    AND setting_key = p_setting_key;

    -- Return result or default
    RETURN COALESCE(v_result, p_default_value);

END;

$$
LANGUAGE plpgsql;

-- Function to set a setting
CREATE OR REPLACE FUNCTION set_entity_setting(
    p_entity_type_id uuid,
    p_entity_id varchar,
    p_setting_key varchar,
    p_setting_value jsonb
) RETURNS void AS
$$

BEGIN
INSERT INTO entity_settings (
entity_type_id,
entity_id,
setting_key,
setting_value
) VALUES (
p_entity_type_id,
p_entity_id,
p_setting_key,
p_setting_value
)
ON CONFLICT (entity_type_id, entity_id, setting_key)
DO UPDATE SET
setting_value = p_setting_value,
updated_at = now();
END;

$$
LANGUAGE plpgsql;
With these functions, your application logic becomes much simpler:
sql-- Set a setting
SELECT set_entity_setting(
    '123e4567-e89b-12d3-a456-426614174000', -- entity_type_id
    '789', -- entity_id (or NULL for type-level)
    'display_settings',
    '{"theme":"dark","fontSize":14}'::jsonb
);

-- Get a setting (with fallback)
SELECT get_entity_setting(
    '123e4567-e89b-12d3-a456-426614174000', -- entity_type_id
    '789', -- entity_id
    'display_settings',
    '{"theme":"light","fontSize":12}'::jsonb -- default if not found
);
This approach makes working with the settings table straightforward while still providing the flexibility of the JSONB storage format.
$$
