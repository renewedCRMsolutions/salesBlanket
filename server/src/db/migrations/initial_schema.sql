-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create entity types tables
CREATE TABLE IF NOT EXISTS entity_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_name VARCHAR(255) NOT NULL,
    parent_category VARCHAR(255),
    is_filterable BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entity_subtypes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type_id UUID NOT NULL REFERENCES entity_types(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS address_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunity_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create entity tables
CREATE TABLE IF NOT EXISTS streets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(name, city, state)
);

CREATE TABLE IF NOT EXISTS neighborhoods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(name, city, state)
);

CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    street VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    notes TEXT,
    property_condition JSONB,
    next_knock_date TIMESTAMP WITH TIME ZONE,
    street_id UUID REFERENCES streets(id),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    address_type_id UUID REFERENCES address_types(id),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    notes TEXT,
    facebook VARCHAR(255),
    x VARCHAR(255),
    instagram VARCHAR(255),
    linkedin VARCHAR(255),
    cover_photo VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    contact_approval BOOLEAN DEFAULT false,
    contact_type_id UUID REFERENCES contact_types(id),
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS address_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address_id UUID NOT NULL REFERENCES addresses(id),
    contact_id UUID NOT NULL REFERENCES contacts(id),
    relationship_type VARCHAR(50) DEFAULT 'RESIDENT',
    is_primary BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(address_id, contact_id)
);

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address_id UUID REFERENCES addresses(id),
    contact_id UUID REFERENCES contacts(id),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    notes TEXT,
    metadata JSONB,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_type_id UUID NOT NULL REFERENCES opportunity_types(id),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    notes TEXT,
    collection_id UUID REFERENCES collections(id),
    created_by UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create form system tables
CREATE TABLE IF NOT EXISTS form_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    form_schema JSONB NOT NULL,
    version INT NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entity_form_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_definition_id UUID NOT NULL REFERENCES form_definitions(id),
    entity_type_id UUID REFERENCES entity_types(id),
    address_type_id UUID REFERENCES address_types(id),
    contact_type_id UUID REFERENCES contact_types(id),
    entity_subtype_id UUID REFERENCES entity_subtypes(id),
    opportunity_type_id UUID REFERENCES opportunity_types(id),
    auto_bypass_subtype BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_definition_id UUID NOT NULL REFERENCES form_definitions(id),
    form_version INT NOT NULL,
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    form_data JSONB NOT NULL,
    submitted_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create pulse system tables
CREATE TABLE IF NOT EXISTS collection_pulse (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES collections(id),
    pulse_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    metadata JSONB,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulse_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pulse_id UUID NOT NULL REFERENCES collection_pulse(id),
    google_drive_file_id VARCHAR(255),
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    thumbnail_url VARCHAR(255),
    metadata JSONB,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulse_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pulse_id UUID NOT NULL REFERENCES collection_pulse(id),
    google_drive_file_id VARCHAR(255),
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    metadata JSONB,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulse_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pulse_id UUID NOT NULL REFERENCES collection_pulse(id),
    google_email_id VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    recipients JSONB NOT NULL,
    body TEXT,
    has_attachments BOOLEAN DEFAULT false,
    metadata JSONB,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulse_email_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_id UUID NOT NULL REFERENCES pulse_emails(id),
    google_drive_file_id VARCHAR(255),
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INTEGER,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulse_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pulse_id UUID NOT NULL REFERENCES collection_pulse(id),
    google_task_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    completed BOOLEAN DEFAULT false,
    assigned_to UUID,
    metadata JSONB,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pulse_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pulse_id UUID NOT NULL REFERENCES collection_pulse(id),
    google_event_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    attendees JSONB,
    metadata JSONB,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create roles and engagement tables
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS engagement_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_view_level VARCHAR(50) NOT NULL DEFAULT 'SELF',
    default_edit_level VARCHAR(50) NOT NULL DEFAULT 'SELF',
    default_delete_level VARCHAR(50) NOT NULL DEFAULT 'NONE',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create users table (simplified for development)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'USER',
    department_id UUID REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert initial required data
INSERT INTO entity_types (id, display_name, parent_category) VALUES 
('d77d45e8-5769-4b1c-8bc0-5445a50cb1ea', 'Address', 'LOCATION'),
('e32e5d88-52e0-465a-b9cf-8c141e48c8e4', 'Contact', 'PERSON'),
('f35e9e3b-9c87-4b59-aa87-bb5c3a28d1e4', 'Opportunity', 'SALES');

INSERT INTO address_types (id, type_name, description) VALUES 
('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'Residential', 'Single family homes and residences'),
('b2c3d4e5-f6a5-4b5c-8d7e-9f0a1b2c3d4e', 'Commercial', 'Business and commercial properties');

INSERT INTO contact_types (id, type_name, description) VALUES 
('c3d4e5f6-a5b6-4c5d-8e7f-0a1b2c3d4e5f', 'Customer', 'Active or potential customer'),
('d4e5f6a5-b6c5-4d5e-8f7a-1b2c3d4e5f6a', 'Decision Maker', 'Primary decision-making contact');

INSERT INTO opportunity_types (id, name, description) VALUES 
('e5f6a5b6-c5d6-4e5f-8a7b-2c3d4e5f6a5b', 'Marketing Lead', 'Lead from marketing activities'),
('f6a5b6c5-d6e5-4f5a-8b7c-3d4e5f6a5b6c', 'Setter Lead', 'Lead from setter activities'),
('a5b6c5d6-e5f6-4a5b-8c7d-4e5f6a5b6c5d', 'Self Gen', 'Self-generated opportunity');

-- Create development user
INSERT INTO users (id, email, password_hash, first_name, last_name, role)
VALUES (
    'de56a5b6-f5e4-4d3c-8b2a-1c0d9e8f7a6b',
    'admin@example.com',
    '$2b$10$3euPcmQFCiblsZeEu5s7p.9wdgpt0CjcHiGDcEY1ohf9H.kc5NCfS', -- password is 'password'
    'Admin',
    'User',
    'ADMIN'
);