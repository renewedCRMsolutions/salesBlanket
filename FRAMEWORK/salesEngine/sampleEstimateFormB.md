-- Create function to automatically create a version record when a form is created
CREATE OR REPLACE FUNCTION create_form_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new version record
  INSERT INTO public.form_versions (
    form_definition_id,
    version,
    form_schema,
    effective_from,
    created_by,
    created_at
  ) VALUES (
    NEW.id,
    NEW.version,
    NEW.form_schema,
    NEW.created_at,
    NEW.created_by,
    NEW.created_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic versioning
CREATE TRIGGER form_version_trigger
AFTER INSERT ON public.form_definitions
FOR EACH ROW EXECUTE FUNCTION create_form_version();

-- Create function to handle form updates and versioning
CREATE OR REPLACE FUNCTION update_form_version()
RETURNS TRIGGER AS $$
BEGIN
  -- If the form schema has changed, create a new version
  IF NEW.form_schema <> OLD.form_schema THEN
    -- Update the version
    NEW.version := OLD.version + 1;
    
    -- Create a new version record
    INSERT INTO public.form_versions (
      form_definition_id,
      version,
      form_schema,
      effective_from,
      created_by,
      created_at
    ) VALUES (
      NEW.id,
      NEW.version,
      NEW.form_schema,
      NEW.updated_at,
      NEW.created_by,
      NEW.updated_at
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for form updates
CREATE TRIGGER form_update_trigger
BEFORE UPDATE ON public.form_definitions
FOR EACH ROW
WHEN (NEW.form_schema IS DISTINCT FROM OLD.form_schema)
EXECUTE FUNCTION update_form_version();

-- Create function to handle soft deletes
CREATE OR REPLACE FUNCTION soft_delete_form()
RETURNS TRIGGER AS $$
BEGIN
  -- Instead of deleting, mark the form as deleted
  UPDATE public.form_definitions SET 
    is_deleted = true,
    is_active = false,
    updated_at = now()
  WHERE id = OLD.id;
  
  RETURN NULL; -- Prevents the actual delete
END;
$$ LANGUAGE plpgsql;

-- Create trigger for soft deletes
CREATE TRIGGER form_soft_delete_trigger
BEFORE DELETE ON public.form_definitions
FOR EACH ROW EXECUTE FUNCTION soft_delete_form();

-- Create function to get form schema for an item
CREATE OR REPLACE FUNCTION get_item_form_schema(
  p_item_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_form_id uuid;
  v_form_version integer;
  v_form_schema jsonb;
BEGIN
  -- Get the item's form info
  SELECT 
    form_definition_id, 
    form_version
  INTO v_form_id, v_form_version
  FROM public.sales_engine_items
  WHERE id = p_item_id;
  
  -- If no specific form, try to get default form for item type
  IF v_form_id IS NULL THEN
    SELECT f.form_definition_id
    INTO v_form_id
    FROM public.item_type_forms f
    JOIN public.sales_engine_items i ON f.item_type_id = i.item_type_id
    WHERE i.id = p_item_id AND f.is_default = true;
  END IF;
  
  -- Get the appropriate form schema version
  IF v_form_id IS NOT NULL THEN
    IF v_form_version IS NOT NULL THEN
      -- Get specific version
      SELECT form_schema INTO v_form_schema
      FROM public.form_versions
      WHERE form_definition_id = v_form_id
      AND version = v_form_version;
    ELSE
      -- Get latest version
      SELECT form_schema INTO v_form_schema
      FROM public.form_definitions
      WHERE id = v_form_id;
    END IF;
  END IF;
  
  RETURN v_form_schema;
END;
$$ LANGUAGE plpgsql;

-- Create function to get applicable estimate components for an item
CREATE OR REPLACE FUNCTION get_item_estimate_components(
  p_item_id uuid
) RETURNS TABLE (
  component_id uuid,
  component_name varchar(255),
  component_type varchar(50),
  component_schema jsonb,
  display_order integer,
  is_required boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS component_id,
    c.name AS component_name,
    c.component_type,
    c.component_schema,
    tc.display_order,
    tc.is_required
  FROM public.estimate_components c
  JOIN public.item_type_components tc ON c.id = tc.component_id
  JOIN public.sales_engine_items i ON i.item_type_id = tc.item_type_id
  WHERE i.id = p_item_id AND c.is_active = true
  ORDER BY tc.display_order;
END;
$$ LANGUAGE plpgsql;

-- Insert default organization
INSERT INTO public.organizations (
  name,
  description,
  settings,
  is_active
) VALUES (
  'SalesBlanket',
  'Primary organization',
  '{"defaultSettings": {"theme": "light", "language": "en"}}',
  true
);

-- Insert form-related permissions
INSERT INTO public.permissions (
  name, 
  description, 
  resource, 
  action, 
  status
)
VALUES 
('form:create', 'Create new forms', 'form', 'create', 'ACTIVE'),
('form:read', 'View forms', 'form', 'read', 'ACTIVE'),
('form:update', 'Edit existing forms', 'form', 'update', 'ACTIVE'),
('form:delete', 'Delete forms', 'form', 'delete', 'ACTIVE'),
('form:admin', 'Administer all forms', 'form', 'admin', 'ACTIVE'),
('estimate:build', 'Build estimates with components', 'estimate', 'build', 'ACTIVE'),
('estimate:template', 'Create estimate templates', 'estimate', 'template', 'ACTIVE');

-- Insert basic estimate components
INSERT INTO public.estimate_components (
  name,
  description,
  component_type,
  component_schema,
  organization_id,
  is_active
) VALUES 
(
  'Standard Line Items',
  'Basic line items table with item, quantity, price, and total',
  'line_items',
  '{
    "type": "line_items",
    "columns": [
      {"id": "item", "label": "Item", "type": "text", "required": true},
      {"id": "quantity", "label": "Quantity", "type": "number", "required": true, "min": 1},
      {"id": "unit_price", "label": "Unit Price", "type": "currency", "required": true, "min": 0},
      {"id": "total", "label": "Total", "type": "calculated", "formula": "quantity * unit_price"}
    ],
    "addRowLabel": "Add Item",
    "deleteRowLabel": "Remove",
    "totalLabel": "Subtotal",
    "showTotal": true
  }'::jsonb,
  (SELECT id FROM public.organizations WHERE name = 'SalesBlanket'),
  true
),
(
  'Labor Costs',
  'Labor tracking with hours, rate, and total',
  'line_items',
  '{
    "type": "line_items",
    "columns": [
      {"id": "description", "label": "Description", "type": "text", "required": true},
      {"id": "hours", "label": "Hours", "type": "number", "required": true, "min": 0.5, "step": 0.5},
      {"id": "rate", "label": "Hourly Rate", "type": "currency", "required": true, "min": 0},
      {"id": "total", "label": "Total", "type": "calculated", "formula": "hours * rate"}
    ],
    "addRowLabel": "Add Labor Item",
    "deleteRowLabel": "Remove",
    "totalLabel": "Labor Subtotal",
    "showTotal": true
  }'::jsonb,
  (SELECT id FROM public.organizations WHERE name = 'SalesBlanket'),
  true
),
(
  'Photo Gallery',
  'Photo collection with captions and annotations',
  'photo_gallery',
  '{
    "type": "photo_gallery",
    "layout": "grid", 
    "maxPhotos": 12,
    "allowCaptions": true,
    "allowAnnotations": true,
    "photoSources": ["entity_photos", "upload", "camera"],
    "annotationTools": ["arrow", "highlight", "text", "measurement"]
  }'::jsonb,
  (SELECT id FROM public.organizations WHERE name = 'SalesBlanket'),
  true
),
(
  'Document Display',
  'Document viewer with annotations',
  'document_display',
  '{
    "type": "document_display",
    "allowUpload": true,
    "allowAnnotations": true,
    "allowRotation": true,
    "allowZoom": true,
    "documentTypes": ["pdf", "docx", "image"],
    "maxDocuments": 5
  }'::jsonb,
  (SELECT id FROM public.organizations WHERE name = 'SalesBlanket'),
  true
),
(
  'Customer Approval',
  'Customer signature and approval section',
  'approval_section',
  '{
    "type": "approval_section",
    "fields": [
      {"id": "customer_name", "label": "Customer Name", "type": "text"},
      {"id": "approval_date", "label": "Date", "type": "date"},
      {"id": "signature", "label": "Signature", "type": "signature"}
    ],
    "termsAndConditions": "By signing, customer agrees to the scope of work and payment terms outlined in this estimate."
  }'::jsonb,
  (SELECT id FROM public.organizations WHERE name = 'SalesBlanket'),
  true
);