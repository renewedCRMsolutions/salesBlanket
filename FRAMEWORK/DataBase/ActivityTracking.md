# Tracking system implementation

Activity Tracking
Let's implement a trigger-based approach for automatic tracking:
sql-- Example trigger for entity changes
CREATE OR REPLACE FUNCTION track_entity_change()
RETURNS TRIGGER AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Get current user from application context
    user_id := current_setting('app.current_user_id', true)::uuid;
    
    -- Log to entity_events
    INSERT INTO entity_events (
        entity_id, 
        entity_type_id,
        entity_event_type,
        action,
        performed_by,
        previous_state,
        new_state,
        change_summary
    ) VALUES (
        NEW.id,
        NEW.entity_type_id,
        'ENTITY_CHANGE',
        TG_OP,
        user_id,
        CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        row_to_json(NEW),
        'Entity ' || TG_OP || ' operation'
    );
    
    -- Also log to activity_log (for system-wide tracking)
    INSERT INTO activity_log (
        user_id,
        entity_id,
        entity_type,
        action,
        meta
    ) VALUES (
        user_id,
        NEW.id,
        'ENTITY',
        TG_OP,
        jsonb_build_object(
            'entity_type_id', NEW.entity_type_id,
            'details', row_to_json(NEW)
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to entities table
CREATE TRIGGER entity_change_tracker
AFTER INSERT OR UPDATE OR DELETE ON entities
FOR EACH ROW EXECUTE FUNCTION track_entity_change();
Then create similar triggers for specialized entity tables.
Performance Optimization
For high-volume tracking tables, implement partitioning:
sql-- Convert activity_log to partitioned table
CREATE TABLE activity_log_partitioned (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    entity_id UUID,
    entity_type VARCHAR(100),
    action VARCHAR(100),
    occurred_at TIMESTAMPTZ DEFAULT now(),
    ip_address VARCHAR(50),
    user_agent TEXT,
    device JSONB,
    geo JSONB,
    meta JSONB
) PARTITION BY RANGE (occurred_at);

-- Create monthly partitions
CREATE TABLE activity_log_y2025m01 PARTITION OF activity_log_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE activity_log_y2025m02 PARTITION OF activity_log_partitioned
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
-- And so on...
3. Event-Driven Architecture
Implement a centralized event system to ensure consistent propagation:
sql-- Event queue table
CREATE TABLE event_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ,
    error_message TEXT
);

-- Create index for processing
CREATE INDEX idx_event_queue_status ON event_queue(status, created_at);
This table would be used by your application to process events asynchronously, ensuring data consistency across tables.
4. Data Flow Optimization Rules
Rule 1: Single Source of Truth
Each piece of data should be stored definitively in only one place:

Entity core data in entities
Type-specific details in specific tables
Relational data in junction tables
Historical data in tracking tables

Rule 2: Denormalize Strategically
For frequently accessed data combinations:
sql-- Example view for contact management
CREATE MATERIALIZED VIEW contact_management_view AS
SELECT 
    e.id AS entity_id, 
    e.status AS entity_status,
    c.id AS contact_id,
    c.first_name,
    c.last_name,
    c.email,
    a.id AS address_id,
    a.street,
    a.city,
    a.state,
    a.postal_code,
    COUNT(DISTINCT t.id) AS touchpoint_count,
    MAX(t.created_at) AS last_touchpoint_date
FROM entities e
JOIN contacts c ON c.id = e.id
LEFT JOIN address_contacts ac ON ac.contact_id = c.id
LEFT JOIN addresses a ON a.id = ac.address_id
LEFT JOIN entity_touchpoints t ON t.entity_id = e.id
WHERE e.entity_type_id = (SELECT id FROM entity_types WHERE display_name = 'Contact')
GROUP BY e.id, e.status, c.id, c.first_name, c.last_name, c.email, a.id, a.street, a.city, a.state, a.postal_code;

-- Create index for search
CREATE INDEX idx_contact_management_view_name ON contact_management_view(first_name, last_name);
CREATE INDEX idx_contact_management_view_email ON contact_management_view(email);
Refresh this view on a schedule to keep it current while reducing query complexity.
Rule 3: Implement Retention Policies
Define automated cleanup for tracking data:
sql-- Example function to archive old tracking data
CREATE OR REPLACE FUNCTION archive_old_activity_logs()
RETURNS void AS $$
BEGIN
    -- Move logs older than 3 months to archive
    INSERT INTO activity_log_archive
    SELECT * FROM activity_log
    WHERE occurred_at < (CURRENT_DATE - INTERVAL '3 months');
    
    -- Delete from main table
    DELETE FROM activity_log
    WHERE occurred_at < (CURRENT_DATE - INTERVAL '3 months');
END;
$$ LANGUAGE plpgsql;
Run this on a schedule to maintain performance.
5. Transaction Management
Ensure data integrity with proper transaction handling:
sql-- Example transaction for creating a new contact with address
BEGIN;

-- Create base entity
INSERT INTO entities (entity_type_id, status)
VALUES ((SELECT id FROM entity_types WHERE display_name = 'Contact'), 'ACTIVE')
RETURNING id INTO contact_entity_id;

-- Create contact record
INSERT INTO contacts (id, first_name, last_name, email)
VALUES (contact_entity_id, 'John', 'Doe', 'john@example.com');

-- Create address entity if needed
INSERT INTO entities (entity_type_id, status)
VALUES ((SELECT id FROM entity_types WHERE display_name = 'Address'), 'ACTIVE')
RETURNING id INTO address_entity_id;

-- Create address record
INSERT INTO addresses (id, street, city, state, postal_code)
VALUES (address_entity_id, '123 Main St', 'Springfield', 'IL', '62701');

-- Link contact to address
INSERT INTO address_contacts (address_id, contact_id)
VALUES (address_entity_id, contact_entity_id);

COMMIT;
6. Implementation Plan

Database Function Layer
Create a set of database functions that handle common propagation patterns:

fn_create_entity(entity_type_id UUID, specific_data JSONB)
fn_update_entity(entity_id UUID, specific_data JSONB)
fn_link_entities(entity1_id UUID, entity2_id UUID, relationship_type VARCHAR)


Tracking Automation
Implement triggers on all core tables to update tracking tables automatically.
Materialized View Strategy
Create materialized views for commonly accessed data combinations:

Contact management view
Sales opportunity view
Territory management view


Partitioning Implementation
Convert high-volume tables to partitioned tables and set up automation to create new partitions.
Archiving Strategy
Develop procedures to archive old tracking data to maintain performance.