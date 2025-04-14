# Understanding Estimates in the Modern Form System

Purpose of Estimates

Estimates are a critical component of the salesBlanket application that serve as formal pricing proposals to customers. They combine product/service selections, pricing calculations, customer information, and visual elements (like photos and annotations) into a professional document that can be presented to customers for approval.
How Estimates Integrate with the Modern Form System
Estimates represent the "output" side of your form system, integrating data collected through the "input" forms (address, contact, and opportunity forms). Here's how they fit into your modern form system:

Data Source Integration

Estimates pull data from previously completed forms, particularly opportunity forms
They reference specific data fields like measurements, materials, and customer preferences
They can pull contact information from contact forms and location details from address forms


Component-Based Structure

Unlike input forms which are schema-based, estimates use a component-based "drag and drop" approach
Users can build estimates by adding, arranging, and configuring components
Components can include line items, photo galleries, material selections, labor calculations, etc.


Dynamic Pricing

Estimates connect to your sales engine for real-time pricing based on:

Selected products/services
Customer's location (zone-based pricing)
Quantity/square footage
Any applicable discounts




Template System

Users can save estimate layouts as templates for reuse
Templates can be associated with specific opportunity types
This creates consistency while maintaining flexibility



Database Structure for Estimates
To support this functionality, you'll need these tables:

documents table - Stores the overall estimate

Links to collections and opportunities
Stores layout and content as separate JSON structures
Tracks status (draft, presented, approved, rejected)


document_components table - Stores individual components within the estimate

Links to the parent document
Stores component type, configuration, and content
Maintains references to source data from forms


document_templates table - Stores reusable estimate templates

Defines default layouts and components
Can be associated with specific opportunity types


data_source_references table - Tracks where data in estimates came from

Links estimate components to source data (contacts, opportunities, etc.)
Enables updating estimates when source data changes



Workflow Integration
The estimate creation process integrates with your form workflow:

After completing the opportunity form with all measurements and selections
User chooses to create an estimate from that opportunity
System presents template options based on opportunity type
User builds estimate by adding components and importing data
System calculates pricing based on selections and zone pricing
User finalizes and presents estimate to customer
Customer approval can be captured directly on the estimate