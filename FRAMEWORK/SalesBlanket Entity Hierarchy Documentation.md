# SalesBlanket Entity Hierarchy Documentation

Entity Structure Overview
SalesBlanket uses a flexible, hierarchical entity structure that allows for detailed classification and organization of business data. The system supports multiple primary entity types with the ability to expand as business needs evolve.
Core Entities
Primary Entities

Addresses: Geographic locations associated with collections
Contacts: People or organizations related to addresses
Opportunities: Sales or business opportunities related to addresses/contacts
(Extensible - new entity types can be added as needed)

Entity Types
Each primary entity has corresponding types:

Address Types: Residential, Commercial, Investment Property, etc.
Contact Types: Customer, Insurance, Supplier, Attorney, Marketing, etc.
Opportunity Types: Retail, Insurance, Commercial, etc.

Entity Subtypes Examples
Subtypes provide a finer level of classification:

Address Subtypes: (by Address Type)

Residential: Single Family, Multi-Family, Condominium, Townhouse, etc.
Commercial: Retail, Office, Industrial, Healthcare, etc.


Contact Subtypes: (by Contact Type)

Customer: Decision Maker, Tenant, Spouse, Influencer
Insurance: Adjuster, Agent, Claims Manager
Supplier: SRS, Materials Provider, Subcontractor
Attorney: Plaintiff, Defense, Mediation
Marketing: Referral Partner, Affiliate, Lead Source

Opportunity Subtypes: (Work Types)

Roof, Gutters, Siding, Windows, Solar, Insulation, etc.

Entity Relationships

Collections

Collections serve as containers that group related entities together (addresses, contacts, opportunities).
Entity-Type Relationships

Entities have a direct relationship to their type (one-to-one)
Example: An address is of one specific address type (Residential, Commercial, etc.)

Entity-Subtype Relationships

Entities can have multiple subtypes (many-to-many)
Example: An opportunity can include multiple work types (Roof, Gutters, and Siding)

Opportunity Structure
Opportunity
  |
  |-- Opportunity Type (Retail, Insurance, Commercial)
  |
  |-- Opportunity Work Types [many-to-many]
  |     |
  |     |-- Work Type (Roof, Gutters, Siding)
  |
  |-- Measurements [by work type]
        |
        |-- Roof Measurements (square footage, pitch, etc.)
        |-- Gutter Measurements (linear feet, etc.)
        |-- Siding Measurements (square footage, etc.)

Database Structure

Entity Types Tables

entity_types
address_types
contact_types
opportunity_types

Entity Subtypes

entity_subtypes
  id: UUID
  name: VARCHAR
  description: TEXT
  entity_type_id: UUID (references entity_types)
  parent_type_id: UUID (references the appropriate parent type table)
  is_active: BOOLEAN
  settings: JSONB
  created_at: TIMESTAMP
  updated_at: TIMESTAMP

Entity-Subtype Assignment (Junction Tables)

entity_subtype_assignments
  id: UUID
  entity_id: UUID
  entity_type_id: UUID
  entity_subtype_id: UUID
  is_primary: BOOLEAN
  created_at: TIMESTAMP
  updated_at: TIMESTAMP

opportunity_type_work_types
  id: UUID
  opportunity_type_id: UUID
  work_type_id: UUID (references entity_subtypes)
  is_active: BOOLEAN
  created_at: TIMESTAMP
  updated_at: TIMESTAMP

opportunity_work_types
  id: UUID
  opportunity_id: UUID
  work_type_id: UUID (references entity_subtypes)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP

Form System Integration

The entity subtype system integrates with the form system, allowing forms to be targeted to specific entity subtypes:
form_definitions
  ...
  entity_type_id: UUID
  entity_subtype_id: UUID (references entity_subtypes)
  ...
This allows for:

Generic forms for entity types (all addresses)
Specific forms for parent types (residential addresses)
Highly specific forms for subtypes (single-family residential addresses)

Example: Opportunity with Multiple Work Types
An insurance claim opportunity for storm damage might include:

Entity: Opportunity record
Type: Insurance Claim
Subtypes (Work Types):

Roof Repair
Gutter Replacement
Siding Repair

Measurements:

Roof: 2,500 sq ft, 6:12 pitch
Gutters: 150 linear feet
Siding: 1,800 sq ft on west and north walls

Each subtype (work type) can have its own specific form, pricing model, and workflow while still being part of a unified opportunity.
Key Benefits

Flexibility: Entities can belong to multiple subtypes without complex hierarchies
Fine-grained Classification: Target forms, workflows, and processes to specific subtypes

Dynamic Forms: Forms adapt based on entity type and subtypes

Extensibility: Easy to add new entity types and subtypes as business needs evolve
Integrated Workflow: Subtypes drive estimates, form selection, and business processes