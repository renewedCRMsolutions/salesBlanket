# final copy

database schema - C:\Users\Robert Wolfe\Desktop\Projects\salesBlanketv4\intakeDatabaseTables.md

## address / contact entry

UI customer input

user clicks add record - given choice - choose entity (address,contact)_type to populate form -or- add to existing collection

if user chooses to add entity without existing collection:
if user chooses to add to an existing collection scroll past this

1. user choose record type

2. depending on the entity that is selected - the user selects a type before we work on the form rendering

address_types(id)

contact_types(id)

## Entity Form Mappings: Developer Guide

sqlCREATE TABLE entity_form_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_definition_id UUID NOT NULL REFERENCES form_definitions(id),
  
  -- Entity identifiers with foreign keys
  entity_type_id UUID REFERENCES entity_types(id),
  address_type_id UUID REFERENCES address_types(id),
  contact_type_id UUID REFERENCES contact_types(id),
  entity_subtype_id UUID REFERENCES entity_subtypes(id),
  opportunity_type_id UUID REFERENCES opportunity_types(id),
  team_entity_id UUID REFERENCES team_entities(id),
  calendar_entity_id UUID REFERENCES calendar_entities(id),
  collection_entity_id UUID REFERENCES collection_entities(id),
  geo_entity_id UUID REFERENCES geo_entities(id),
  labor_entity_id UUID REFERENCES labor_entities(id),
  notification_entity_id UUID REFERENCES notification_entities(id),
  organization_entity_id UUID REFERENCES organization_entities(id),
  parent_entity_id UUID REFERENCES parent_entities(id),
  production_entity_id UUID REFERENCES production_entities(id),
  permission_entity_id UUID REFERENCES permission_entities(id),
  sales_engine_entity_id UUID REFERENCES sales_engine_entities(id),
  
  auto_bypass_subtype BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
Key Functionality
Form Selection Logic
When a user selects an entity type, your front-end should:

Query for forms based on the entity type:
javascript// Example for address types
async function getFormsForAddressType(addressTypeId) {
  const response = await fetch('/api/entity-forms/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ addressTypeId })
  });
  return await response.json();
}

Check the auto_bypass_subtype flag in the response:
javascriptconst formMappings = await getFormsForAddressType(selectedAddressTypeId);

if (formMappings.length === 1 && formMappings[0].auto_bypass_subtype) {
  // Skip subtype selection, load form directly
  loadForm(formMappings[0].form_definition_id);
} else {
  // Show subtype selection UI
  showSubtypeSelection(formMappings);
}


Different Forms by Entity Type
The table supports various scenarios:

Direct form mapping: For entity types that don't need subtypes (like "Property Condition Report")
javascript// Forms linked directly to address types
if (addressTypeId === 'a8dddda0-c9fd-4a5c-8c11-ab54e263a9df') {
  // Property Condition Report - load comprehensive form directly
}

Subtype-based forms: For entity types that need further categorization
javascript// For insurance claims, show subtype options first
if (entityTypeId === '5234af67-44a9-4641-8dbb-96de2ad4a2c2') {
  // Show options: Roofing, Siding, Gutters, etc.
  // Each subtype will load a different form
}


Backend API Implementation
Your API should query the mappings table based on the entity selected:
javascript// Express/Node.js example
app.post('/api/entity-forms/lookup', async (req, res) => {
  const { 
    entityTypeId, addressTypeId, contactTypeId, 
    opportunityTypeId, entitySubtypeId 
  } = req.body;
  
  let query = `
    SELECT 
      efm.form_definition_id, 
      efm.auto_bypass_subtype,
      efm.entity_subtype_id,
      efm.is_default,
      fd.name as form_name,
      fd.form_schema
    FROM 
      entity_form_mappings efm
    JOIN
      form_definitions fd ON efm.form_definition_id = fd.id
    WHERE 1=1
  `;
  
  // Add conditional clauses based on what was provided
  if (entityTypeId) query += ` AND efm.entity_type_id = '${entityTypeId}'`;
  if (addressTypeId) query += ` AND efm.address_type_id = '${addressTypeId}'`;
  if (contactTypeId) query += ` AND efm.contact_type_id = '${contactTypeId}'`;
  if (opportunityTypeId) query += ` AND efm.opportunity_type_id = '${opportunityTypeId}'`;
  if (entitySubtypeId) query += ` AND efm.entity_subtype_id = '${entitySubtypeId}'`;
  
  query += ` ORDER BY efm.display_order, efm.is_default DESC`;
  
  // Execute query and return results
  const results = await db.query(query);
  res.json(results.rows);
});

With this implementation, your front-end can efficiently fetch and display the right forms based on user selections, creating a streamlined form entry experience for users.

## lead entry continued

user will get the proper form based on selection.

if the user completes address forms, user is asked to add a contact - y / n 

if the user completes contact form(s) upon completion asked to add a address y /n

if n - goto the opportuntiy type selection

if y - go back to the begining to select contact / address and start over

UI populates one form at a time - once all selections complete based on the subtype selections the 
ui will ask if the user would like to add more subtypes or submit the record - on submit we goto opportunity type selection. 

system auto names the collection name - the street - contact last name

if we do not have one or the other it just populates one.  we need to work into the code that when a contact is added 

we need to dial in the contact type needs to be starred on creation as decision maker - decision maker flag - need the code to update the last name on the collection name

we have to flag the addresses as well - production, billing, decision maker - if the account will have 2 addresses  

after we enter the contact, address or contact and address the ui prompts us to choose the opportunity type.

## opportuntiy type selection

we pull the opportunity types to choose from here:

opportunity_types(type_id)

Marketing Lead, Setter Lead, Self Gen

when they select the opportunity type and submit it creates the opportunity record on the opportunities table

"id"	"uuid"	"NO"	"uuid_generate_v4()"
"opportunity_type_id"	"uuid"	"YES"	
"status"	"character varying"	"YES"	"'ACTIVE'::character varying"
"notes"	"text"	"YES"	
"created_by"	"uuid"	"YES"	
"metadata"	"jsonb"	"YES"	
"created_at"	"timestamp with time zone"	"YES"	"now()"
"updated_at"	"timestamp with time zone"	"YES"	"now()"
"collection_id"	"uuid"	"YES"	

## ADD to existing collection

user can search by

phone number
name
email
address

to pull up a matching collection to add a record to a current collection

after we enter the contact, address or contact and address the ui prompts us to choose the opportunity type.. 

opportunity_type_id

Marketing Lead, Setter Lead, Self Gen 

a collection is created when we created a address or contact record

## RECORD PROPAGATION FROM CREATION

address_contacts record created - 
our salesPulse runs off of our collection_id

when the collection_id is created

collection_pulse

pulse - use the collection_id to create a salesPules - when pulse_id created
sync with google drive - pulse_id is the folder name - contrats, photos, documents, claims folders are created
pulse_ai - NOT IN BETA
pulse_calendar - UI tracks created events.  We need a system to create these events - should be syncing with googleTasks to start
pulse_mail - pulls emails off the contacts engaged to the collection - user logged into gmail
pulse_email_attachments - use of google drive?
pulse_external_users - assign temp access - NOT IN BETA
pulse_lead_referrals - track referrals given by the collection - we need to take down the contact_id for the referring rep and the opportunity_id (referral status) for the created contact or address that was referred.  we need to be able to have this tracked in the ui
pulse_message_read_status - tracking
pulse_messages - internal messaging on the pulse
pulse_notebook - NOT IN BETA
pulse_photos - sync with google drive - nest address_id(s), contact_id(s), opporunity_id(s) as a folder in the photos folder nested in the pulse_id folder that was created with the collection 
pulse_referral_status_history tracks the refferal_id and previous / new status - we need to develop the statuses for referrals
pulse_role_levels 
pulse_storage - sync with google drive - we show the documents, claims and contracts folder here
pulse_scans - need to create a table for this - have a web component scan documents to save in documents as a claim, contract or just documents 
pulse_tasks - syncs with googleTask - copy the API with google to make this seamless - we task out on entities in the app
pulse_text
pulse_virtual_sales

need to dial in the salesPulse system refresh

## engagements on the entities created

we use the enggements to assign users to roles on the entities.  

the users engagement role will be assigned based on configuration

Role Propagation During Record Creation - see these files

C:\Users\Robert Wolfe\Desktop\Projects\salesBlanketv4\FRAMEWORK\engagement\functions\autoEngageRoleAssignment.md
C:\Users\Robert Wolfe\Desktop\Projects\salesBlanketv4\FRAMEWORK\engagement\functions\autoUserEngageAssignment.md


###### WEBSITE INTEGRATION

# Website Integration Tables

Let's add tables specifically designed for website integration:
sql-- Website visitor tracking
CREATE TABLE website_visits (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
session_id UUID NOT NULL,
visitor_id VARCHAR(100),
first_visit BOOLEAN DEFAULT TRUE,
landing_page VARCHAR(255),
referrer VARCHAR(255),
utm_source VARCHAR(100),
utm_medium VARCHAR(100),
utm_campaign VARCHAR(100),
ip_address VARCHAR(50),
user_agent TEXT,
visit_start TIMESTAMPTZ DEFAULT now(),
visit_end TIMESTAMPTZ,
pages_viewed INTEGER DEFAULT 1,
conversion_status VARCHAR(50),
device_data JSONB,
geo_data JSONB,
behavior_metrics JSONB,
created_at TIMESTAMPTZ DEFAULT now()
);

-- Website event tracking
CREATE TABLE website_events (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
session_id UUID NOT NULL,
event_type VARCHAR(100) NOT NULL,
event_category VARCHAR(100),
event_action VARCHAR(100),
event_label VARCHAR(255),
event_value INTEGER,
page_url VARCHAR(255),
occurred_at TIMESTAMPTZ DEFAULT now(),
event_data JSONB,
created_at TIMESTAMPTZ DEFAULT now()
);

-- Create appropriate indexes
CREATE INDEX idx_website_visits_session ON website_visits(session_id);
CREATE INDEX idx_website_visits_visitor ON website_visits(visitor_id);
CREATE INDEX idx_website_events_session ON website_events(session_id);
CREATE INDEX idx_website_events_type ON website_events(event_type);
CREATE INDEX idx_website_events_category ON website_events(event_category, event_action);
CREATE INDEX idx_website_events_data ON website_events USING GIN (event_data);
These tables will help you track visitor behavior across your website and mobile app, with seamless integration between the two platforms.
For JSONB fields that will be frequently queried, GIN indexes are recommended for complex data structures, while B-tree indexes are better for general-purpose indexing when exact matches are needed. Metisdata
Would you like me to incorporate these tables into the complete schema creation script, or would you prefer to add them separately? This approach will give you robust tracking capabilities while maintaining high performance through proper indexing.



we are using googletasks for tasks in the app - we have a pulse_tasks table..  we need to identify what entity records we can task - when we are in the pulse app - we have the collection id - with the collection id we have all the possible entity ids, estimates, addresses, contacts, opportunities

i do not really have a sales_appointments ...  we should really have a nice appointment component in the salesblanket house... any ideas??  we would attach the appointment to the collection probably..  create the address, contact then collection is cretaed..  now we can create the appointment?  then thatb should sync up with the id in the pulse system as well having the collection id..  then the title of the appointment will default to the collection name


