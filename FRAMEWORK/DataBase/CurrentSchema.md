-- Drop all existing tables (if they exist)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Re-enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================
-- CORE FOUNDATION TABLES
-- =============================================

-- Core settings table
CREATE TABLE core_settings (
id SERIAL PRIMARY KEY,
setting_key VARCHAR(100) NOT NULL UNIQUE,
setting_value JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Permissions
CREATE TABLE permissions (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(100) NOT NULL,
description TEXT,
resource VARCHAR(100),
action VARCHAR(100),
status VARCHAR(50),
entity_type_id UUID,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now(),
metadata JSONB
);

-- Activity log with optimized structure
CREATE TABLE activity_log (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID,
entity_id UUID,
entity_type VARCHAR(100),
action VARCHAR(100),
occurred_at TIMESTAMPTZ DEFAULT now(),
ip_address VARCHAR(50),
user_agent TEXT,
-- Using compact keys in JSONB
device JSONB, -- Contains: os, br (browser), sr (screen resolution)
geo JSONB, -- Contains: co (country), ct (city), rg (region)
meta JSONB, -- Contains action-specific metadata
-- Add schema validation
CHECK (jsonb_typeof(device) = 'object' OR device IS NULL),
CHECK (jsonb_typeof(geo) = 'object' OR geo IS NULL),
CHECK (jsonb_typeof(meta) = 'object' OR meta IS NULL)
);

-- =============================================
-- TYPE DEFINITION TABLES
-- =============================================

-- Entity types
CREATE TABLE entity_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
display_name VARCHAR(255) NOT NULL,
parent_category VARCHAR(100),
is_filterable BOOLEAN DEFAULT TRUE,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Zone types
CREATE TABLE zone_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
display_name VARCHAR(255) NOT NULL,
level_order INTEGER,
description TEXT,
icon VARCHAR(100),
default_color VARCHAR(50),
default_opacity NUMERIC,
default_line_width INTEGER,
allowed_parent_type_ids UUID[],
allowed_child_type_ids UUID[],
allow_boundary_crossing BOOLEAN DEFAULT FALSE,
default_settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Department types
CREATE TABLE department_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
description TEXT,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- View types
CREATE TABLE view_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(50) NOT NULL,
component_path VARCHAR(255),
icon VARCHAR(100),
description TEXT,
default_config JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Drive types (formerly board types)
CREATE TABLE drive_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
description TEXT,
icon VARCHAR(100),
color VARCHAR(50),
conditions JSONB,
rep_role_types UUID[],
entity_type_id UUID,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contact types
CREATE TABLE contact_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
type VARCHAR(100) NOT NULL,
description TEXT,
active BOOLEAN DEFAULT TRUE,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Opportunity types
CREATE TABLE opportunity_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
description TEXT,
is_active BOOLEAN DEFAULT TRUE,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Location types
CREATE TABLE location_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
description TEXT,
is_active BOOLEAN DEFAULT TRUE,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Goal types
CREATE TABLE goal_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
description TEXT,
target_value NUMERIC,
unit VARCHAR(50),
time_period VARCHAR(50),
trigger_type VARCHAR(50),
trigger_details JSONB,
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notification types
CREATE TABLE notification_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(100) NOT NULL,
description TEXT,
icon VARCHAR(100),
color VARCHAR(50),
template_title VARCHAR(255),
template_message TEXT,
is_active BOOLEAN DEFAULT TRUE,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity event types
CREATE TABLE entity_event_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(100) NOT NULL,
description TEXT,
icon VARCHAR(100),
color VARCHAR(50),
entity_type_id UUID,
available_to_roles UUID[],
needs_approval BOOLEAN DEFAULT FALSE,
approver_roles UUID[],
is_active BOOLEAN DEFAULT TRUE,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now(),
notification_template_id UUID,
approval_threshold INTEGER,
approval_expiry_days INTEGER,
auto_approve_after_days INTEGER,
approval_logic VARCHAR(50)
);

-- Bucket types
CREATE TABLE bucket_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
bucket_name VARCHAR(255) NOT NULL,
description TEXT,
is_active BOOLEAN DEFAULT TRUE,
color VARCHAR(50),
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Touchpoint types (formerly milestone codes)
CREATE TABLE touchpoint_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
description TEXT,
icon VARCHAR(100),
color VARCHAR(50),
default_follow_up_days INTEGER,
is_active BOOLEAN DEFAULT TRUE,
requires_task BOOLEAN DEFAULT FALSE,
no_show BOOLEAN DEFAULT FALSE,
display_config JSONB,
is_team_visible BOOLEAN DEFAULT FALSE,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity achievement types
CREATE TABLE entity_achievement_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
description TEXT,
icon VARCHAR(100),
color VARCHAR(50),
conditions JSONB,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity engagement role types (formerly assignment role types)
CREATE TABLE entity_engagement_role_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(100) NOT NULL,
description TEXT,
is_active BOOLEAN DEFAULT TRUE,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Document types
CREATE TABLE document_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(100) NOT NULL,
processor_id VARCHAR(255),
extraction_schema JSONB,
icon VARCHAR(100),
color VARCHAR(50),
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Estimate types
CREATE TABLE estimate_types (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
description TEXT,
template_id VARCHAR(255),
requires_signature BOOLEAN DEFAULT TRUE,
fields JSONB,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- USER MANAGEMENT TABLES
-- =============================================

-- Users
CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
username VARCHAR(100) NOT NULL UNIQUE,
password_hash VARCHAR(255) NOT NULL,
email VARCHAR(255) NOT NULL UNIQUE,
first_name VARCHAR(100),
last_name VARCHAR(100),
status VARCHAR(50) DEFAULT 'ACTIVE',
avatar_url VARCHAR(255),
last_login TIMESTAMPTZ,
preferences JSONB,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Role permissions
CREATE TABLE role_permissions (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
role_id UUID,
permission_id UUID,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
activity_log_id UUID
);

-- User roles
CREATE TABLE user_roles (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID,
role_id UUID,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now()
);

-- User settings (formerly user notification preferences)
CREATE TABLE user_settings (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID,
notification_setting_id UUID,
value JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Role goals
CREATE TABLE role_goals (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
role_id UUID,
goal_definition_id UUID,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now()
);

-- Role settings
CREATE TABLE role_settings (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
role_id UUID,
primary_board_id UUID,
primary_department_id UUID,
primary_entity_type_id UUID,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- GEOGRAPHIC FRAMEWORK TABLES
-- =============================================

-- Geographic zones
CREATE TABLE geographic_zones (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
parent_id UUID,
name VARCHAR(255) NOT NULL,
level INTEGER,
boundary GEOMETRY,
google_place_id VARCHAR(255),
place_type VARCHAR(100),
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Zone hierarchies
CREATE TABLE zone_hierarchies (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
parent_zone_id UUID,
child_zone_id UUID,
relationship_type VARCHAR(50),
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Zones
CREATE TABLE zones (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
zone_type_id UUID,
parent_zone_id UUID,
name VARCHAR(255) NOT NULL,
description TEXT,
status VARCHAR(50),
boundary GEOGRAPHY,
color VARCHAR(50),
opacity NUMERIC,
line_width INTEGER,
settings JSONB,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- User zone scope
CREATE TABLE user_zone_scope (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID,
zone_id UUID,
assigned_at TIMESTAMPTZ,
assigned_by UUID,
is_active BOOLEAN DEFAULT TRUE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity zones
CREATE TABLE entity_zones (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
entity_id VARCHAR(255),
zone_id UUID,
relationship_type VARCHAR(50),
is_primary BOOLEAN DEFAULT FALSE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Neighborhoods
CREATE TABLE neighborhoods (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
description TEXT,
boundaries GEOGRAPHY,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Neighborhood streets
CREATE TABLE neighborhood_streets (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
neighborhood_id UUID,
name VARCHAR(255) NOT NULL,
start_address_number INTEGER,
end_address_number INTEGER,
address_parity VARCHAR(50),
geometry GEOGRAPHY,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- LOCATION TABLES
-- =============================================

-- Locations
CREATE TABLE locations (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
location_type_id UUID,
address_id UUID,
status VARCHAR(50),
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Location settings (formerly company details)
CREATE TABLE location_settings (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255),
street VARCHAR(255),
address_line_2 VARCHAR(255),
city VARCHAR(100),
state VARCHAR(50),
postal_code VARCHAR(20),
country VARCHAR(100),
main_phone VARCHAR(50),
website_url VARCHAR(255),
logo_url VARCHAR(255),
industry VARCHAR(100),
default_timezone VARCHAR(50),
default_currency VARCHAR(10),
branding_settings JSONB,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Location departments
CREATE TABLE location_departments (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
location_id UUID,
department_id UUID,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Location drives
CREATE TABLE location_drives (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
location_id UUID,
drive_id UUID,
name VARCHAR(255),
description TEXT,
start_date DATE,
end_date DATE,
is_active BOOLEAN DEFAULT TRUE,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Location documentation
CREATE TABLE location_documentation (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
location_id UUID,
title VARCHAR(255) NOT NULL,
content TEXT,
document_type VARCHAR(50),
google_doc_id VARCHAR(255),
version VARCHAR(50),
is_active BOOLEAN DEFAULT TRUE,
requires_acknowledgment BOOLEAN DEFAULT FALSE,
voice_enabled BOOLEAN DEFAULT FALSE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- TEAM MANAGEMENT TABLES
-- =============================================

-- Teams
CREATE TABLE teams (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
team_leader_user_id UUID,
district_id UUID,
description TEXT,
status VARCHAR(50) DEFAULT 'ACTIVE',
boundaries JSONB,
geo_json GEOGRAPHY,
color VARCHAR(50),
opacity NUMERIC,
line_width INTEGER,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team members
CREATE TABLE team_members (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
team_id UUID,
user_id UUID,
joined_at TIMESTAMPTZ DEFAULT now(),
metadata JSONB,
UNIQUE(team_id, user_id)
);

-- Team neighborhoods
CREATE TABLE team_neighborhoods (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
team_id UUID,
neighborhood_id UUID,
start_date DATE,
end_date DATE,
priority INTEGER,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team settings
CREATE TABLE team_settings (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
team_id UUID,
settings JSONB,
notification_preferences JSONB,
display_preferences JSONB,
ai_features_enabled BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- DEPARTMENT TABLES
-- =============================================

-- Department roles
CREATE TABLE department_roles (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
department_id UUID,
role_id UUID,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Department milestones
CREATE TABLE department_milestones (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
department_id UUID,
milestone_id UUID,
is_active BOOLEAN DEFAULT TRUE,
target_count INTEGER,
target_period VARCHAR(50),
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Department views
CREATE TABLE department_views (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
department_id UUID,
name VARCHAR(255) NOT NULL,
description TEXT,
view_components JSONB,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- DRIVE SYSTEM TABLES (FORMERLY BOARDS)
-- =============================================

-- Drive buckets (formerly board buckets)
CREATE TABLE drive_buckets (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
drive_type_id UUID,
bucket_type_id UUID,
display_order INTEGER,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Drive departments (formerly board departments)
CREATE TABLE drive_departments (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
drive_type_id UUID,
department_id UUID,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Drive geography mapping (formerly board geography mapping)
CREATE TABLE drive_geography_mapping (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
drive_type_id UUID,
geographic_level VARCHAR(50),
can_cross_boundaries BOOLEAN DEFAULT FALSE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Drive access levels (formerly board access levels)
CREATE TABLE drive_access_levels (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(100) NOT NULL,
description TEXT,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Drive achievements (formerly board achievements)
CREATE TABLE drive_achievements (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
drive_type_id UUID,
achievement_type_id UUID,
active BOOLEAN DEFAULT TRUE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bucket settings
CREATE TABLE bucket_settings (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
bucket_id UUID,
visibility_rules JSONB,
display_order INTEGER,
color VARCHAR(50),
icon VARCHAR(100),
is_archived BOOLEAN DEFAULT FALSE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bucket codes
CREATE TABLE bucket_codes (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
bucket_type_id UUID,
code VARCHAR(50) NOT NULL,
description TEXT,
is_active BOOLEAN DEFAULT TRUE,
color VARCHAR(50),
icon VARCHAR(100),
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- VIEW SYSTEM TABLES
-- =============================================

-- View configurations
CREATE TABLE view_configurations (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
view_type_id UUID,
name VARCHAR(255) NOT NULL,
config JSONB,
is_system BOOLEAN DEFAULT FALSE,
is_default BOOLEAN DEFAULT FALSE,
created_by UUID,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- User view preferences
CREATE TABLE user_view_preferences (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID,
view_configuration_id UUID,
is_favorite BOOLEAN DEFAULT FALSE,
custom_settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Role views
CREATE TABLE role_views (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
role_id UUID,
name VARCHAR(255) NOT NULL,
description TEXT,
view_components JSONB,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Group views
CREATE TABLE group_views (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
group_id UUID,
view_configuration_id UUID,
entity_type_id UUID,
order_index INTEGER,
is_default BOOLEAN DEFAULT FALSE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ENTITY TABLES
-- =============================================

-- Addresses
CREATE TABLE addresses (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255),
street VARCHAR(255) NOT NULL,
address_line_2 VARCHAR(255),
city VARCHAR(100),
state VARCHAR(50),
postal_code VARCHAR(20),
status VARCHAR(50) DEFAULT 'ACTIVE',
notes TEXT,
property_condition JSONB,
next_knock_date TIMESTAMPTZ,
street_id UUID,
neighborhood_id UUID,
created_by UUID,
location_geo GEOGRAPHY(POINT),
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts
CREATE TABLE contacts (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
first_name VARCHAR(100),
last_name VARCHAR(100),
email VARCHAR(255),
notes TEXT,
facebook VARCHAR(255),
x VARCHAR(255),
instagram VARCHAR(255),
linkedin VARCHAR(255),
cover_photo VARCHAR(255),
status VARCHAR(50) DEFAULT 'ACTIVE',
contact_approval BOOLEAN DEFAULT FALSE,
contact_type_id UUID,
created_by UUID,
updated_by UUID,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Address contacts
CREATE TABLE address_contacts (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
address_id UUID,
contact_id UUID,
contact_type_id UUID,
is_primary BOOLEAN DEFAULT FALSE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Opportunities
CREATE TABLE opportunities (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
opportunity_type_id UUID,
status VARCHAR(50) DEFAULT 'ACTIVE',
notes TEXT,
created_by UUID,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Opportunity contacts
CREATE TABLE opportunity_contacts (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
opportunity_id UUID,
contact_id UUID,
relationship_type VARCHAR(50),
is_primary BOOLEAN DEFAULT FALSE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Address opportunities
CREATE TABLE address_opportunities (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
address_id UUID,
opportunity_id UUID,
relationship_type VARCHAR(50),
active BOOLEAN DEFAULT TRUE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ENTITY ENGAGEMENT TABLES (FORMERLY ASSIGNMENT)
-- =============================================

-- Entity engagements (formerly entity assignments)
CREATE TABLE entity_engagements (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
entity_id VARCHAR(255),
entity_type_id UUID,
user_id UUID,
engagement_role_id UUID,
assigned_at TIMESTAMPTZ,
assigned_by UUID,
is_active BOOLEAN DEFAULT TRUE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity engagement roles (formerly assignment roles)
CREATE TABLE entity_engagement_roles (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(100) NOT NULL,
description TEXT,
engagement_role_type_id UUID,
applies_to_entity_types UUID[],
is_active BOOLEAN DEFAULT TRUE,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity engagement role permissions (formerly assignment role permissions)
CREATE TABLE entity_engagement_role_permissions (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
role_id UUID,
engagement_role_id UUID,
can_assign BOOLEAN DEFAULT FALSE,
can_revoke BOOLEAN DEFAULT FALSE,
applies_to_entity_types UUID[],
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity engagement access history (formerly assignment access history)
CREATE TABLE entity_engagement_access_history (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
entity_type_id UUID,
entity_id VARCHAR(255),
user_id UUID,
assigned_by UUID,
assigned_at TIMESTAMPTZ,
unassigned_at TIMESTAMPTZ,
unassigned_by UUID,
action VARCHAR(50),
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity engagement access conflict (formerly assignment access conflict)
CREATE TABLE entity_engagement_access_conflict (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
policy_name VARCHAR(100) NOT NULL,
is_active BOOLEAN DEFAULT TRUE,
priority_order JSONB,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity engagement access default rules (formerly assignment access default rules)
CREATE TABLE entity_engagement_access_default_rules (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
role_id UUID,
default_access_level_id UUID,
applies_to VARCHAR(100),
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ENTITY CARDS & PULSE SYSTEM TABLES
-- =============================================

-- Entity cards
CREATE TABLE entity_cards (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
description TEXT,
icon VARCHAR(100),
color VARCHAR(50),
is_active BOOLEAN DEFAULT TRUE,
display_order INTEGER,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity card layout
CREATE TABLE entity_card_layout (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
entity_type_id UUID,
entity_card_type_id UUID,
display_order INTEGER,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity card pulse
CREATE TABLE entity_card_pulse (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
entity_id VARCHAR(255),
entity_type_id UUID,
pulse_type VARCHAR(50),
last_synced TIMESTAMPTZ,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity card pulse calendar
CREATE TABLE entity_card_pulse_calendar (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
pulse_id UUID,
event_id VARCHAR(255),
title VARCHAR(255),
description TEXT,
start_time TIMESTAMPTZ,
end_time TIMESTAMPTZ,
attendees JSONB,
location TEXT,
status VARCHAR(50),
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity card pulse drive
CREATE TABLE entity_card_pulse_drive (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
pulse_id UUID,
file_id VARCHAR(255),
file_name VARCHAR(255),
file_type VARCHAR(50),
file_url VARCHAR(255),
thumbnail_url VARCHAR(255),
last_modified TIMESTAMPTZ,
modified_by VARCHAR(255),
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity card pulse gmail
CREATE TABLE entity_card_pulse_gmail (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
pulse_id UUID,
message_id VARCHAR(255),
thread_id VARCHAR(255),
subject VARCHAR(255),
snippet TEXT,
from_email VARCHAR(255),
to_email VARCHAR(255),
cc VARCHAR(255),
received_at TIMESTAMPTZ,
has_attachments BOOLEAN DEFAULT FALSE,
labels JSONB,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity card pulse meet
CREATE TABLE entity_card_pulse_meet (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
pulse_id UUID,
meeting_id VARCHAR(255),
title VARCHAR(255),
start_time TIMESTAMPTZ,
end_time TIMESTAMPTZ,
attendees JSONB,
recording_url VARCHAR(255),
notes_url VARCHAR(255),
status VARCHAR(50),
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity card pulse tasks
CREATE TABLE entity_card_pulse_tasks (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
pulse_id UUID,
task_id VARCHAR(255),
title VARCHAR(255),
description TEXT,
due_date TIMESTAMPTZ,
assigned_to VARCHAR(255),
status VARCHAR(50),
priority VARCHAR(50),
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity card pulse gemini
CREATE TABLE entity_card_pulse_gemini (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
pulse_id UUID,
prompt_id VARCHAR(255),
prompt_text TEXT,
response_text TEXT,
created_by VARCHAR(255),
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Entity card pulse notebook
CREATE TABLE entity_card_pulse_notebook (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
pulse_id UUID,
notebook_id VARCHAR(255),
title VARCHAR(255),
content TEXT,
last_edited TIMESTAMPTZ,
edited_by VARCHAR(255),
shared_with JSONB,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- TOUCHPOINT TABLES (FORMERLY MILESTONE)
-- =============================================

-- Touchpoints
CREATE TABLE touchpoints (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
entity_type_id UUID,
address_id UUID,
contact_id UUID,
opportunity_id UUID,
user_id UUID,
zone_id UUID,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now()
);

-- Entity touchpoints
CREATE TABLE entity_touchpoints (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
entity_id VARCHAR(255),
entity_type_id UUID,
touchpoint_code_id UUID,
notes TEXT,
status VARCHAR(50),
created_by UUID,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Touchpoint applicable entities (formerly milestone code applicable entities)
CREATE TABLE touchpoint_applicable_entities (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
touchpoint_code_id UUID,
entity_type_id UUID,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now()
);

-- Touchpoint permissions (formerly milestone code permissions)
CREATE TABLE touchpoint_permissions (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
touchpoint_code_id UUID,
entity_type_id UUID,
can_create BOOLEAN DEFAULT FALSE,
can_update BOOLEAN DEFAULT FALSE,
can_delete BOOLEAN DEFAULT FALSE,
can_configure_settings BOOLEAN DEFAULT FALSE,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Touchpoint achievements (formerly milestone code achievements)
CREATE TABLE touchpoint_achievements (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
touchpoint_code_id UUID,
achievement_type_id UUID,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- USER ANALYTICS & TRACKING
-- =============================================

-- User activity tracking with hybrid design
CREATE TABLE user_analytics (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
-- Commonly queried fields as columns
user_id UUID,
entity_id UUID,
action VARCHAR(50) NOT NULL,
occurred_at TIMESTAMPTZ DEFAULT now(),
ip_address VARCHAR(50),
-- Use short keys in JSONB fields
device JSONB, -- Contains: os, br (browser), sr (screen resolution)
geo JSONB, -- Contains: co (country), ct (city), rg (region)
meta JSONB, -- Contains event-specific metadata
perf JSONB, -- Contains performance metrics
-- Add schema validation
CHECK (jsonb_typeof(device) = 'object' OR device IS NULL),
CHECK (jsonb_typeof(geo) = 'object' OR geo IS NULL),
CHECK (jsonb_typeof(meta) = 'object' OR meta IS NULL)
);

-- Website visitor tracking
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

-- =============================================
-- NOTIFICATION SYSTEM
-- =============================================

-- Notifications
CREATE TABLE notifications (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID,
notification_type_id UUID,
title VARCHAR(255) NOT NULL,
message TEXT,
related_entity_type_id UUID,
related_entity_id VARCHAR(255),
is_read BOOLEAN DEFAULT FALSE,
read_at TIMESTAMPTZ,
created_by UUID,
snoozed_until TIMESTAMPTZ,
snooze_count INTEGER DEFAULT 0,
display_at TIMESTAMPTZ,
expires_at TIMESTAMPTZ,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now()
);

-- Notification settings
CREATE TABLE notification_settings (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
notification_type_id UUID,
name VARCHAR(100) NOT NULL,
description TEXT,
default_value JSONB,
is_user_configurable BOOLEAN DEFAULT TRUE,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notification rules
CREATE TABLE notification_rules (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(100) NOT NULL,
description TEXT,
entity_type_id UUID,
notification_type_id UUID,
conditions JSONB,
actions JSONB,
is_active BOOLEAN DEFAULT TRUE,
priority INTEGER,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notification channels
CREATE TABLE notification_channels (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(100) NOT NULL,
is_active BOOLEAN DEFAULT TRUE,
configuration JSONB,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- DOCUMENT MANAGEMENT
-- =============================================

-- Documents
CREATE TABLE documents (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
document_type_id UUID,
title VARCHAR(255) NOT NULL,
file_path VARCHAR(255),
google_doc_id VARCHAR(255),
upload_date TIMESTAMPTZ DEFAULT now(),
status VARCHAR(50),
entity_id UUID,
entity_type_id UUID,
uploaded_by UUID,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Document data
CREATE TABLE document_data (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
document_id UUID,
field_name VARCHAR(100),
field_value TEXT,
confidence_score NUMERIC,
source_coordinates JSONB,
validated BOOLEAN DEFAULT FALSE,
validated_by UUID,
validated_at TIMESTAMPTZ,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Document AI models
CREATE TABLE document_ai_models (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
version VARCHAR(50),
endpoint_url VARCHAR(255),
api_key_reference VARCHAR(255),
model_type VARCHAR(100),
status VARCHAR(50),
configuration JSONB,
last_trained TIMESTAMPTZ,
accuracy_metrics JSONB,
settings JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ESTIMATE SYSTEM
-- =============================================

-- Estimates
CREATE TABLE estimates (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
estimate_type_id UUID,
entity_id UUID,
opportunity_id UUID,
created_by UUID,
amount NUMERIC,
status VARCHAR(50),
valid_until DATE,
google_doc_id VARCHAR(255),
signature_status VARCHAR(50),
signature_date TIMESTAMPTZ,
signature_data JSONB,
line_items JSONB,
notes TEXT,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- GOAL MANAGEMENT SYSTEM
-- =============================================

-- Goal events
CREATE TABLE goal_events (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID,
goal_definition_id UUID,
event_timestamp TIMESTAMPTZ,
value NUMERIC,
related_entity_type_id UUID,
related_entity_id VARCHAR(255),
source_description VARCHAR(255),
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now()
);

-- User goals
CREATE TABLE user_goals (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID,
name VARCHAR(255) NOT NULL,
description TEXT,
target_value NUMERIC,
current_value NUMERIC,
start_date DATE,
end_date DATE,
completed BOOLEAN DEFAULT FALSE,
metrics JSONB,
priority INTEGER,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Team goals
CREATE TABLE team_goals (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
team_id UUID,
name VARCHAR(255) NOT NULL,
description TEXT,
target_value NUMERIC,
current_value NUMERIC,
start_date DATE,
end_date DATE,
completed BOOLEAN DEFAULT FALSE,
metrics JSONB,
priority INTEGER,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Zone goals
CREATE TABLE zone_goals (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
zone_id UUID,
name VARCHAR(255) NOT NULL,
description TEXT,
target_value NUMERIC,
current_value NUMERIC,
start_date DATE,
end_date DATE,
completed BOOLEAN DEFAULT FALSE,
metrics JSONB,
priority INTEGER,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Location goals
CREATE TABLE location_goals (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
location_id UUID,
name VARCHAR(255) NOT NULL,
description TEXT,
target_value NUMERIC,
current_value NUMERIC,
start_date DATE,
end_date DATE,
completed BOOLEAN DEFAULT FALSE,
metrics JSONB,
priority INTEGER,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Neighborhood goals
CREATE TABLE neighborhood_goals (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
neighborhood_id UUID,
name VARCHAR(255) NOT NULL,
description TEXT,
target_value NUMERIC,
current_value NUMERIC,
start_date DATE,
end_date DATE,
completed BOOLEAN DEFAULT FALSE,
metrics JSONB,
priority INTEGER,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- CORPORATE MANAGEMENT
-- =============================================

-- Cooperate
CREATE TABLE cooperate (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
description TEXT,
logo_url VARCHAR(255),
established_date DATE,
mission_statement TEXT,
vision_statement TEXT,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cooperate goals
CREATE TABLE cooperate_goals (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
cooperate_id UUID,
name VARCHAR(255) NOT NULL,
description TEXT,
target_value NUMERIC,
current_value NUMERIC,
start_date DATE,
end_date DATE,
completed BOOLEAN DEFAULT FALSE,
metrics JSONB,
priority INTEGER,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Cooperate owner
CREATE TABLE cooperate_owner (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
cooperate_id UUID,
user_id UUID,
ownership_percentage NUMERIC,
start_date DATE,
end_date DATE,
permissions JSONB,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Operations user
CREATE TABLE operations_user (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID,
operation_type VARCHAR(50),
permissions JSONB,
access_level INTEGER,
start_date DATE,
end_date DATE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- GROUPS & FEATURE MANAGEMENT
-- =============================================

-- Groups
CREATE TABLE groups (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
name VARCHAR(255) NOT NULL,
description TEXT,
group_type VARCHAR(50),
parent_group_id UUID,
is_active BOOLEAN DEFAULT TRUE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Group members
CREATE TABLE group_members (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
group_id UUID,
user_id UUID,
role VARCHAR(50),
join_date DATE,
expiry_date DATE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- Feature subscriptions
CREATE TABLE feature_subscriptions (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID,
feature_name VARCHAR(100) NOT NULL,
is_enabled BOOLEAN DEFAULT FALSE,
subscription_level VARCHAR(50),
start_date DATE,
end_date DATE,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI Suggestions
CREATE TABLE ai_suggestions (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID,
entity_id UUID,
entity_type_id UUID,
suggestion_type VARCHAR(100) NOT NULL,
suggestion_text TEXT,
confidence_score NUMERIC,
is_applied BOOLEAN DEFAULT FALSE,
applied_at TIMESTAMPTZ,
metadata JSONB,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- CREATE INDEXES
-- =============================================

-- Create indexes for activity logging table
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity_id ON activity_log(entity_id, entity_type);
CREATE INDEX idx_activity_log_action ON activity_log(action);
CREATE INDEX idx_activity_log_occurred_at ON activity_log(occurred_at);
CREATE INDEX idx_activity_log_ip ON activity_log(ip_address);
CREATE INDEX idx_activity_log_device ON activity_log USING GIN (device);
CREATE INDEX idx_activity_log_meta ON activity_log USING GIN (meta);

-- Create indexes for analytics tables
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_entity_id ON user_analytics(entity_id);
CREATE INDEX idx_user_analytics_action ON user_analytics(action);
CREATE INDEX idx_user_analytics_occurred_at ON user_analytics(occurred_at);
CREATE INDEX idx_user_analytics_device ON user_analytics USING GIN (device);
CREATE INDEX idx_user_analytics_meta ON user_analytics USING GIN (meta);

-- Create indexes for website tracking
CREATE INDEX idx_website_visits_session ON website_visits(session_id);
CREATE INDEX idx_website_visits_visitor ON website_visits(visitor_id);
CREATE INDEX idx_website_events_session ON website_events(session_id);
CREATE INDEX idx_website_events_type ON website_events(event_type);
CREATE INDEX idx_website_events_category ON website_events(event_category, event_action);
CREATE INDEX idx_website_events_data ON website_events USING GIN (event_data);

-- Create indexes for geographic data
CREATE INDEX idx_zones_boundary ON zones USING GIST(boundary);
CREATE INDEX idx_geographic_zones_boundary ON geographic_zones USING GIST(boundary);
CREATE INDEX idx_neighborhoods_boundaries ON neighborhoods USING GIST(boundaries);
CREATE INDEX idx_neighborhood_streets_geometry ON neighborhood_streets USING GIST(geometry);
CREATE INDEX idx_addresses_location ON addresses USING GIST(location_geo);

-- Create indexes for key lookup fields
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);
CREATE INDEX idx_addresses_postal_code ON addresses(postal_code);
CREATE INDEX idx_entity_engagements_entity ON entity_engagements(entity_id, entity_type_id);
CREATE INDEX idx_entity_engagements_user ON entity_engagements(user_id);
CREATE INDEX idx_touchpoints_entity ON entity_touchpoints(entity_id, entity_type_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

-- Create indexes for common timestamp fields
CREATE INDEX idx_created_at_users ON users(created_at);
CREATE INDEX idx_created_at_entities ON entity_touchpoints(created_at);
CREATE INDEX idx_created_at_activity ON activity_log(created_at);
CREATE INDEX idx_updated_at_entities ON entity_touchpoints(updated_at);

-- Create partial indexes for common queries
CREATE INDEX idx_active_users ON users(id) WHERE status = 'ACTIVE';
CREATE INDEX idx_active_contacts ON contacts(id) WHERE status = 'ACTIVE';
CREATE INDEX idx_active_opportunities ON opportunities(id) WHERE status = 'ACTIVE';
CREATE INDEX idx_active_engagements ON entity_engagements(id) WHERE is_active = TRUE;
CREATE INDEX idx_unread_notifications ON notifications(id, user_id) WHERE is_read = FALSE;
