# Connections

We are building out a territory canvassing component of the salesBlanket family.  We have are building the following components.

We use "touchPoints" to identify markers on our "salesTrack".  We also have achievements and goals that are built into the environment to create thresholds and track data and drive the production.

The salesBoard renders the data in our "salesCollection".  The salesCollection is a container for our Contacts, Addresses, Opportunities and our interactive "salesPulse".  

The salesPulse uses our google workspace to assist the employees to be as productive as possible.

## Components

### salesBoard

**salesBoard Components:**

1. pulsePhotos - We will store the photos in Google Drive and leverage the Google Drive Labels API to organize the photos by the collections.id.  

  Managing photos in Google Drive can be structured effectively. Here's a strategy:

    **Folder Structure:**

      Create a main "Sales Blanket Photos" folder
      Create sub-folders by entity type (Addresses, Contacts, Opportunities)
      Further organize by ID or territory/region

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

5. pulseNotebook - place to keep a notebook style record of data on all the entites in the collection.  

6. pulseTasks - task can be assigned to entities, users, contacts, addresses, opportunities, and more.  we should be able to task reminders to customers to remind them of events. 

7. pulseMail - mail that syncs with gmail account to recieve and send email with the customers and inner office.  

8. pulseChat - component that uses @ with google account to send messages inner office.  

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
