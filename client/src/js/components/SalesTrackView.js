/**
 * SalesTrackView.js
 * 
 * Component for displaying and interacting with the sales track system.
 * Shows tracks, drives, and stops in a hierarchical view.
 */

import { BaseView } from './BaseView.js';
import ViewState from '../services/ViewState.js';
import SalesTrackService from '../services/SalesTrackService.js';

export class SalesTrackView extends BaseView {
  static get observedAttributes() {
    return ['track-id', 'drive-id', 'stop-id', 'view-mode'];
  }

  constructor() {
    super();
    this.viewState = ViewState;
    this.salesTrackService = SalesTrackService;
    
    // Bind methods
    this.handleTrackSelect = this.handleTrackSelect.bind(this);
    this.handleDriveSelect = this.handleDriveSelect.bind(this);
    this.handleStopSelect = this.handleStopSelect.bind(this);
    this.handleEntityClick = this.handleEntityClick.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      tracks: [],
      selectedTrackId: this.getAttribute('track-id') || null,
      selectedTrack: null,
      drives: [],
      selectedDriveId: this.getAttribute('drive-id') || null,
      selectedDrive: null,
      stops: [],
      selectedStopId: this.getAttribute('stop-id') || null,
      selectedStop: null,
      entities: [],
      viewMode: this.getAttribute('view-mode') || 'default',
      loading: {
        tracks: false,
        drives: false,
        stops: false,
        entities: false
      },
      error: null
    };
    
    // Load initial data
    this.loadTracks();
  }

  /**
   * Handle attribute changes
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'track-id':
        this.setState({ selectedTrackId: newValue });
        if (newValue) {
          this.loadTrack(newValue);
        }
        break;
      case 'drive-id':
        this.setState({ selectedDriveId: newValue });
        if (newValue) {
          this.loadDrive(newValue);
        }
        break;
      case 'stop-id':
        this.setState({ selectedStopId: newValue });
        if (newValue) {
          this.loadStop(newValue);
        }
        break;
      case 'view-mode':
        this.setState({ viewMode: newValue });
        break;
    }
  }

  /**
   * Load all tracks
   */
  async loadTracks() {
    try {
      this.setState({ 
        loading: { ...this.getState().loading, tracks: true },
        error: null
      });
      
      const tracks = await this.salesTrackService.getTracks();
      
      this.setState({ 
        tracks,
        loading: { ...this.getState().loading, tracks: false }
      });
      
      // If there's a selected track ID, load it
      const { selectedTrackId } = this.getState();
      if (selectedTrackId) {
        this.loadTrack(selectedTrackId);
      }
    } catch (error) {
      console.error('Error loading tracks:', error);
      this.setState({ 
        error: `Failed to load tracks: ${error.message}`,
        loading: { ...this.getState().loading, tracks: false }
      });
    }
  }

  /**
   * Load a specific track
   * @param {string} trackId - Track ID to load
   */
  async loadTrack(trackId) {
    try {
      this.setState({ 
        loading: { ...this.getState().loading, drives: true },
        error: null
      });
      
      const track = await this.salesTrackService.getTrack(trackId);
      const drives = await this.salesTrackService.getDrives(trackId);
      
      this.setState({ 
        selectedTrack: track,
        drives,
        loading: { ...this.getState().loading, drives: false }
      });
      
      // If there's a selected drive ID, load it
      const { selectedDriveId } = this.getState();
      if (selectedDriveId) {
        this.loadDrive(selectedDriveId);
      }
    } catch (error) {
      console.error('Error loading track:', error);
      this.setState({ 
        error: `Failed to load track: ${error.message}`,
        loading: { ...this.getState().loading, drives: false }
      });
    }
  }

  /**
   * Load a specific drive
   * @param {string} driveId - Drive ID to load
   */
  async loadDrive(driveId) {
    try {
      this.setState({ 
        loading: { ...this.getState().loading, stops: true },
        error: null
      });
      
      const drive = await this.salesTrackService.getDrive(driveId);
      const stops = await this.salesTrackService.getStops(driveId);
      
      this.setState({ 
        selectedDrive: drive,
        stops,
        loading: { ...this.getState().loading, stops: false }
      });
      
      // If there's a selected stop ID, load it
      const { selectedStopId } = this.getState();
      if (selectedStopId) {
        this.loadStop(selectedStopId);
      }
    } catch (error) {
      console.error('Error loading drive:', error);
      this.setState({ 
        error: `Failed to load drive: ${error.message}`,
        loading: { ...this.getState().loading, stops: false }
      });
    }
  }

  /**
   * Load a specific stop
   * @param {string} stopId - Stop ID to load
   */
  async loadStop(stopId) {
    try {
      this.setState({ 
        loading: { ...this.getState().loading, entities: true },
        error: null
      });
      
      const stop = await this.salesTrackService.getStop(stopId);
      
      // Load entities in this stop
      const entities = await this.salesTrackService.getStopEntities(stopId);
      
      this.setState({ 
        selectedStop: stop,
        entities,
        loading: { ...this.getState().loading, entities: false }
      });
    } catch (error) {
      console.error('Error loading stop:', error);
      this.setState({ 
        error: `Failed to load stop: ${error.message}`,
        loading: { ...this.getState().loading, entities: false }
      });
    }
  }

  /**
   * Handle track selection
   * @param {Event} event - Click event
   */
  handleTrackSelect(event) {
    const trackItem = event.target.closest('[data-track-id]');
    if (!trackItem) return;
    
    const trackId = trackItem.dataset.trackId;
    
    this.setState({ 
      selectedTrackId: trackId,
      selectedDriveId: null,
      selectedStopId: null,
      selectedDrive: null,
      selectedStop: null,
      entities: []
    });
    
    this.setAttribute('track-id', trackId);
    this.removeAttribute('drive-id');
    this.removeAttribute('stop-id');
    
    this.loadTrack(trackId);
  }

  /**
   * Handle drive selection
   * @param {Event} event - Click event
   */
  handleDriveSelect(event) {
    const driveItem = event.target.closest('[data-drive-id]');
    if (!driveItem) return;
    
    const driveId = driveItem.dataset.driveId;
    
    this.setState({ 
      selectedDriveId: driveId,
      selectedStopId: null,
      selectedStop: null,
      entities: []
    });
    
    this.setAttribute('drive-id', driveId);
    this.removeAttribute('stop-id');
    
    this.loadDrive(driveId);
  }

  /**
   * Handle stop selection
   * @param {Event} event - Click event
   */
  handleStopSelect(event) {
    const stopItem = event.target.closest('[data-stop-id]');
    if (!stopItem) return;
    
    const stopId = stopItem.dataset.stopId;
    
    this.setState({ selectedStopId: stopId });
    this.setAttribute('stop-id', stopId);
    
    this.loadStop(stopId);
  }

  /**
   * Handle entity click
   * @param {Event} event - Click event
   */
  handleEntityClick(event) {
    const entityItem = event.target.closest('[data-entity-id]');
    if (!entityItem) return;
    
    const entityId = entityItem.dataset.entityId;
    const entityType = entityItem.dataset.entityType;
    
    // Dispatch custom event
    this.dispatchEvent(
      new CustomEvent('entity-selected', {
        detail: { entityId, entityType },
        bubbles: true,
        composed: true
      })
    );
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    // Track selection
    const trackList = this.shadowRoot.querySelector('.track-list');
    if (trackList) {
      this.addTrackedEventListener('click', this.handleTrackSelect, {}, trackList);
    }
    
    // Drive selection
    const driveList = this.shadowRoot.querySelector('.drive-list');
    if (driveList) {
      this.addTrackedEventListener('click', this.handleDriveSelect, {}, driveList);
    }
    
    // Stop selection
    const stopList = this.shadowRoot.querySelector('.stop-list');
    if (stopList) {
      this.addTrackedEventListener('click', this.handleStopSelect, {}, stopList);
    }
    
    // Entity selection
    const entityList = this.shadowRoot.querySelector('.entity-list');
    if (entityList) {
      this.addTrackedEventListener('click', this.handleEntityClick, {}, entityList);
    }
  }

  /**
   * Get component styles
   * @returns {string} CSS styles
   */
  getStyles() {
    return `
      ${super.getStyles()}
      
      :host {
        display: block;
        height: 100%;
      }
      
      .sales-track-container {
        display: flex;
        height: 100%;
        background-color: #f5f5f5;
      }
      
      .track-column,
      .drive-column,
      .stop-column,
      .entity-column {
        flex: 1;
        padding: 1rem;
        border-right: 1px solid rgba(0,0,0,0.1);
        overflow-y: auto;
        background-color: white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      
      .track-column {
        min-width: 200px;
        max-width: 250px;
        background-color: #2F4F2F; /* Brewster Green */
        color: white;
      }
      
      .drive-column {
        min-width: 200px;
        max-width: 250px;
        background-color: #1A3A59; /* Golf Blau */
        color: white;
      }
      
      .stop-column {
        min-width: 200px;
        max-width: 250px;
        background-color: #3B7B9E; /* Fjord */
        color: white;
      }
      
      .entity-column {
        flex: 2;
        background-color: white;
        color: #333;
      }
      
      .column-header {
        font-size: 1.1rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(255,255,255,0.2);
      }
      
      .entity-column .column-header {
        border-bottom: 1px solid rgba(0,0,0,0.1);
      }
      
      .track-item,
      .drive-item,
      .stop-item {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .track-item {
        background-color: rgba(255,255,255,0.1);
      }
      
      .track-item:hover {
        background-color: rgba(255,255,255,0.2);
      }
      
      .track-item.selected {
        background-color: rgba(255,255,255,0.3);
        font-weight: bold;
      }
      
      .drive-item {
        background-color: rgba(255,255,255,0.1);
      }
      
      .drive-item:hover {
        background-color: rgba(255,255,255,0.2);
      }
      
      .drive-item.selected {
        background-color: rgba(255,255,255,0.3);
        font-weight: bold;
      }
      
      .stop-item {
        background-color: rgba(255,255,255,0.1);
        display: flex;
        justify-content: space-between;
      }
      
      .stop-item:hover {
        background-color: rgba(255,255,255,0.2);
      }
      
      .stop-item.selected {
        background-color: rgba(255,255,255,0.3);
        font-weight: bold;
      }
      
      .entity-count {
        display: inline-block;
        background-color: rgba(255,255,255,0.3);
        border-radius: 50%;
        width: 24px;
        height: 24px;
        text-align: center;
        line-height: 24px;
        font-size: 0.8rem;
      }
      
      .entity-item {
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 4px;
        cursor: pointer;
        background-color: #f9f9f9;
        border-left: 3px solid #3B7B9E;
        transition: all 0.2s;
      }
      
      .entity-item:hover {
        background-color: #f0f0f0;
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }
      
      .entity-name {
        font-weight: bold;
        margin-bottom: 0.25rem;
      }
      
      .entity-type {
        font-size: 0.8rem;
        color: #666;
        margin-bottom: 0.5rem;
      }
      
      .entity-details {
        font-size: 0.9rem;
      }
      
      .empty-message {
        text-align: center;
        padding: 2rem;
        color: #888;
        font-style: italic;
      }
      
      .loading-indicator {
        text-align: center;
        padding: 1rem;
        color: rgba(255,255,255,0.7);
      }
      
      .entity-column .loading-indicator {
        color: #888;
      }
      
      .error-message {
        background-color: rgba(255,0,0,0.1);
        color: #c00;
        padding: 1rem;
        border-radius: 4px;
        margin: 1rem 0;
      }
      
      /* Address specific styling */
      .entity-item[data-entity-type="address"] {
        border-left-color: #3B7B9E; /* Fjord */
      }
      
      /* Contact specific styling */
      .entity-item[data-entity-type="contact"] {
        border-left-color: #2D4A71; /* Shark Blue */
      }
      
      /* Opportunity specific styling */
      .entity-item[data-entity-type="opportunity"] {
        border-left-color: #9CCB19; /* Lime Green */
      }
    `;
  }

  /**
   * Render the component
   */
  render() {
    const { 
      tracks, 
      selectedTrackId, 
      selectedTrack,
      drives, 
      selectedDriveId,
      selectedDrive,
      stops, 
      selectedStopId,
      selectedStop,
      entities,
      loading,
      error
    } = this.getState();
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    // Create component structure
    const container = this.createElement('div', { class: 'sales-track-container' }, [
      // Tracks column
      this.createElement('div', { class: 'track-column' }, [
        this.createElement('div', { class: 'column-header' }, 'Sales Tracks'),
        
        loading.tracks ? 
          this.createElement('div', { class: 'loading-indicator' }, 'Loading tracks...') :
          tracks.length > 0 ?
            this.createElement('div', { class: 'track-list' }, 
              tracks.map(track => 
                this.createElement('div', { 
                  class: `track-item ${selectedTrackId === track.id ? 'selected' : ''}`,
                  'data-track-id': track.id
                }, track.name)
              )
            ) :
            this.createElement('div', { class: 'empty-message' }, 'No tracks available')
      ]),
      
      // Drives column
      this.createElement('div', { class: 'drive-column' }, [
        this.createElement('div', { class: 'column-header' }, `${selectedTrack ? selectedTrack.name : ''} Drives`),
        
        error ? 
          this.createElement('div', { class: 'error-message' }, error) : null,
        
        loading.drives ? 
          this.createElement('div', { class: 'loading-indicator' }, 'Loading drives...') :
          selectedTrackId ?
            drives.length > 0 ?
              this.createElement('div', { class: 'drive-list' }, 
                drives.map(drive => 
                  this.createElement('div', { 
                    class: `drive-item ${selectedDriveId === drive.id ? 'selected' : ''}`,
                    'data-drive-id': drive.id
                  }, drive.name)
                )
              ) :
              this.createElement('div', { class: 'empty-message' }, 'No drives available') :
            this.createElement('div', { class: 'empty-message' }, 'Select a track')
      ]),
      
      // Stops column
      this.createElement('div', { class: 'stop-column' }, [
        this.createElement('div', { class: 'column-header' }, `${selectedDrive ? selectedDrive.name : ''} Stops`),
        
        loading.stops ? 
          this.createElement('div', { class: 'loading-indicator' }, 'Loading stops...') :
          selectedDriveId ?
            stops.length > 0 ?
              this.createElement('div', { class: 'stop-list' }, 
                stops.map(stop => 
                  this.createElement('div', { 
                    class: `stop-item ${selectedStopId === stop.id ? 'selected' : ''}`,
                    'data-stop-id': stop.id
                  }, [
                    this.createElement('span', {}, stop.name),
                    this.createElement('span', { class: 'entity-count' }, 
                      stop.entityCount || '0'
                    )
                  ])
                )
              ) :
              this.createElement('div', { class: 'empty-message' }, 'No stops available') :
            this.createElement('div', { class: 'empty-message' }, 'Select a drive')
      ]),
      
      // Entities column
      this.createElement('div', { class: 'entity-column' }, [
        this.createElement('div', { class: 'column-header' }, `${selectedStop ? selectedStop.name : ''} Entities`),
        
        loading.entities ? 
          this.createElement('div', { class: 'loading-indicator' }, 'Loading entities...') :
          selectedStopId ?
            entities.length > 0 ?
              this.createElement('div', { class: 'entity-list' }, 
                entities.map(entity => {
                  // Determine entity type-specific display
                  let displayName = entity.id;
                  let details = '';
                  let entityType = entity.type?.displayName || 'Entity';
                  
                  if (entity.address) {
                    displayName = entity.address.name || entity.address.street;
                    details = `${entity.address.street}, ${entity.address.city}, ${entity.address.state} ${entity.address.postalCode}`;
                    entityType = 'address';
                  } else if (entity.contact) {
                    displayName = `${entity.contact.firstName} ${entity.contact.lastName}`;
                    details = entity.contact.email || 'No email';
                    entityType = 'contact';
                  } else if (entity.opportunity) {
                    displayName = `Opportunity ${entity.id}`;
                    details = `Status: ${entity.opportunity.status}`;
                    entityType = 'opportunity';
                  }
                  
                  return this.createElement('div', { 
                    class: 'entity-item',
                    'data-entity-id': entity.id,
                    'data-entity-type': entityType
                  }, [
                    this.createElement('div', { class: 'entity-name' }, displayName),
                    this.createElement('div', { class: 'entity-type' }, entityType),
                    this.createElement('div', { class: 'entity-details' }, details)
                  ]);
                })
              ) :
              this.createElement('div', { class: 'empty-message' }, 'No entities in this stop') :
            this.createElement('div', { class: 'empty-message' }, 'Select a stop')
      ])
    ]);
    
    this.shadowRoot.appendChild(container);
  }
}

// Register component
if (!customElements.get('sales-track-view')) {
  customElements.define('sales-track-view', SalesTrackView);
}

export default SalesTrackView;