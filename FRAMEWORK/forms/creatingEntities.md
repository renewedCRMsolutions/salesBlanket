# Transaction Management 

BEGIN;
  -- Create address
  INSERT INTO addresses (...) VALUES (...) RETURNING id INTO new_address_id;
  
  -- Create contact
  INSERT INTO contacts (...) VALUES (...) RETURNING id INTO new_contact_id;
  
  -- Link contact and address
  INSERT INTO address_contacts (...) VALUES (...);
  
  -- Create collection
  INSERT INTO collections (...) VALUES (...) RETURNING id INTO new_collection_id;
  
  -- Create opportunity
  INSERT INTO opportunities (...) VALUES (...);
COMMIT;