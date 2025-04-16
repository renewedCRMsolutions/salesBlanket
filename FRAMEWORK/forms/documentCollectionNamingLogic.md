# generate collection name

CREATE OR REPLACE FUNCTION generate_collection_name()
RETURNS TRIGGER AS $$
DECLARE
  address_street TEXT;
  contact_lastname TEXT;
  priority_address_id UUID;
  priority_contact_id UUID;
BEGIN
  -- Find the highest priority address for this collection
  SELECT a.id, a.street INTO priority_address_id, address_street
  FROM addresses a
  JOIN address_types at ON a.address_type_id = at.id
  WHERE a.collection_id = NEW.id
  ORDER BY CASE 
    WHEN at.id = 'a3f3b9fd-3a1f-49ed-8262-71248aa1613c' THEN 1  -- Main Address
    WHEN at.id = '6c98c361-5270-47f2-b814-57a36f9bf128' THEN 2  -- Mailing Address
    WHEN at.id = '49619359-fbb8-43f5-ba67-2adf280182ff' THEN 3  -- Production
    WHEN at.id = '17e06229-07c6-44a7-ba05-9fa9dc9f40d8' THEN 4  -- Billing Address
    WHEN at.id = 'a8dddda0-c9fd-4a5c-8c11-ab54e263a9df' THEN 5  -- Property Condition Report
    ELSE 999
  END
  LIMIT 1;
  
  -- Find the decision maker contact for this collection
  SELECT c.id, c.last_name INTO priority_contact_id, contact_lastname
  FROM contacts c
  JOIN contact_types ct ON c.contact_type_id = ct.id
  WHERE c.collection_id = NEW.id
  ORDER BY CASE
    WHEN ct.id = '31eae4c9-3dfa-420e-9c06-0bcb5ec2ab3b' THEN 1  -- Homeowner
    WHEN ct.id = '62874424-37e3-47bd-9083-64a5f515037d' THEN 2  -- Property Manager
    ELSE 999
  END
  LIMIT 1;
  
  -- Construct collection name
  IF address_street IS NOT NULL AND contact_lastname IS NOT NULL THEN
    NEW.name := address_street || ' - ' || contact_lastname;
  ELSIF address_street IS NOT NULL THEN
    NEW.name := address_street;
  ELSIF contact_lastname IS NOT NULL THEN
    NEW.name := contact_lastname;
  ELSE
    NEW.name := 'New Collection ' || NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-name collections
CREATE TRIGGER collection_name_generator
BEFORE INSERT ON collections
FOR EACH ROW
WHEN (NEW.name IS NULL OR NEW.name = '')
EXECUTE FUNCTION generate_collection_name();

-- Trigger to update collection name when addresses/contacts are added
CREATE TRIGGER collection_name_updater
AFTER INSERT OR UPDATE ON address_contacts
FOR EACH ROW
EXECUTE FUNCTION update_collection_name();
You'll also need a function to update collection names when a new address or contact is added to an existing collection:
sqlCREATE OR REPLACE FUNCTION update_collection_name()
RETURNS TRIGGER AS $$
DECLARE
  coll_id UUID;
BEGIN
  -- Get the collection ID
  IF NEW.address_id IS NOT NULL THEN
    SELECT collection_id INTO coll_id FROM addresses WHERE id = NEW.address_id;
  ELSIF NEW.contact_id IS NOT NULL THEN
    SELECT collection_id INTO coll_id FROM contacts WHERE id = NEW.contact_id;
  END IF;
  
  -- If collection exists, update its name
  IF coll_id IS NOT NULL THEN
    UPDATE collections 
    SET name = NULL, 
        updated_at = NOW()
    WHERE id = coll_id;
    
    -- The collection_name_generator trigger will handle the naming
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

This approach ensures:

Collections are automatically named using the highest priority address and contact
The name updates if new addresses or contacts are added
The system follows your business rules about which contacts are decision makers
Your collection naming follows a consistent pattern of "Street - Last Name"

Would you like me to adjust any part of this logic to better match your business requirements?