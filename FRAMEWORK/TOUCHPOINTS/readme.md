# SalesBlanket Touchpoints System

Overview
The Touchpoints system tracks customer interactions and milestones in the sales process. This document provides guidance for frontend developers integrating with the touchpoints database.
Database Schema
touchpoint_types
Defines the various types of touchpoints available in the system:

id: Unique identifier
name: Display name of the touchpoint type
description: Detailed description
icon: Icon identifier to display
color: Hex color code for styling
default_follow_up_days: Optional days until follow-up
is_active: Whether this type is currently active
requires_task: Whether completion requires a task
no_show: Whether this can be marked as "no show"
display_config: JSON configuration for UI rendering
is_team_visible: Whether visible to the whole team
settings: Additional configuration options

touchpoints
Actual touchpoint instances:

id: Unique identifier
entity_type_id: Type of entity this touchpoint applies to
address_id: Associated address (if applicable)
contact_id: Associated contact (if applicable)
opportunity_id: Associated opportunity (if applicable)
user_id: User who created/owns the touchpoint
zone_id: Associated geographic zone (if applicable)
created_at: Creation timestamp

touchpoint_achievements
Records achievements earned via touchpoints:

id: Unique identifier
touchpoint_code_id: Reference to the touchpoint
achievement_type_id: Type of achievement earned
created_at: Timestamp when earned
updated_at: Last update timestamp

touchpoint_applicable_entities
Defines which touchpoint types can be applied to which entity types:

id: Unique identifier
touchpoint_code_id: Reference to the touchpoint type
entity_type_id: Entity type this applies to
created_at: Creation timestamp

Frontend Implementation Guidelines
1. Touchpoint Type Management

Load available touchpoint types for a given entity from /api/touchpoint-types
Filter based on entity type using the touchpoint_applicable_entities table
Cache touchpoint types for performance

2. Touchpoint Display Components

Implement UI components that respect each type's display_config and color
Show different UI elements based on flags like requires_task and is_team_visible
Use the associated icon for visual clarity

3. Creating Touchpoints

When creating touchpoints, set appropriate entity IDs (address_id, contact_id, etc.)
Always include user_id to track who created the touchpoint
Validate against applicable entity types before submission

4. Touchpoint Timeline

Display touchpoints chronologically for entities
Group by date for clearer presentation
Apply styling based on touchpoint_type colors and icons
Show achievements earned when applicable

5. Achievement Tracking

Display achievements grouped by type when viewing a user profile
Implement UI for achievement progress tracking
Show achievement notifications when new ones are earned

API Integration Points

GET /api/touchpoint-types - List available touchpoint types
GET /api/touchpoints?entityType={type}&entityId={id} - Get touchpoints for an entity
POST /api/touchpoints - Create a new touchpoint
GET /api/users/{id}/achievements - Get achievements for a user

Best Practices

Performance: Cache touchpoint types and reuse them where possible
Permissions: Check if current user has permissions to create touchpoints of specific types
UI Consistency: Maintain consistent styling based on touchpoint_type properties
Error Handling: Implement clear error handling for touchpoint operations
State Management: Use central state management for touchpoint data

Example Workflow

User views an entity (address, contact, opportunity)
System loads applicable touchpoint types for that entity
User selects a touchpoint type to create
System creates touchpoint and checks for achievements
UI updates to show the new touchpoint in the timeline
If achievements were earned, show notification