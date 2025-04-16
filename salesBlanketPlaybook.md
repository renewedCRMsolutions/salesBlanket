# salesBlanket Playbook

## Component Interface Specifications

typescript/**
 * FormRenderer Component
 * 
 * Renders a dynamic form based on JSON schema definition
 * Parent components: EntityPage, ModalForm
 * Child components: DynamicField, ValidationMessage, FormActions
 */
interface FormRendererProps {
  // Required props
  formDefinitionId: string;  // UUID of the form definition
  
  // Optional props
  entityId?: string;         // UUID of the entity if editing existing data
  initialData?: Record<string, any>; // Initial form values
  validationStrategy?: 'onBlur' | 'onChange' | 'onSubmit'; // When to trigger validation
  readOnly?: boolean;        // Whether form is in read-only mode
  showValidationSummary?: boolean; // Show validation errors at top of form
}

interface FormRendererEvents {
  onSubmit: (formData: Record<string, any>) => void;
  onChange?: (fieldName: string, value: any, formData: Record<string, any>) => void;
  onValidationError?: (errors: ValidationError[]) => void;
  onFormStateChange?: (isDirty: boolean, isValid: boolean) => void;
}

// Event types for validation errors
interface ValidationError {
  fieldName: string;
  errorCode: string;
  errorMessage: string;
  fieldPath: string[]; // For nested fields
}

## State Management Documentation

Here's a state management flow diagram concept for the FormRenderer component:

stateDiagram-v2
    [*] --> Initializing: Component Mount
    
    Initializing --> LoadingFormDefinition: Fetch form schema
    LoadingFormDefinition --> FormError: API Error
    LoadingFormDefinition --> RenderingForm: Schema Loaded
    
    state RenderingForm {
        [*] --> Pristine: Initial render
        Pristine --> Dirty: Field changed
        Dirty --> Validating: Validation triggered
        Validating --> Invalid: Validation failed
        Validating --> Valid: Validation passed
        Invalid --> Validating: Field corrected
        Valid --> Submitting: Form submitted
        Submitting --> SubmitError: API Error
        Submitting --> SubmitSuccess: Data saved
    }
    
    FormError --> [*]: Component Unmount
    SubmitError --> RenderingForm: Return to editing
    SubmitSuccess --> [*]: Navigate away or reset

## Component Interaction Diagram

sequenceDiagram
    participant UI as FormRenderer
    participant VM as FormViewModel
    participant API as FormService
    participant DB as Database
    
    UI->>VM: initializeForm(formDefinitionId)
    VM->>API: fetchFormDefinition(formDefinitionId)
    API->>DB: SELECT * FROM form_definitions WHERE id = ?
    DB-->>API: Form definition data
    API->>DB: SELECT * FROM form_component_usage WHERE form_definition_id = ?
    DB-->>API: Component usage data
    API-->>VM: Complete form schema
    VM-->>UI: Initialize form state
    
    UI->>VM: updateField(fieldName, value)
    VM->>VM: validateField(fieldName, value)
    VM-->>UI: Update validation state
    
    UI->>VM: submitForm(formData)
    VM->>VM: validateForm(formData)
    VM->>API: saveFormData(entityType, formData)
    API->>DB: BEGIN TRANSACTION
    API->>DB: INSERT/UPDATE primary entity
    Note over API,DB: Multiple operations for related entities
    API->>DB: COMMIT TRANSACTION
    DB-->>API: Success/Error response
    API-->>VM: Response status
    VM-->>UI: Submit result

## API Contract Documentation

typescript/**
 * Form Definition API
 * Endpoint: /api/v1/forms/definitions/{formDefinitionId}
 * 
 * Headers:
 * - Authorization: Bearer {token}
 * - Content-Type: application/json
 */

// GET /api/v1/forms/definitions/{formDefinitionId}
interface GetFormDefinitionResponse {
  id: string;
  name: string;
  version: string;
  formLevel: 'BASE' | 'TYPE' | 'CATEGORY' | 'SPECIALIZED';
  entityTypeId: string;
  categoryId?: string;
  departmentId?: string;
  organizationId?: string;
  formSchema: FormSchema;
  components: FormComponentUsage[];
  createdAt: string;
  updatedAt: string;
}

// POST /api/v1/forms/data/{entityType}/{entityId}
interface SaveFormDataRequest {
  formDefinitionId: string;
  formData: Record<string, any>;
}

interface SaveFormDataResponse {
  success: boolean;
  entityId: string;
  message?: string;
  errors?: ValidationError[];
}

// Error Response (4xx, 5xx)
interface ErrorResponse {
  errorCode: string;
  errorMessage: string;
  fieldErrors?: Record<string, string>;
  traceId?: string;
}