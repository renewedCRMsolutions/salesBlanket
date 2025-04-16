CREATE TYPE view_level_enum AS ENUM (
  'none', 
  'customer', 
  'marketing', 
  'setter', 
  'closer', 
  'sales_manager', 
  'office', 
  'production_team', 
  'operations', 
  'owner', 
  'general_manager'
);

CREATE TYPE edit_level_enum AS ENUM (
  'none', 
  'notes_only', 
  'estimates', 
  'estimate_approvals', 
  'production', 
  'full_access'
);

CREATE TYPE delete_level_enum AS ENUM (
  'none', 
  'user_created_notes', 
  'estimates', 
  'production', 
  'full_access'
);