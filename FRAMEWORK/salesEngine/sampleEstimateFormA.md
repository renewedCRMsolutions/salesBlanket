-- Example: Creating a Roofing Product Configuration Form

-- First, let's insert a form definition for a roofing product
INSERT INTO public.form_definitions (
  organization_id,
  department_id,
  entity_type_id,
  name,
  description,
  form_schema,
  version,
  is_active,
  created_by
) VALUES (
  (SELECT id FROM public.organizations WHERE name = 'SalesBlanket'),
  (SELECT id FROM public.departments WHERE name LIKE '%Sales%' LIMIT 1),
  (SELECT id FROM public.entity_types WHERE display_name = 'opportunity'),
  'Roofing Product Configuration',
  'Dynamic form for configuring roofing products with measurements and options',
  '{
    "metadata": {
      "version": 1,
      "productType": "roofing",
      "calculationEnabled": true
    },
    "layout": {
      "type": "tabs",
      "tabs": [
        {
          "id": "measurements",
          "label": "Roof Measurements",
          "order": 1,
          "sections": [
            {
              "id": "roof_dims",
              "label": "Roof Dimensions",
              "fields": ["roof_type", "roof_squares", "roof_pitch", "measurement_method"]
            },
            {
              "id": "areas",
              "label": "Roof Areas",
              "fields": ["main_roof_area", "secondary_areas", "total_area"]
            }
          ]
        },
        {
          "id": "materials",
          "label": "Materials Selection",
          "order": 2,
          "sections": [
            {
              "id": "shingle_selection",
              "label": "Shingle Selection",
              "fields": ["shingle_type", "shingle_color", "shingle_warranty"]
            },
            {
              "id": "accessories",
              "label": "Accessories",
              "fields": ["ridge_vent", "ice_water_shield", "drip_edge", "underlayment"]
            }
          ]
        },
        {
          "id": "labor",
          "label": "Labor & Timeline",
          "order": 3,
          "sections": [
            {
              "id": "labor_details",
              "label": "Labor Details",
              "fields": ["tear_off_existing", "layers_to_remove", "disposal_method"]
            },
            {
              "id": "timeline",
              "label": "Project Timeline",
              "fields": ["estimated_days", "crew_size", "preferred_start_date"]
            }
          ]
        },
        {
          "id": "pricing",
          "label": "Pricing Summary",
          "order": 4,
          "sections": [
            {
              "id": "materials_cost",
              "label": "Materials Cost",
              "fields": ["materials_subtotal", "accessories_subtotal"]
            },
            {
              "id": "labor_cost",
              "label": "Labor Cost",
              "fields": ["labor_subtotal", "disposal_fee"]
            },
            {
              "id": "total",
              "label": "Project Total",
              "fields": ["project_subtotal", "tax", "project_total"]
            }
          ]
        }
      ]
    },
    "fields": {
      "roof_type": {
        "type": "select",
        "label": "Roof Type",
        "required": true,
        "options": ["Gable", "Hip", "Mansard", "Flat", "Shed", "Gambrel", "Dutch Hip", "Combination"],
        "default": "Gable"
      },
      "roof_squares": {
        "type": "number",
        "label": "Roof Squares",
        "description": "1 square = 100 square feet",
        "required": true,
        "min": 1,
        "step": 0.5
      },
      "roof_pitch": {
        "type": "select",
        "label": "Roof Pitch",
        "required": true,
        "options": ["Flat (0/12)", "2/12", "3/12", "4/12", "5/12", "6/12", "7/12", "8/12", "9/12", "10/12", "11/12", "12/12", "Steeper than 12/12"],
        "default": "6/12"
      },
      "measurement_method": {
        "type": "select",
        "label": "Measurement Method",
        "required": true,
        "options": ["Satellite", "Drone", "Manual", "Aerial Imagery"],
        "default": "Satellite"
      },
      "main_roof_area": {
        "type": "number",
        "label": "Main Roof Area (sq ft)",
        "required": true,
        "min": 100
      },
      "secondary_areas": {
        "type": "array",
        "label": "Additional Roof Sections",
        "itemTemplate": {
          "area_name": {
            "type": "text",
            "label": "Section Name",
            "required": true
          },
          "area_size": {
            "type": "number",
            "label": "Size (sq ft)",
            "required": true,
            "min": 1
          }
        },
        "addButtonText": "Add Roof Section",
        "maxItems": 5
      },
      "total_area": {
        "type": "calculated",
        "label": "Total Roof Area (sq ft)",
        "formula": "main_roof_area + SUM(secondary_areas[*].area_size)",
        "readonly": true
      },
      "shingle_type": {
        "type": "select",
        "label": "Shingle Type",
        "required": true,
        "options": [
          "3-Tab Asphalt", 
          "Architectural Asphalt", 
          "Luxury Asphalt", 
          "Metal Panels", 
          "Metal Shingles", 
          "Clay Tile", 
          "Concrete Tile",
          "Wood Shake",
          "Slate"
        ],
        "default": "Architectural Asphalt",
        "pricing": {
          "3-Tab Asphalt": 75,
          "Architectural Asphalt": 95,
          "Luxury Asphalt": 125,
          "Metal Panels": 175,
          "Metal Shingles": 195,
          "Clay Tile": 350,
          "Concrete Tile": 275,
          "Wood Shake": 325,
          "Slate": 450
        },
        "priceUnit": "per square"
      },
      "shingle_color": {
        "type": "dynamic_select",
        "label": "Shingle Color",
        "required": true,
        "dependsOn": "shingle_type",
        "options": {
          "3-Tab Asphalt": ["Black", "Gray", "Brown", "Green", "Blue", "Red"],
          "Architectural Asphalt": ["Charcoal", "Weathered Wood", "Slate", "Shadow Gray", "Barkwood", "Hunter Green", "Patriot Red"],
          "Luxury Asphalt": ["Majestic Navy", "Grand Sequoia", "Golden Harvest", "Antique Slate", "Charcoal"],
          "Metal Panels": ["Galvalume", "Forest Green", "Burnished Slate", "Colonial Red", "Copper Metallic"],
          "Metal Shingles": ["Classic Copper", "Weathered Zinc", "Rustic Brown", "Aged Bronze", "Charcoal"],
          "Clay Tile": ["Terracotta", "Sandstone", "Brown", "Classic Red"],
          "Concrete Tile": ["Slate Gray", "Terracotta Blend", "Weathered Brown", "Sierra Blend"],
          "Wood Shake": ["Natural Cedar", "Treated Pine", "Weathered Gray"],
          "Slate": ["Blue-Gray", "Green", "Purple", "Black", "Mottled", "Red"]
        }
      },
      "shingle_warranty": {
        "type": "dynamic_select",
        "label": "Warranty",
        "required": true,
        "dependsOn": "shingle_type",
        "options": {
          "3-Tab Asphalt": ["20-year", "25-year", "30-year"],
          "Architectural Asphalt": ["30-year", "Lifetime"],
          "Luxury Asphalt": ["Lifetime"],
          "Metal Panels": ["40-year", "50-year"],
          "Metal Shingles": ["Lifetime"],
          "Clay Tile": ["50-year", "Lifetime"],
          "Concrete Tile": ["50-year"],
          "Wood Shake": ["30-year", "40-year"],
          "Slate": ["75-year", "100-year", "Lifetime"]
        }
      },
      "ridge_vent": {
        "type": "boolean",
        "label": "Ridge Vent",
        "default": true,
        "price": 7.5,
        "priceUnit": "per linear foot"
      },
      "ice_water_shield": {
        "type": "boolean",
        "label": "Ice & Water Shield",
        "default": true,
        "price": 75,
        "priceUnit": "per square"
      },
      "drip_edge": {
        "type": "boolean",
        "label": "Drip Edge",
        "default": true,
        "price": 3.25,
        "priceUnit": "per linear foot"
      },
      "underlayment": {
        "type": "select",
        "label": "Underlayment",
        "required": true,
        "options": ["Standard Felt", "Synthetic", "Premium Synthetic"],
        "default": "Synthetic",
        "pricing": {
          "Standard Felt": 22,
          "Synthetic": 45,
          "Premium Synthetic": 65
        },
        "priceUnit": "per square"
      },
      "tear_off_existing": {
        "type": "boolean",
        "label": "Tear Off Existing Roof",
        "default": true
      },
      "layers_to_remove": {
        "type": "number",
        "label": "Layers to Remove",
        "required": true,
        "min": 1,
        "max": 3,
        "default": 1,
        "conditional": {
          "field": "tear_off_existing",
          "operator": "equals",
          "value": true
        },
        "price": 45,
        "priceUnit": "per square per layer"
      },
      "disposal_method": {
        "type": "select",
        "label": "Disposal Method",
        "required": true,
        "options": ["Dumpster", "Truck Haul-Away", "Customer Arranges Disposal"],
        "default": "Dumpster",
        "conditional": {
          "field": "tear_off_existing",
          "operator": "equals",
          "value": true
        },
        "pricing": {
          "Dumpster": 450,
          "Truck Haul-Away": 350,
          "Customer Arranges Disposal": 0
        },
        "priceUnit": "flat fee"
      },
      "estimated_days": {
        "type": "number",
        "label": "Estimated Days to Complete",
        "required": true,
        "min": 1,
        "max": 14,
        "default": 1,
        "calculated": {
          "formula": "CEIL(total_area / 1000)"
        }
      },
      "crew_size": {
        "type": "number",
        "label": "Crew Size",
        "required": true,
        "min": 2,
        "max": 10,
        "default": 4
      },
      "preferred_start_date": {
        "type": "date",
        "label": "Preferred Start Date",
        "required": true,
        "minDate": "now"
      },
      "materials_subtotal": {
        "type": "calculated",
        "label": "Materials Subtotal",
        "formula": "(roof_squares * shingle_type.price)",
        "displayAs": "currency",
        "readonly": true
      },
      "accessories_subtotal": {
        "type": "calculated",
        "label": "Accessories Subtotal",
        "formula": "(roof_squares * underlayment.price) + (ridge_vent ? (roof_squares * 10 * 7.5) : 0) + (ice_water_shield ? (roof_squares * 0.5 * 75) : 0) + (drip_edge ? (roof_squares * 10 * 3.25) : 0)",
        "displayAs": "currency",
        "readonly": true
      },
      "labor_subtotal": {
        "type": "calculated",
        "label": "Labor Subtotal",
        "formula": "tear_off_existing ? (layers_to_remove * roof_squares * 45) + (roof_squares * 85) : (roof_squares * 85)",
        "displayAs": "currency",
        "readonly": true
      },
      "disposal_fee": {
        "type": "calculated",
        "label": "Disposal Fee",
        "formula": "tear_off_existing ? disposal_method.price : 0",
        "displayAs": "currency",
        "readonly": true
      },
      "project_subtotal": {
        "type": "calculated",
        "label": "Project Subtotal",
        "formula": "materials_subtotal + accessories_subtotal + labor_subtotal + disposal_fee",
        "displayAs": "currency",
        "readonly": true
      },
      "tax": {
        "type": "calculated",
        "label": "Tax (6.5%)",
        "formula": "project_subtotal * 0.065",
        "displayAs": "currency",
        "readonly": true
      },
      "project_total": {
        "type": "calculated",
        "label": "Project Total",
        "formula": "project_subtotal + tax",
        "displayAs": "currency",
        "readonly": true
      }
    }
  }'::jsonb,
  1,
  true,
  (SELECT id FROM public.users LIMIT 1)
);

-- Now, let's create a new Sales Engine Item Type for roofing
INSERT INTO public.sales_engine_item_types (
  id,
  name,
  description,
  category,
  created_at,
  updated_at
) VALUES (
  public.uuid_generate_v4(),
  'Roofing Systems',
  'Complete roofing systems including materials and installation',
  'construction',
  now(),
  now()
);

-- Create a sample roofing product
INSERT INTO public.sales_engine_items (
  id,
  name,
  description,
  unit,
  is_active,
  display_type,
  item_type_id,
  created_by,
  form_definition_id,
  form_version,
  created_at,
  updated_at
) VALUES (
  public.uuid_generate_v4(),
  'Premium Architectural Shingle Roof System',
  'Complete roofing system with premium architectural shingles, underlayment, and accessories',
  'square',
  true,
  'configurable',
  (SELECT id FROM public.sales_engine_item_types WHERE name = 'Roofing Systems'),
  (SELECT id FROM public.users LIMIT 1),
  (SELECT id FROM public.form_definitions WHERE name = 'Roofing Product Configuration'),
  1,
  now(),
  now()
);

-- Link the form to the item type
INSERT INTO public.item_type_forms (
  item_type_id,
  form_definition_id,
  is_default,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM public.sales_engine_item_types WHERE name = 'Roofing Systems'),
  (SELECT id FROM public.form_definitions WHERE name = 'Roofing Product Configuration'),
  true,
  now(),
  now()
);

-- Let's now link some estimate components to the Roofing Systems item type
INSERT INTO public.item_type_components (
  item_type_id,
  component_id,
  is_required,
  display_order,
  created_at,
  updated_at
) VALUES
(
  (SELECT id FROM public.sales_engine_item_types WHERE name = 'Roofing Systems'),
  (SELECT id FROM public.estimate_components WHERE name = 'Standard Line Items'),
  true,
  1,
  now(),
  now()
),
(
  (SELECT id FROM public.sales_engine_item_types WHERE name = 'Roofing Systems'),
  (SELECT id FROM public.estimate_components WHERE name = 'Labor Costs'),
  true,
  2,
  now(),
  now()
),
(
  (SELECT id FROM public.sales_engine_item_types WHERE name = 'Roofing Systems'),
  (SELECT id FROM public.estimate_components WHERE name = 'Photo Gallery'),
  false,
  3,
  now(),
  now()
),
(
  (SELECT id FROM public.sales_engine_item_types WHERE name = 'Roofing Systems'),
  (SELECT id FROM public.estimate_components WHERE name = 'Customer Approval'),
  true,
  4,
  now(),
  now()
);