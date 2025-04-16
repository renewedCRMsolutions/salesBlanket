# SalesBlanket Frontend

This directory contains the frontend code for SalesBlanket v4.

## Architecture

The frontend uses vanilla JavaScript with Web Components following a hierarchical MVC pattern with singleton services. The key architectural components are:

1. **Web Components**: Custom elements for UI rendering
2. **Service Singletons**: Shared services for business logic and state management
3. **Shadow DOM**: Component encapsulation
4. **Custom Events**: For component communication

## Directory Structure

```
client/
├── index.html              # Main entry point
├── src/
│   ├── css/
│   │   └── styles.css      # Global styles
│   ├── js/
│   │   ├── app.js          # Application initialization
│   │   ├── components/     # Reusable components
│   │   │   ├── BaseView.js # Base component class
│   │   │   └── ...
│   │   ├── pages/          # Page components
│   │   │   ├── CalendarView.js
│   │   │   └── ...
│   │   └── services/       # Service singletons
│   │       ├── ViewHandler.js
│   │       ├── ViewState.js
│   │       └── ...
│   └── assets/             # Images, fonts, etc.
```

## Color Palette

The application uses a Porsche-inspired color palette:

- Brewster Green (#2F4F2F)
- Eberle Green (#1E4A43)
- Fjord (#3B7B9E) 
- Golf Blau (#1A3A59)
- Shark Blue (#2D4A71)
- Carmine Red (#960018)
- Racing Yellow (#FFC20E)
- Lime Green (#9CCB19)
- Chalk (#C9C8C0)
- Agate Grey (#4B5358)

## Getting Started

1. Navigate to the client directory: `cd client`
2. Open index.html in a browser or use a local server:
   - With Python: `python -m http.server 8080`
   - With Node: `npx serve`

## Development

The application follows a component-based architecture:

1. **BaseView**: Foundation component that all components extend
2. **PageView**: Main container component
3. **ViewHandler**: Controls view transitions and routing
4. **ViewState**: Manages application state

New components should extend BaseView and register with the ComponentRegistry.

## Architecture Diagrams

```
┌─────────────────────────────────────┐
│                                     │
│             PageView                │
│                                     │
├─────────────────────────────────────┤
│                                     │
│            ViewHandler              │
│                                     │
├─────────────────────────────────────┤
│                                     │
│         Component Registry          │
│                                     │
└─────────────────────────────────────┘
```

## State Management

The application uses a centralized state management pattern through the ViewState singleton:

1. Components subscribe to state changes
2. State updates trigger events
3. Components react to state change events
4. Unidirectional data flow ensures predictable updates

## Event System

Components communicate through a custom event system:

1. Components dispatch events with `dispatchEvent()`
2. Parent components listen for events from children
3. Global state changes are broadcast through the ViewState