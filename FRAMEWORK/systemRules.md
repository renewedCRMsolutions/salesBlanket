# System Rules

## Entity Records

- On Delete
  Make inactive and move to our Rehash Track

## record deletion

. Soft Deletion Strategy
For when you're ready to address deletion behavior, I'd recommend documenting a consistent approach across entity types:

Primary Entities: Soft delete with status change (addresses, contacts, opportunities)
Joining Tables: Hard delete (typically safe since the primary data remains intact)
Configuration Tables: Soft delete with is_active flag

## form versioning

Having a toggle for automatic versioning is an excellent idea! I suggest:
Table: form_definitions
Add column: auto_versioning boolean DEFAULT true
And yes, an auto-save feature for crash recovery would be valuable. You could implement:
Table: form_draft_states
Columns:
  - id uuid PRIMARY KEY
  - form_definition_id uuid
  - editor_user_id uuid
  - draft_state jsonb
  - last_saved_at timestamptz
This would store incremental drafts that could be recovered if the user's session crashes during form editing.

## UI Column Consumption Permissions

CREATE TABLE public.column_permissions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name varchar(100) NOT NULL,
    column_name varchar(100) NOT NULL,
    permission_type varchar(50) NOT NULL, -- 'UI_VISIBLE', 'API_EXPOSED', 'EXPORT_ALLOWED', etc.
    role_id uuid REFERENCES public.roles(id),
    is_allowed boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_column_perm_unique ON public.column_permissions(table_name, column_name, permission_type, role_id);

This would provide granular control over which columns are visible to which roles in different contexts (UI, API, exports).

## Pri