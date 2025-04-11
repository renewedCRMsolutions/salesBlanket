# Entities Search

We have two searches.  

1. Collection Search: user can search for address, contacts, and opportunities in this search-bar.

2. Documents Search: user can search for photos, documents, notes, ect. in this search-bar.

## Pulse Load

### Photos

1. Keep entity_photos separate from pulse_photos with distinct purposes:
    entity_photos: Profile/primary photos directly tied to entities
    pulse_photos: Collection-level photos for the shared workspace
2. Simplify the relationship flow:
    entity → collection → pulse
    Each level adds context and functionality
3. For the pane of glass view:
    User selects entity → system loads collection → pulse components render
    All pulse components reference collection_id directly

