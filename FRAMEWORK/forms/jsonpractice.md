-- Now create the Address Type Selection Form with all address types
DO $$
DECLARE
    address_entity_type_id UUID;
    residential_type_id UUID;
    commercial_type_id UUID;
    investment_type_id UUID;
    rental_type_id UUID;
    vacation_type_id UUID;
    storage_type_id UUID;
BEGIN
    -- Get entity type ID
    SELECT id INTO address_entity_type_id FROM entity_types WHERE display_name = 'Address';
    
    IF address_entity_type_id IS NULL THEN
        RAISE EXCEPTION 'Address entity type not found';
    END IF;
    
    -- Get address type IDs
    SELECT id INTO residential_type_id FROM address_types WHERE display_name = 'Residential';
    SELECT id INTO commercial_type_id FROM address_types WHERE display_name = 'Commercial';
    SELECT id INTO investment_type_id FROM address_types WHERE display_name = 'Investment Property';
    SELECT id INTO rental_type_id FROM address_types WHERE display_name = 'Rental Property';
    SELECT id INTO vacation_type_id FROM address_types WHERE display_name = 'Vacation Home';
    SELECT id INTO storage_type_id FROM address_types WHERE display_name = 'Storage';
    
    -- 1. Address Type Selection Form
    INSERT INTO form_definitions (
        id,
        name,
        description,
        entity_type_id,
        form_level,
        form_schema,
        version,
        is_active,
        is_public,
        auto_versioning,
        created_at,
        updated_at,
        metadata
    ) VALUES (
        uuid_generate_v4(),
        'Address Type Selection',
        'Initial form to select address type',
        address_entity_type_id,
        'BASE',
        jsonb_build_object(
            'metadata', jsonb_build_object(
                'version', 1,
                'formType', 'address',
                'isTypeSelection', true
            ),
            'layout', jsonb_build_object(
                'type', 'sections',
                'sections', jsonb_build_array(
                    jsonb_build_object(
                        'id', 'address_type_selection',
                        'label', 'Address Type',
                        'order', 1,
                        'fields', jsonb_build_array('address_type_id')
                    )
                )
            ),
            'fields', jsonb_build_object(
                'address_type_id', jsonb_build_object(
                    'type', 'select',
                    'label', 'Address Type',
                    'required', true,
                    'options', jsonb_build_array(
                        jsonb_build_object('label', '-- Select Address Type --', 'value', '', 'disabled', true),
                        jsonb_build_object('label', 'Residential', 'value', residential_type_id),
                        jsonb_build_object('label', 'Commercial', 'value', commercial_type_id),
                        jsonb_build_object('label', 'Investment Property', 'value', investment_type_id),
                        jsonb_build_object('label', 'Rental Property', 'value', rental_type_id),
                        jsonb_build_object('label', 'Vacation Home', 'value', vacation_type_id),
                        jsonb_build_object('label', 'Storage', 'value', storage_type_id)
                    ),
                    'triggerFormLoad', true
                )
            )
        ),
        1,
        true,
        false,
        true,
        now(),
        now(),
        '{"icon": "home", "formType": "address", "isTypeSelection": true}'::jsonb
    );
    
    -- 2. Residential Address Form
    -- Note: Using entity_subtype_id instead of parent_type_id based on schema
    INSERT INTO form_definitions (
        id,
        name,
        description,
        entity_type_id,
        entity_subtype_id, -- Changed from parent_type_id
        form_level,
        form_schema,
        version,
        is_active,
        is_public,
        auto_versioning,
        created_at,
        updated_at,
        metadata
    ) VALUES (
        uuid_generate_v4(),
        'Residential Address Form',
        'Form for residential addresses',
        address_entity_type_id,
        residential_type_id,
        'TYPE',
        jsonb_build_object(
            'metadata', jsonb_build_object(
                'version', 1,
                'formType', 'address',
                'addressType', 'residential'
            ),
            'layout', jsonb_build_object(
                'type', 'sections',
                'sections', jsonb_build_array(
                    jsonb_build_object(
                        'id', 'location_info',
                        'label', 'Location Information',
                        'order', 1,
                        'fields', jsonb_build_array('street', 'address_line_2', 'city', 'state', 'postal_code')
                    ),
                    jsonb_build_object(
                        'id', 'residence_details',
                        'label', 'Residence Details',
                        'order', 2,
                        'fields', jsonb_build_array('display_name', 'year_built', 'square_footage', 'bedrooms', 'bathrooms', 'has_garage')
                    ),
                    jsonb_build_object(
                        'id', 'notes_section',
                        'label', 'Notes',
                        'order', 3,
                        'fields', jsonb_build_array('notes')
                    )
                )
            ),
            'fields', jsonb_build_object(
                'street', jsonb_build_object(
                    'type', 'text',
                    'label', 'Street Address',
                    'required', true
                ),
                'address_line_2', jsonb_build_object(
                    'type', 'text',
                    'label', 'Address Line 2',
                    'required', false
                ),
                'city', jsonb_build_object(
                    'type', 'text',
                    'label', 'City',
                    'required', true
                ),
                'state', jsonb_build_object(
                    'type', 'text',
                    'label', 'State/Province',
                    'required', true
                ),
                'postal_code', jsonb_build_object(
                    'type', 'text',
                    'label', 'Postal Code',
                    'required', true
                ),
                'display_name', jsonb_build_object(
                    'type', 'text',
                    'label', 'Display Name',
                    'required', false,
                    'help', 'Optional name to identify this address (e.g., "Smith Residence")'
                ),
                'year_built', jsonb_build_object(
                    'type', 'number',
                    'label', 'Year Built',
                    'required', false,
                    'minimum', 1800,
                    'maximum', 2025
                ),
                'square_footage', jsonb_build_object(
                    'type', 'number',
                    'label', 'Square Footage',
                    'required', false,
                    'minimum', 0
                ),
                'bedrooms', jsonb_build_object(
                    'type', 'number',
                    'label', 'Bedrooms',
                    'required', false,
                    'minimum', 0
                ),
                'bathrooms', jsonb_build_object(
                    'type', 'number',
                    'label', 'Bathrooms',
                    'required', false,
                    'minimum', 0
                ),
                'has_garage', jsonb_build_object(
                    'type', 'boolean',
                    'label', 'Has Garage',
                    'required', false,
                    'default', false
                ),
                'notes', jsonb_build_object(
                    'type', 'textarea',
                    'label', 'Notes',
                    'required', false
                )
            )
        ),
        1,
        true,
        false,
        true,
        now(),
        now(),
        '{"icon": "home", "formType": "address", "addressType": "residential"}'::jsonb
    );
    
    -- 3. Commercial Address Form
    INSERT INTO form_definitions (
        id,
        name,
        description,
        entity_type_id,
        entity_subtype_id,
        form_level,
        form_schema,
        version,
        is_active,
        is_public,
        auto_versioning,
        created_at,
        updated_at,
        metadata
    ) VALUES (
        uuid_generate_v4(),
        'Commercial Address Form',
        'Form for commercial addresses',
        address_entity_type_id,
        commercial_type_id,
        'TYPE',
        '{
            "metadata": {
                "version": 1,
                "formType": "address",
                "addressType": "commercial"
            },
            "layout": {
                "type": "sections",
                "sections": [
                    {
                        "id": "location_info",
                        "label": "Location Information",
                        "order": 1,
                        "fields": ["street", "address_line_2", "city", "state", "postal_code"]
                    },
                    {
                        "id": "property_details",
                        "label": "Property Details",
                        "order": 2,
                        "fields": ["display_name", "business_name", "property_type", "square_footage", "number_of_floors", "year_built", "has_garage"]
                    },
                    {
                        "id": "contact_info",
                        "label": "Contact Information",
                        "order": 3,
                        "fields": ["business_phone", "business_hours", "property_manager"]
                    },
                    {
                        "id": "notes_section",
                        "label": "Notes",
                        "order": 4,
                        "fields": ["notes"]
                    }
                ]
            },
            "fields": {
                "street": {
                    "type": "text",
                    "label": "Street Address",
                    "required": true
                },
                "address_line_2": {
                    "type": "text",
                    "label": "Suite/Unit",
                    "required": false
                },
                "city": {
                    "type": "text",
                    "label": "City",
                    "required": true
                },
                "state": {
                    "type": "text",
                    "label": "State/Province",
                    "required": true
                },
                "postal_code": {
                    "type": "text",
                    "label": "Postal Code",
                    "required": true
                },
                "display_name": {
                    "type": "text",
                    "label": "Display Name",
                    "required": false,
                    "help": "Optional name to identify this address (e.g., \"Downtown Office\")"
                },
                "business_name": {
                    "type": "text",
                    "label": "Business Name",
                    "required": true
                },
                "property_type": {
                    "type": "select",
                    "label": "Property Type",
                    "required": true,
                    "options": [
                        {"label": "Retail", "value": "retail"},
                        {"label": "Office", "value": "office"},
                        {"label": "Industrial", "value": "industrial"},
                        {"label": "Mixed-Use", "value": "mixed_use"},
                        {"label": "Healthcare", "value": "healthcare"},
                        {"label": "Hospitality", "value": "hospitality"},
                        {"label": "Other", "value": "other"}
                    ]
                },
                "square_footage": {
                    "type": "number",
                    "label": "Square Footage",
                    "required": false,
                    "minimum": 0
                },
                "number_of_floors": {
                    "type": "number",
                    "label": "Number of Floors",
                    "required": false,
                    "minimum": 1
                },
                "year_built": {
                    "type": "number",
                    "label": "Year Built",
                    "required": false,
                    "minimum": 1800,
                    "maximum": 2025
                },
                "has_garage": {
                    "type": "boolean",
                    "label": "Has Garage",
                    "required": false,
                    "default": false
                },
                "business_phone": {
                    "type": "text",
                    "label": "Business Phone",
                    "required": false
                },
                "business_hours": {
                    "type": "text",
                    "label": "Business Hours",
                    "required": false
                },
                "property_manager": {
                    "type": "text",
                    "label": "Property Manager",
                    "required": false
                },
                "notes": {
                    "type": "textarea",
                    "label": "Notes",
                    "required": false
                }
            }
        }'::jsonb,
        1,
        true,
        false,
        true,
        now(),
        now(),
        '{"icon": "building", "formType": "address", "addressType": "commercial"}'::jsonb
    );
    
    -- 4. Investment Property Form
    INSERT INTO form_definitions (
        id,
        name,
        description,
        entity_type_id,
        entity_subtype_id,
        form_level,
        form_schema,
        version,
        is_active,
        is_public,
        auto_versioning,
        created_at,
        updated_at,
        metadata
    ) VALUES (
        uuid_generate_v4(),
        'Investment Property Form',
        'Form for investment properties',
        address_entity_type_id,
        investment_type_id,
        'TYPE',
        '{
            "metadata": {
                "version": 1,
                "formType": "address",
                "addressType": "investment"
            },
            "layout": {
                "type": "sections",
                "sections": [
                    {
                        "id": "location_info",
                        "label": "Location Information",
                        "order": 1,
                        "fields": ["street", "address_line_2", "city", "state", "postal_code"]
                    },
                    {
                        "id": "property_details",
                        "label": "Property Details",
                        "order": 2,
                        "fields": ["display_name", "year_built", "square_footage", "bedrooms", "bathrooms", "has_garage"]
                    },
                    {
                        "id": "investment_details",
                        "label": "Investment Details",
                        "order": 3,
                        "fields": ["investment_purchase_date", "investment_purchase_price", "investment_current_value", "is_rented"]
                    },
                    {
                        "id": "notes_section",
                        "label": "Notes",
                        "order": 4,
                        "fields": ["notes"]
                    }
                ]
            },
            "fields": {
                "street": {
                    "type": "text",
                    "label": "Street Address",
                    "required": true
                },
                "address_line_2": {
                    "type": "text",
                    "label": "Address Line 2",
                    "required": false
                },
                "city": {
                    "type": "text",
                    "label": "City",
                    "required": true
                },
                "state": {
                    "type": "text",
                    "label": "State/Province",
                    "required": true
                },
                "postal_code": {
                    "type": "text",
                    "label": "Postal Code",
                    "required": true
                },
                "display_name": {
                    "type": "text",
                    "label": "Display Name",
                    "required": false
                },
                "year_built": {
                    "type": "number",
                    "label": "Year Built",
                    "required": false,
                    "minimum": 1800,
                    "maximum": 2025
                },
                "square_footage": {
                    "type": "number",
                    "label": "Square Footage",
                    "required": false,
                    "minimum": 0
                },
                "bedrooms": {
                    "type": "number",
                    "label": "Bedrooms",
                    "required": false,
                    "minimum": 0
                },
                "bathrooms": {
                    "type": "number",
                    "label": "Bathrooms",
                    "required": false,
                    "minimum": 0
                },
                "has_garage": {
                    "type": "boolean",
                    "label": "Has Garage",
                    "required": false,
                    "default": false
                },
                "investment_purchase_date": {
                    "type": "date",
                    "label": "Purchase Date",
                    "required": false
                },
                "investment_purchase_price": {
                    "type": "currency",
                    "label": "Purchase Price",
                    "required": false
                },
                "investment_current_value": {
                    "type": "currency",
                    "label": "Current Value",
                    "required": false
                },
                "is_rented": {
                    "type": "boolean",
                    "label": "Currently Rented",
                    "required": false,
                    "default": false
                },
                "notes": {
                    "type": "textarea",
                    "label": "Notes",
                    "required": false
                }
            }
        }'::jsonb,
        1,
        true,
        false,
        true,
        now(),
        now(),
        '{"icon": "dollar-sign", "formType": "address", "addressType": "investment"}'::jsonb
    );
    
    -- 5. Rental Property Form
    INSERT INTO form_definitions (
        id,
        name,
        description,
        entity_type_id,
        entity_subtype_id,
        form_level,
        form_schema,
        version,
        is_active,
        is_public,
        auto_versioning,
        created_at,
        updated_at,
        metadata
    ) VALUES (
        uuid_generate_v4(),
        'Rental Property Form',
        'Form for rental properties',
        address_entity_type_id,
        rental_type_id,
        'TYPE',
        '{
            "metadata": {
                "version": 1,
                "formType": "address",
                "addressType": "rental"
            },
            "layout": {
                "type": "sections",
                "sections": [
                    {
                        "id": "location_info",
                        "label": "Location Information",
                        "order": 1,
                        "fields": ["street", "address_line_2", "city", "state", "postal_code"]
                    },
                    {
                        "id": "property_details",
                        "label": "Property Details",
                        "order": 2,
                        "fields": ["display_name", "year_built", "square_footage", "bedrooms", "bathrooms", "has_garage"]
                    },
                    {
                        "id": "rental_details",
                        "label": "Rental Details",
                        "order": 3,
                        "fields": ["rental_income", "rental_term", "lease_expiration", "tenant_contact_id"]
                    },
                    {
                        "id": "notes_section",
                        "label": "Notes",
                        "order": 4,
                        "fields": ["notes"]
                    }
                ]
            },
            "fields": {
                "street": {
                    "type": "text",
                    "label": "Street Address",
                    "required": true
                },
                "address_line_2": {
                    "type": "text",
                    "label": "Address Line 2",
                    "required": false
                },
                "city": {
                    "type": "text",
                    "label": "City",
                    "required": true
                },
                "state": {
                    "type": "text",
                    "label": "State/Province",
                    "required": true
                },
                "postal_code": {
                    "type": "text",
                    "label": "Postal Code",
                    "required": true
                },
                "display_name": {
                    "type": "text",
                    "label": "Display Name",
                    "required": false
                },
                "year_built": {
                    "type": "number",
                    "label": "Year Built",
                    "required": false,
                    "minimum": 1800,
                    "maximum": 2025
                },
                "square_footage": {
                    "type": "number",
                    "label": "Square Footage",
                    "required": false,
                    "minimum": 0
                },
                "bedrooms": {
                    "type": "number",
                    "label": "Bedrooms",
                    "required": false,
                    "minimum": 0
                },
                "bathrooms": {
                    "type": "number",
                    "label": "Bathrooms",
                    "required": false,
                    "minimum": 0
                },
                "has_garage": {
                    "type": "boolean",
                    "label": "Has Garage",
                    "required": false,
                    "default": false
                },
                "rental_income": {
                    "type": "currency",
                    "label": "Monthly Rental Income",
                    "required": false
                },
                "rental_term": {
                    "type": "select",
                    "label": "Rental Term",
                    "required": false,
                    "options": [
                        {"label": "Month-to-Month", "value": "month_to_month"},
                        {"label": "6 Month", "value": "six_month"},
                        {"label": "1 Year", "value": "one_year"},
                        {"label": "2 Year", "value": "two_year"},
                        {"label": "Other", "value": "other"}
                    ]
                },
                "lease_expiration": {
                    "type": "date",
                    "label": "Lease Expiration Date",
                    "required": false
                },
                "tenant_contact_id": {
                    "type": "entity_selector",
                    "label": "Tenant",
                    "required": false,
                    "entityType": "contact"
                },
                "notes": {
                    "type": "textarea",
                    "label": "Notes",
                    "required": false
                }
            }
        }'::jsonb,
        1,
        true,
        false,
        true,
        now(),
        now(),
        '{"icon": "key", "formType": "address", "addressType": "rental"}'::jsonb
    );
    
    -- 6. Vacation Home Form
    INSERT INTO form_definitions (
        id,
        name,
        description,
        entity_type_id,
        entity_subtype_id,
        form_level,
        form_schema,
        version,
        is_active,
        is_public,
        auto_versioning,
        created_at,
        updated_at,
        metadata
    ) VALUES (
        uuid_generate_v4(),
        'Vacation Home Form',
        'Form for vacation homes',
        address_entity_type_id,
        vacation_type_id,
        'TYPE',
        '{
            "metadata": {
                "version": 1,
                "formType": "address",
                "addressType": "vacation"
            },
            "layout": {
                "type": "sections",
                "sections": [
                    {
                        "id": "location_info",
                        "label": "Location Information",
                        "order": 1,
                        "fields": ["street", "address_line_2", "city", "state", "postal_code"]
                    },
                    {
                        "id": "property_details",
                        "label": "Property Details",
                        "order": 2,
                        "fields": ["display_name", "year_built", "square_footage", "bedrooms", "bathrooms", "has_garage"]
                    },
                    {
                        "id": "vacation_details",
                        "label": "Vacation Home Details",
                        "order": 3,
                        "fields": ["vacation_season", "vacation_amenities"]
                    },
                    {
                        "id": "notes_section",
                        "label": "Notes",
                        "order": 4,
                        "fields": ["notes"]
                    }
                ]
            },
            "fields": {
                "street": {
                    "type": "text",
                    "label": "Street Address",
                    "required": true
                },
                "address_line_2": {
                    "type": "text",
                    "label": "Address Line 2",
                    "required": false
                },
                "city": {
                    "type": "text",
                    "label": "City",
                    "required": true
                },
                "state": {
                    "type": "text",
                    "label": "State/Province",
                    "required": true
                },
                "postal_code": {
                    "type": "text",
                    "label": "Postal Code",
                    "required": true
                },
                "display_name": {
                    "type": "text",
                    "label": "Display Name",
                    "required": false
                },
                "year_built": {
                    "type": "number",
                    "label": "Year Built",
                    "required": false,
                    "minimum": 1800,
                    "maximum": 2025
                },
                "square_footage": {
                    "type": "number",
                    "label": "Square Footage",
                    "required": false,
                    "minimum": 0
                },
                "bedrooms": {
                    "type": "number",
                    "label": "Bedrooms",
                    "required": false,
                    "minimum": 0
                },
                "bathrooms": {
                    "type": "number",
                    "label": "Bathrooms",
                    "required": false,
                    "minimum": 0
                },
                "has_garage": {
                    "type": "boolean",
                    "label": "Has Garage",
                    "required": false,
                    "default": false
                },
                "vacation_season": {
                    "type": "select",
                    "label": "Primary Season",
                    "required": false,
                    "options": [
                        {"label": "Year-Round", "value": "year_round"},
                        {"label": "Summer", "value": "summer"},
                        {"label": "Winter", "value": "winter"},
                        {"label": "Spring", "value": "spring"},
                        {"label": "Fall", "value": "fall"}
                    ]
                },
                "vacation_amenities": {
                    "type": "multi_select",
                    "label": "Amenities",
                    "required": false,
                    "options": [
                        {"label": "Pool", "value": "pool"},
                        {"label": "Hot Tub", "value": "hot_tub"},
                        {"label": "Fireplace", "value": "fireplace"},
                        {"label": "Deck/Patio", "value": "deck_patio"},
                        {"label": "Beach Access", "value": "beach_access"},
                        {"label": "Ski Access", "value": "ski_access"},
                        {"label": "Lake Access", "value": "lake_access"},
                        {"label": "Mountain View", "value": "mountain_view"},
                        {"label": "Water View", "value": "water_view"},
                        {"label": "Gated Community", "value": "gated_community"}
                    ]
                },
                "notes": {
                    "type": "textarea",
                    "label": "Notes",
                    "required": false
                }
            }
        }'::jsonb,
        1,
        true,
        false,
        true,
        now(),
        now(),
        '{"icon": "umbrella-beach", "formType": "address", "addressType": "vacation"}'::jsonb
    );
    
    -- 7. Storage Form
    INSERT INTO form_definitions (
        id,
        name,
        description,
        entity_type_id,
        entity_subtype_id,
        form_level,
        form_schema,
        version,
        is_active,
        is_public,
        auto_versioning,
        created_at,
        updated_at,
        metadata
    ) VALUES (
        uuid_generate_v4(),
        'Storage Location Form',
        'Form for storage locations',
        address_entity_type_id,
        storage_type_id,
        'TYPE',
        '{
            "metadata": {
                "version": 1,
                "formType": "address",
                "addressType": "storage"
            },
            "layout": {
                "type": "sections",
                "sections": [
                    {
                        "id": "location_info",
                        "label": "Location Information",
                        "order": 1,
                        "fields": ["street", "address_line_2", "city", "state", "postal_code"]
                    },
                    {
                        "id": "storage_details",
                        "label": "Storage Details",
                        "order": 2,
                        "fields": ["display_name", "storage_type", "storage_capacity", "storage_security_level"]
                    },
                    {
                        "id": "notes_section",
                        "label": "Notes",
                        "order": 3,
                        "fields": ["notes"]
                    }
                ]
            },
            "fields": {
                "street": {
                    "type": "text",
                    "label": "Street Address",
                    "required": true
                },
                "address_line_2": {
                    "type": "text",
                    "label": "Unit Number",
                    "required": false
                },
                "city": {
                    "type": "text",
                    "label": "City",
                    "required": true
                },
                "state": {
                    "type": "text",
                    "label": "State/Province",
                    "required": true
                },
                "postal_code": {
                    "type": "text",
                    "label": "Postal Code",
                    "required": true
                },
                "display_name": {
                    "type": "text",
                    "label": "Display Name",
                    "required": false
                },
                "storage_type": {
                    "type": "select",
                    "label": "Storage Type",
                    "required": true,
                    "options": [
                        {"label": "Self-Storage Unit", "value": "self_storage"},
                        {"label": "Warehouse", "value": "warehouse"},
                        {"label": "Garage", "value": "garage"},
                        {"label": "Shed", "value": "shed"},
                        {"label": "Basement", "value": "basement"},
                        {"label": "Other", "value": "other"}
                    ]
                },
                "storage_capacity": {
                    "type": "text",
                    "label": "Capacity",
                    "required": false,
                    "help": "Size or capacity (e.g., 10x10, 2000 sq ft)"
                },
                "storage_security_level": {
                    "type": "select",
                    "label": "Security Level",
                    "required": false,
                    "options": [
                        {"label": "Basic", "value": "basic"},
                        {"label": "Standard", "value": "standard"},
                        {"label": "Enhanced", "value": "enhanced"},
                        {"label": "Maximum", "value": "maximum"}
                    ]
                },
                "notes": {
                    "type": "textarea",
                    "label": "Notes",
                    "required": false
                }
            }
        }'::jsonb,
        1,
        true,
        false,
        true,
        now(),
        now(),
        '{"icon": "archive", "formType": "address", "addressType": "storage"}'::jsonb
    );
    
    -- 8. Update the Property Condition form to be a specialized form for residential addresses
    UPDATE form_definitions
    SET 
        entity_type_id = address_entity_type_id,
        entity_subtype_id = residential_type_id,
        form_level = 'SPECIALIZED'
    WHERE name = 'Address Property Condition';
    
END $$;