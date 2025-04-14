# Opportunities

-- Example update to an opportunity_type record:
UPDATE public.opportunity_types
SET settings = '{
  "form_fields": [
    {
      "field_id": "potential_value",
      "label": "Potential Value",
      "type": "currency",
      "required": true,
      "default": null,
      "order": 1
    },
    {
      "field_id": "timeframe",
      "label": "Expected Timeframe",
      "type": "select",
      "options": ["0-3 months", "3-6 months", "6-12 months", "12+ months"],
      "required": true,
      "default": "3-6 months",
      "order": 2
    }
  ]
}'::jsonb
WHERE name = 'Sales Lead';
Form Layout
The opportunity form would have:

Standard Fields (from the opportunities table):

H1: "New Opportunity"
opportunity_type_id (dropdown, required) - populated from opportunity_types where is_active=true
status (dropdown, default "ACTIVE") - could have options like "ACTIVE", "CLOSED", "PENDING"
notes (text area, optional)

Dynamic Fields (loaded from opportunity_types.settings after type selection):

These would be rendered based on the JSON configuration in the selected opportunity type

Metadata Storage:

When submitted, the dynamic field values would be stored in the opportunities.metadata JSONB field

Opportunity Form Implementation
To implement this:

The frontend would start with the standard fields
When a user selects an opportunity_type_id, it would fetch the settings for that type
The form would dynamically render additional fields based on the settings
On submit, all standard fields go to their respective columns, and dynamic fields go to the metadata JSONB

Database Modification
You might want to add an additional field to the opportunities table:

Add a field to store the dynamic form data version for backward compatibility
ALTER TABLE public.opportunities

ADD COLUMN form_version integer NOT NULL DEFAULT 1;
This allows you to track which version of the dynamic form was used to create each record, so you can handle form evolution over time.
Adding a Table for Form Templates

For more structural consistency, you could create a new table:
sqlCREATE TABLE public.opportunity_forms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_type_id uuid NOT NULL REFERENCES public.opportunity_types(id),
  version integer NOT NULL DEFAULT 1,
  form_schema jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(opportunity_type_id, version)
);
This approach would let you:

Have multiple versions of forms for each opportunity type
Maintain a history of form changes
More efficiently query for form definitions

Next Steps

Define your opportunity types: Create records in the opportunity_types table with the settings field structured as shown above
Create the frontend form component: Build a component that can render form fields dynamically based on the JSON configuration
Implement data saving: When a form is submitted, save standard fields to their columns and dynamic fields to the metadata JSONB