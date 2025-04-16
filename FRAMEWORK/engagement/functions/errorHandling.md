-- Add error handling to the process_entity_role_assignments function
CREATE OR REPLACE FUNCTION process_entity_role_assignments()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate inputs
  IF TG_TABLE_NAME IS NULL THEN
    RAISE EXCEPTION 'Table name cannot be null';
  END IF;
  
  -- Existing function logic with additional error handling
  -- ...
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    INSERT INTO error_logs (error_type, error_message, context_data)
    VALUES ('TRIGGER_ERROR', SQLERRM, jsonb_build_object(
      'table_name', TG_TABLE_NAME,
      'entity_id', NEW.id,
      'function', 'process_entity_role_assignments'
    ));
    
    -- Re-raise the exception or handle it as needed
    RAISE;
END;
$$ LANGUAGE plpgsql;