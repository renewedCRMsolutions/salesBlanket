# Dynamic Entity Card System Architecture

Overview
The dynamic entity card system allows different card types to render content specific to various entity types, while maintaining visual consistency across the application.

Table Structure
Key Tables

Table	Purpose
entities	Base table storing core entity data with type reference
entity_types	Defines different types of entities in the system
entity_cards	Defines card styles and rendering templates
entity_card_layout	Maps entity types to card types with display rules

Enhanced Schema
sql

-- Add content template to entity_cards
ALTER TABLE entity_cards
ADD COLUMN content_template JSONB;

-- Add field mappings to entity_card_layout
ALTER TABLE entity_card_layout
ADD COLUMN field_mappings JSONB;
How It Works
Define Card Types
Create different card types in entity_cards with visual styles
Add content templates defining how data should be displayed
Configure Layouts Per Entity Type
For each entity type, specify which cards to display
Set display order for consistent appearance
Define field mappings between entity data and card template
Dynamic Rendering
When loading entities, query appropriate card layouts
Apply field mappings to transform entity data
Render cards using the content templates
Example Content Template
json
{
  "sections": [
    {
      "type": "header",
      "fields": ["name", "status"]
    },
    {
      "type": "details",
      "fields": ["description", "created_at"]
    },
    {
      "type": "custom",
      "entitySpecific": true
    }
  ]
}
Example Field Mappings
json
{
  "address": {
    "name": "street",
    "description": "metadata.notes",
    "custom": ["city", "state", "postal_code"]
  },
  "contact": {
    "name": "first_name + last_name",
    "description": "metadata.bio",
    "custom": ["email", "phone"]
  },
  "opportunity": {
    "name": "title",
    "description": "metadata.details",
    "custom": ["value", "probability"]
  }
}
Benefits
Consistent UI: Cards maintain visual consistency across entity types
Flexible Content: Entity-specific data displayed appropriately
Extensible: Add new entity types without changing card rendering code
Configurable: Adjust layouts and mappings without code changes
