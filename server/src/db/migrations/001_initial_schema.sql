-- Initial database schema for SalesBlanket v4

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geographic data
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Entity status enum
CREATE TYPE entity_status AS ENUM (
  'ACTIVE', 'INACTIVE', 'PENDING', 'ARCHIVED', 'DELETED'
);

-- Touchpoint status enum
CREATE TYPE touchpoint_status AS ENUM (
  'SCHEDULED', 'COMPLETED', 'CANCELED', 'NO_SHOW', 'RESCHEDULED'
);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  status entity_status NOT NULL DEFAULT 'ACTIVE',
  avatar_url VARCHAR(255),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Social Profiles
CREATE TABLE user_social_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  name VARCHAR(255),
  profile_url VARCHAR(255),
  photo_url VARCHAR(255),
  access_token VARCHAR(2000) NOT NULL,
  refresh_token VARCHAR(2000),
  token_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- User Analytics
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Commonly queried fields as columns
  user_id UUID REFERENCES users(id),
  entity_id UUID,
  action VARCHAR(50) NOT NULL,
  occurred_at TIMESTAMPTZ DEFAULT now(),
  ip_address VARCHAR(50),
  -- Use short keys in JSONB fields
  device JSONB, -- Contains: os, br (browser), sr (screen resolution)
  geo JSONB,    -- Contains: co (country), ct (city), rg (region)
  meta JSONB,   -- Contains event-specific metadata
  perf JSONB,   -- Contains performance metrics
  -- Add schema validation
  CHECK (jsonb_typeof(device) = 'object'),
  CHECK (jsonb_typeof(geo) = 'object'),
  CHECK (jsonb_typeof(meta) = 'object')
);

-- Entity Types
CREATE TABLE entity_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name VARCHAR(50) NOT NULL,
  parent_category VARCHAR(50),
  is_filterable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Entity Settings
CREATE TABLE entity_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type_id UUID NOT NULL REFERENCES entity_types(id),
  setting_key VARCHAR(50) NOT NULL,
  setting_value VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_type_id, setting_key)
);

-- Zone Types
CREATE TABLE zone_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name VARCHAR(50) NOT NULL,
  level_order INT,
  description TEXT,
  icon VARCHAR(50),
  default_color VARCHAR(50),
  default_opacity FLOAT,
  default_line_width INT,
  allowed_parent_type_ids UUID[],
  allowed_child_type_ids UUID[],
  allow_boundary_crossing BOOLEAN DEFAULT false,
  default_settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Zones
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_type_id UUID NOT NULL REFERENCES zone_types(id),
  parent_zone_id UUID REFERENCES zones(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  status entity_status NOT NULL DEFAULT 'ACTIVE',
  boundary GEOGRAPHY(POLYGON, 4326),
  color VARCHAR(50),
  opacity FLOAT,
  line_width INT,
  settings JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- View Types
CREATE TABLE view_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  component_path VARCHAR(255),
  icon VARCHAR(50),
  description TEXT,
  default_config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- View Configurations
CREATE TABLE view_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  view_type_id UUID NOT NULL REFERENCES view_types(id),
  name VARCHAR(100) NOT NULL,
  config JSONB NOT NULL,
  is_system BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User View Preferences
CREATE TABLE user_view_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  view_configuration_id UUID NOT NULL REFERENCES view_configurations(id),
  is_favorite BOOLEAN DEFAULT false,
  custom_settings JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, view_configuration_id)
);

-- Geographic Zones (from Google Places API)
CREATE TABLE geographic_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES geographic_zones(id),
  name VARCHAR(255) NOT NULL,
  level INT NOT NULL,
  boundary GEOMETRY(POLYGON, 4326),
  google_place_id VARCHAR(255),
  place_type VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX zones_parent_zone_id_idx ON zones(parent_zone_id);
CREATE INDEX zones_name_idx ON zones(name);
CREATE INDEX user_analytics_user_id_idx ON user_analytics(user_id);
CREATE INDEX user_analytics_action_idx ON user_analytics(action);

-- Create spatial indexes for geospatial queries
CREATE INDEX zones_boundary_idx ON zones USING GIST(boundary);
CREATE INDEX geographic_zones_boundary_idx ON geographic_zones USING GIST(boundary);