# form creation

1. create the form category

INSERT INTO public.form_categories (
  id,
  name,
  description,
  is_active,
  created_at
) VALUES (
  uuid_generate_v4(),
  'Property Condition',
  'Forms for capturing property condition information for addresses',
  true,
  now()
);

2. Create the form_definition 

INSERT INTO public.form_definitions (
  id,
  name,
  description,
  entity_type_id,
  category_id,
  form_level,
  form_schema,
  version,
  is_active,
  auto_versioning,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  'Address Property Condition',
  'Form for capturing detailed property condition information',
  (SELECT id FROM public.entity_types WHERE display_name = 'Address'), -- Get entity type ID for Address
  (SELECT id FROM public.form_categories WHERE name = 'Property Condition'), -- Get the category ID we just created
  'TYPE',
  '{
    "metadata": {
      "version": 1,
      "formType": "address",
      "subtype": "property_condition_form"
    },
    "layout": {
      "type": "sections",
      "sections": [
        {
          "id": "property_exterior",
          "label": "Property Exterior Condition",
          "order": 1,
          "fields": ["roof_condition", "steep_roof", "siding_condition", "gutter_condition", "ice_dam"]
        }
      ]
    },
    "fields": {
      "roof_condition": {
        "type": "select",
        "label": "Roof Condition",
        "required": true,
        "default": "select_condition",
        "options": [
          {"value": "select_condition", "label": "Select Condition", "disabled": true},
          {"value": "severe", "label": "Severe Damage"},
          {"value": "old", "label": "Old"},
          {"value": "new", "label": "New"},
          {"value": "missing_shingles", "label": "Missing Shingles"}
        ]
      },
      "steep_roof": {
        "type": "select",
        "label": "Steep Roof",
        "required": true,
        "default": "select_condition",
        "options": [
          {"value": "select_condition", "label": "Select Option", "disabled": true},
          {"value": "yes", "label": "Yes"},
          {"value": "no", "label": "No"}
        ]
      },
      "siding_condition": {
        "type": "select",
        "label": "Siding Condition",
        "required": true,
        "default": "select_condition",
        "options": [
          {"value": "select_condition", "label": "Select Condition", "disabled": true},
          {"value": "old", "label": "Old"},
          {"value": "new", "label": "New"},
          {"value": "missing_siding", "label": "Missing Siding"}
        ]
      },
      "gutter_condition": {
        "type": "select",
        "label": "Gutter Condition",
        "required": true,
        "default": "select_condition",
        "options": [
          {"value": "select_condition", "label": "Select Condition", "disabled": true},
          {"value": "falling_down", "label": "Falling Down"},
          {"value": "old", "label": "Old"},
          {"value": "new", "label": "New"}
        ]
      },
      "ice_dam": {
        "type": "select",
        "label": "Ice Dam",
        "required": true,
        "default": "select_condition",
        "options": [
          {"value": "select_condition", "label": "Select Option", "disabled": true},
          {"value": "yes", "label": "Yes"},
          {"value": "no", "label": "No"}
        ]
      }
    }
  }'::jsonb,
  1,
  true,
  true,
  now(),
  now()
);

3. Create an initial form version

-- Create initial form version record
INSERT INTO public.form_versions (
  id,
  form_definition_id,
  version,
  form_schema,
  created_at
) VALUES (
  uuid_generate_v4(),
  (SELECT id FROM public.form_definitions WHERE name = 'Address Property Condition'), -- Get the form definition ID
  1,
  (SELECT form_schema FROM public.form_definitions WHERE name = 'Address Property Condition'),
  now()
);

