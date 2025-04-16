# enganement functions

## entity cration role assignments

CREATE TABLE entity_creation_role_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Source entity that triggers the role assignment
  source_entity_type VARCHAR(50) NOT NULL,
  
  -- Target entity to receive the role assignment
  target_entity_type VARCHAR(50) NOT NULL,
  
  -- Role to assign
  engagement_role_id UUID NOT NULL REFERENCES engagement_roles(id),
  
  -- Conditions for assignment (optional JSON config)
  assignment_conditions JSONB,
  
  -- Whether to include creator as assignee
  assign_to_creator BOOLEAN DEFAULT true,
  
  -- Whether to copy from parent entity
  inherit_from_parent BOOLEAN DEFAULT false,
  
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

this table will setup how we apply engagements to our entities

functions to run when entities are created that will trigger the assignments

-- Function to evaluate conditions against entity data
CREATE OR REPLACE FUNCTION check_assignment_conditions(entity_data JSONB, conditions TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- If no conditions, always match
  IF conditions IS NULL OR conditions = '{}' THEN
    RETURN TRUE;
  END IF;
  
  -- Convert conditions to SQL expression and evaluate
  EXECUTE format('SELECT %s @> %L', entity_data::text, conditions) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to determine parent entity
CREATE OR REPLACE FUNCTION get_parent_entity(entity_data JSONB, entity_type TEXT)
RETURNS TABLE (parent_id UUID, parent_type VARCHAR) AS $$
BEGIN
  -- Logic to determine parent based on entity type
  IF entity_type = 'collections' THEN
    -- Collections may have contact or address parent
    IF entity_data->>'contact_id' IS NOT NULL THEN
      RETURN QUERY SELECT entity_data->>'contact_id'::uuid, 'contacts'::VARCHAR;
    ELSIF entity_data->>'address_id' IS NOT NULL THEN
      RETURN QUERY SELECT entity_data->>'address_id'::uuid, 'addresses'::VARCHAR;
    END IF;
  ELSIF entity_type = 'opportunities' THEN
    -- Opportunities linked to collections
    IF entity_data->>'collection_id' IS NOT NULL THEN
      RETURN QUERY SELECT entity_data->>'collection_id'::uuid, 'collections'::VARCHAR;
    END IF;
  END IF;
  
  -- No parent found
  RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_entity_role_assignments()
RETURNS TRIGGER AS $$
DECLARE
  mapping RECORD;
  parent_id UUID;
  parent_type VARCHAR(50);
  user_id UUID;
BEGIN
  -- Find applicable mappings
  FOR mapping IN (
    SELECT * FROM entity_creation_role_mappings 
    WHERE source_entity_type = TG_TABLE_NAME
    AND is_active = true
    ORDER BY display_order
  ) LOOP
    -- Check if conditions match (custom function)
    IF check_assignment_conditions(NEW, mapping.assignment_conditions::text) THEN
      
      -- Direct assignment to creator
      IF mapping.assign_to_creator AND NEW.created_by IS NOT NULL AND mapping.engagement_role_id IS NOT NULL THEN
        INSERT INTO user_engagement_role_assignments (
          user_id, 
          engagement_role_id,
          entity_id, 
          entity_type_name
        ) VALUES (
          NEW.created_by, 
          mapping.engagement_role_id,
          NEW.id,
          mapping.target_entity_type
        );
      END IF;
      
      -- Inheritance from parent
      IF mapping.inherit_from_parent THEN
        -- Determine parent entity (depends on entity relationships)
        SELECT get_parent_entity(NEW, TG_TABLE_NAME) INTO parent_id, parent_type;
        
        IF parent_id IS NOT NULL THEN
          -- Copy role assignments from parent
          INSERT INTO user_engagement_role_assignments (
            user_id,
            engagement_role_id,
            entity_id,
            entity_type_name
          )
          SELECT 
            uera.user_id,
            uera.engagement_role_id,
            NEW.id,
            mapping.target_entity_type
          FROM 
            user_engagement_role_assignments uera
          WHERE 
            uera.entity_id = parent_id
            AND uera.entity_type_name = parent_type;
        END IF;
      END IF;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Example for addresses table
CREATE TRIGGER address_role_assignment_trigger
AFTER INSERT ON addresses
FOR EACH ROW
EXECUTE FUNCTION process_entity_role_assignments();

-- Example for contacts table
CREATE TRIGGER contact_role_assignment_trigger
AFTER INSERT ON contacts
FOR EACH ROW
EXECUTE FUNCTION process_entity_role_assignments();

-- Add similar triggers for other entity tables.
