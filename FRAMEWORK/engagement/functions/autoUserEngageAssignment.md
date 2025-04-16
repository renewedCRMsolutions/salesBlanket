# assign users when entities are created

-- Modify the trigger function to include default user assignments
CREATE OR REPLACE FUNCTION process_entity_role_assignments()
RETURNS TRIGGER AS $$
DECLARE
  mapping RECORD;
  default_assignment RECORD;
BEGIN
  -- Process role mappings as before
  -- ...
  
  -- Now add default user assignments based on rules
  FOR default_assignment IN (
    SELECT drua.user_id, drua.engagement_role_id
    FROM default_role_user_assignments drua
    WHERE drua.entity_type = TG_TABLE_NAME
    AND drua.is_active = true
    AND (
      drua.assignment_criteria IS NULL 
      OR check_assignment_conditions(row_to_json(NEW)::jsonb, drua.assignment_criteria::text)
    )
  ) LOOP
    -- Assign the user to this role on the new entity
    INSERT INTO user_engagement_role_assignments (
      user_id,
      engagement_role_id,
      entity_id,
      entity_type_name
    ) VALUES (
      default_assignment.user_id,
      default_assignment.engagement_role_id,
      NEW.id,
      TG_TABLE_NAME
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

example triggers

-- For addresses table
CREATE TRIGGER address_engagement_assignments
AFTER INSERT ON addresses
FOR EACH ROW
EXECUTE FUNCTION process_entity_role_assignments();

-- For contacts table
CREATE TRIGGER contact_engagement_assignments
AFTER INSERT ON contacts
FOR EACH ROW
EXECUTE FUNCTION process_entity_role_assignments();

-- Similar triggers for collections, opportunities, etc.
CREATE TRIGGER collection_engagement_assignments
AFTER INSERT ON collections
FOR EACH ROW
EXECUTE FUNCTION process_entity_role_assignments();

CREATE TRIGGER opportunity_engagement_assignments
AFTER INSERT ON opportunities
FOR EACH ROW
EXECUTE FUNCTION process_entity_role_assignments();