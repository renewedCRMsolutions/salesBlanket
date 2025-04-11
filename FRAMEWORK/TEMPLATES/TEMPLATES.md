# Template Versioning

For template versioning, I recommend:

Version numbers on templates (major.minor)
Change tracking in metadata (what changed, when, why)
Templates that can be published/drafted/archived
Ability to roll back to previous versions
Template inheritance for reusable components

This applies to both object templates and UI rendering templates

sample JSON

{
  "templateSchema": {
    "version": "1.0",
    "templateTypes": ["CARD", "FORM", "REPORT", "EMAIL", "WORKFLOW"]
  },
  "templateVersion": {
    "id": "template_uuid_here",
    "name": "Standard Address Card",
    "type": "CARD",
    "version": "2.3",
    "status": "PUBLISHED",
    "createdBy": "user_uuid_here",
    "createdAt": "2025-03-15T10:30:00.000Z",
    "publishedAt": "2025-03-20T14:45:00.000Z",
    "parentTemplate": "template_parent_uuid_here",
    "changeLog": {
      "from": "2.2",
      "changes": [
        {"field": "layout.header", "type": "MODIFIED", "reason": "Improved readability"},
        {"field": "fields.phone", "type": "ADDED", "reason": "Customer request"}
      ]
    },
    "content": {
      "layout": {
        "type": "card",
        "sections": [
          {
            "id": "header",
            "type": "header",
            "fields": ["name", "status"]
          },
          {
            "id": "body",
            "type": "content",
            "fields": ["street", "city", "state", "postalCode"]
          },
          {
            "id": "footer",
            "type": "footer",
            "fields": ["lastContactDate", "assignedTo"]
          }
        ]
      },
      "styling": {
        "theme": "light",
        "colorScheme": "blue",
        "typography": {
          "headingFont": "Roboto",
          "bodyFont": "Open Sans"
        }
      },
      "behaviors": {
        "onClick": "OPEN_DETAIL_VIEW",
        "onHover": "SHOW_QUICK_ACTIONS"
      }
    }
  }
}