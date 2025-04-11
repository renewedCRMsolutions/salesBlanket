# Collections

We are building out a territory canvassing component of the salesBlanket family.  We have are building the following components.

The foundation of the application is creatively leveraging the fast pace of relational database in a lightweight format.

Collections organize and maintain our application.

We use "touchPoints" to identify markers on our "salesTrack".  We also have achievements and goals that are built into the environment to create thresholds and track data and drive the production.

The salesBoard renders the data in our "salesCollection".  The salesCollection is a container for our Contacts, Addresses, Opportunities and our interactive "salesPulse".  

The salesPulse uses our google workspace to assist the employees to be as productive as possible.

## Propagation

Collections serve as a parental container.  Technically our entities are the parents, the Collection table marries our data to serve the user.

### PULSE

Our entities have relative data.  We organize the data for the "Collection(s) in our Pulse. 

#### pulsePhotos

We will store the photos in Google Drive and leverage the Google Drive Labels API to organize the photos by the collections.id.  

  Managing photos in Google Drive can be structured effectively. Here's a strategy:

    **Folder Structure:**

      Create a main "Sales Blanket Photos" folder
      Create sub-folders by entity type (Addresses, Contacts, Opportunities)
      Further organize by ID or territory/region

          ON initial entity creation - we use the collection_id key on the entity 

      Metadata and Taxonomies (using Drive Labels API):

      **Create custom metadata fields like:**

      Entity Type (Address, Contact, Opportunity)
      Entity ID (to link back to your database)
      Photo Type (Exterior, Interior, Document, etc.)
      Capture Date
      Photographer/Sales Rep

          **Implementation Strategy:**

          When a photo is uploaded, store it in the appropriate folder
          Apply metadata using Drive Labels API
          Store the Google Drive file ID in your database for quick access

2. pulseCalendar - sync google calendar and use google tasks API to track events, appointments.  

3. pulseMeet - we have the ability to setup google meet appointments for video sales calls here.

4. pulseGemini - plan to use vertex to assist in the future with file management.  for now we will integrate a model to serve company documentation.

- pulseNotebook - place to keep a notebook style record of data on all the entites in the collection.  

- pulseTasks - task can be assigned to entities, users, contacts, addresses, opportunities, and more.  we should be able to task reminders to customers to remind them of events. 

#### pulseMail

Email attachment detection system that identifies image attachments
Drag-and-drop interface for moving images to entity records
API endpoint to process and store images:

Extract from email MIME content
Upload to Google Drive using your existing DriveService
Create entry in entity_card_pulse_photos table
Associate with relevant entity

The frontend workflow would:

Display mail with image previews
Allow user to select destination entity
Handle upload and association in background
Provide confirmation when complete

1. Email attachments automatically inherit collection association
2. Photos from emails become immediately available to all entities in the collection
3. UI can show "unassigned photos" ready for entity-specific tagging
    The architecture would flow:

      Email → Attachment detection → Auto-upload to Drive
      Store in entity_card_pulse_email_attachments with collection_id
      Expose in collection view for easy drag-and-drop association to entities

      This leverages your parent-child relationship model for automatic organization while maintaining the flexibility to assign/tag photos to specific entities later.

Backend components:

emailService.ts - Process incoming emails, extract attachments
Database tables: entity_card_pulse_emails and entity_card_pulse_email_attachments

Frontend transfer script:

JavaScript handler that detects when users drag/select email attachments
API endpoint to process the transfer (email → entity)
Status indicators for transfer progress

Integration approach:

Emails stored in their own table with references to collections/entities
When user moves a photo from email, create entry in entity_card_pulse_photos
Maintain reference to original email ID for traceability

This leverages your existing PhotoService implementation with minor additions for email-specific processing.

#### pulseChat - component that uses @ with google account to send messages inner office.  

**Development:**

We need to contain all messaging in one container - records should be interactive.  Please let me know what you think can accomplish this type of component.

All of the apis listed are turned on

maps api
places api old and new api
directions api
geolocation api
drive labels api (metadata taxonomies?)
gmail api
google people API
google calendar API
google sheets API
youtube data API (training videos)
gemini api 
google tasks api
google drive activity api
google chat api
google drive api

**Image Editor Component:**

Canvas-based editing with drawing capabilities
Ability to add text, arrows, highlights, measurements
Save annotations as vector layers separate from the original image

**Technical Implementation Options:**

Fabric.js: Powerful HTML5 canvas library for complex drawing
Konva.js: Performance-focused canvas library for interactions
Custom solution using HTML5 Canvas API

**Annotation Storage Strategy:**

Store original image in Google Drive
Save annotations as metadata or separate JSON file
Option to create a flattened version with annotations baked in

Photo Annotation/Drawing Requirements
For annotating/drawing on photos, you'll need:

**Image Editor Component:**

Canvas-based editing with drawing capabilities
Ability to add text, arrows, highlights, measurements
Save annotations as vector layers separate from the original image

**Technical Implementation Options:**

Fabric.js: Powerful HTML5 canvas library for complex drawing
Konva.js: Performance-focused canvas library for interactions
Custom solution using HTML5 Canvas API

**Annotation Storage Strategy:**

Store original image in Google Drive
Save annotations as metadata or separate JSON file
Option to create a flattened version with annotations baked in

Zone/Polygon Drawing for Address Selection
For drawing polygons on a map to select addresses:

**Map Component Features:**

Polygon drawing tools
Ability to save/load defined territories
Address lookup within defined areas

**Implementation Components:**

Google Maps Drawing Library for polygon creation
Geocoding API for address lookup within polygons
Database storage for territory definitions

**Workflow:**

User draws polygon on map
System queries addresses within polygon
Results stored in database with territory association

Next Steps in Framework Development
Let's organize the implementation phases:

**Authentication & Permission Setup:**

Implement Google OAuth (as we've started)
Set up API keys with proper scopes and restrictions

**Storage Structure:**

Design Drive folder hierarchy
Create metadata schema for photos and documents

**Map Components:**

Implement Google Maps with drawing tools
Create territory management system
