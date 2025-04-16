/**
 * CalendarView.js
 * 
 * Weekly calendar view component that displays addresses by day of the week.
 */

import { BaseView } from '../components/BaseView.js';
import ViewState from '../services/ViewState.js';

export class CalendarView extends BaseView {
  constructor() {
    super();
    this.viewState = ViewState;
    
    // Bind methods
    this.handleAddressClick = this.handleAddressClick.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      weekDays: this.generateWeekDays(),
      addresses: [],
      currentWeek: new Date(),
      loading: false
    };
    
    // Load addresses (simulated for now)
    this.loadAddresses();
  }

  /**
   * Generate array of week days starting from Monday
   */
  generateWeekDays() {
    const currentDate = new Date();
    const day = currentDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    // Calculate the Monday of current week
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() - (day === 0 ? 6 : day - 1));
    
    // Generate the 7 days of the week
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      weekDays.push({
        date,
        dayName: date.toLocaleString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleString('en-US', { month: 'short' }),
        formatted: date.toISOString().split('T')[0]
      });
    }
    
    return weekDays;
  }

  /**
   * Simulate loading addresses
   */
  loadAddresses() {
    this.setState({ loading: true });
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock data based on the image shared
      const addresses = [
        {
          id: 1,
          displayDate: this.getState().weekDays[3].formatted, // Thursday
          name: 'Chicago HQ',
          street: '100 Michigan Ave',
          city: 'Chicago',
          state: 'IL',
          zip: '60601',
          type: 'headquarters'
        },
        {
          id: 2,
          displayDate: this.getState().weekDays[3].formatted, // Thursday
          name: 'Test Sequence Address',
          street: '123 Sequence St',
          city: 'Chicago',
          state: 'IL',
          zip: '60601',
          type: 'test'
        },
        {
          id: 3,
          displayDate: this.getState().weekDays[3].formatted, // Thursday
          name: 'Minneapolis HQ',
          street: '100 Nicollet Mall',
          city: 'Minneapolis',
          state: 'MN',
          zip: '55403',
          type: 'headquarters'
        },
        {
          id: 4,
          displayDate: this.getState().weekDays[3].formatted, // Thursday
          name: 'Minneapolis Branch',
          street: '200 Hennepin Ave',
          city: 'Minneapolis',
          state: 'MN',
          zip: '55403',
          type: 'branch'
        },
        {
          id: 5,
          displayDate: this.getState().weekDays[3].formatted, // Thursday
          name: 'Daniel Kozlowski',
          street: '508 Evans City Rd',
          city: 'Chicago',
          state: 'IL',
          zip: '60601',
          type: 'customer'
        },
        {
          id: 6,
          displayDate: this.getState().weekDays[0].formatted, // Monday
          name: '921 Edgar St',
          street: '921 Edgar Street',
          city: 'Evansville',
          state: 'IN',
          zip: '47711',
          type: 'customer'
        },
        {
          id: 7,
          displayDate: this.getState().weekDays[0].formatted, // Monday
          name: '915 Bellemeade Ave',
          street: '915 Bellemeade Avenue',
          city: 'Evansville',
          state: 'IN',
          zip: '47714',
          type: 'customer'
        },
        {
          id: 8,
          displayDate: this.getState().weekDays[0].formatted, // Monday
          name: '909 Oak Hill Rd',
          street: '909 Oak Hill Road',
          city: 'Evansville',
          state: 'IN',
          zip: '47711',
          type: 'customer'
        }
      ];
      
      this.setState({
        addresses,
        loading: false
      });
    }, 500);
  }

  /**
   * Handle address click event
   * @param {Event} event - Click event
   */
  handleAddressClick(event) {
    const addressItem = event.target.closest('[data-address-id]');
    if (!addressItem) return;
    
    const addressId = addressItem.dataset.addressId;
    
    // Set the active entity in the view state
    this.viewState.updateState({
      activeEntityId: addressId,
      activeEntity: this.getState().addresses.find(a => a.id.toString() === addressId)
    });
    
    // Show address details (handled by a separate component in a real implementation)
    console.log('Selected address:', addressId);
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    const calendarGrid = this.shadowRoot.querySelector('.calendar-grid');
    if (calendarGrid) {
      this.addTrackedEventListener('click', this.handleAddressClick, {}, calendarGrid);
    }
  }

  /**
   * Define component styles
   * @returns {string} Component CSS
   */
  getStyles() {
    return `
      ${super.getStyles()}
      
      .calendar-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 1rem;
      }
      
      .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .calendar-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: #2F4F2F; /* Brewster Green */
      }
      
      .calendar-controls {
        display: flex;
        gap: 0.5rem;
      }
      
      .calendar-control-button {
        background-color: #2D4A71; /* Shark Blue */
        color: white;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      
      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.5rem;
        flex: 1;
        min-height: 0;
      }
      
      .calendar-day {
        background-color: #f5f5f5;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
      
      .day-header {
        background-color: #1A3A59; /* Golf Blau */
        color: white;
        text-align: center;
        padding: 0.5rem;
      }
      
      .day-name {
        font-weight: bold;
      }
      
      .day-date {
        font-size: 0.9rem;
      }
      
      .day-content {
        overflow-y: auto;
        flex: 1;
        padding: 0.5rem;
        background-color: #e9eaed;
      }
      
      .no-addresses {
        color: #888;
        text-align: center;
        font-style: italic;
        margin-top: 1rem;
      }
      
      .address-item {
        background-color: white;
        border-radius: 4px;
        margin-bottom: 0.5rem;
        padding: 0.5rem;
        cursor: pointer;
        transition: transform 0.1s, box-shadow 0.1s;
      }
      
      .address-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 3px 6px rgba(0,0,0,0.1);
      }
      
      .address-name {
        font-weight: bold;
      }
      
      .address-street {
        margin-top: 0.25rem;
        font-size: 0.9rem;
      }
      
      .address-item[data-type="headquarters"] {
        border-left: 4px solid #3B7B9E; /* Fjord */
      }
      
      .address-item[data-type="branch"] {
        border-left: 4px solid #1E4A43; /* Eberle Green */
      }
      
      .address-item[data-type="customer"] {
        border-left: 4px solid #9CCB19; /* Lime Green */
      }
      
      .address-item[data-type="test"] {
        border-left: 4px solid #FFC20E; /* Racing Yellow */
      }
    `;
  }

  /**
   * Render component template
   */
  render() {
    const { weekDays, addresses, loading } = this.getState();
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    const container = this.createElement('div', { class: 'calendar-container' }, [
      // Calendar header
      this.createElement('div', { class: 'calendar-header' }, [
        this.createElement('div', { class: 'calendar-title' }, 'My Week'),
        this.createElement('div', { class: 'calendar-controls' }, [
          this.createElement('button', { class: 'calendar-control-button' }, '←'),
          this.createElement('button', { class: 'calendar-control-button' }, '⋮'),
          this.createElement('button', { class: 'calendar-control-button' }, '→')
        ])
      ]),
      
      // Calendar grid
      this.createElement('div', { class: 'calendar-grid' }, 
        weekDays.map(day => {
          // Filter addresses for this day
          const dayAddresses = addresses.filter(addr => addr.displayDate === day.formatted);
          
          return this.createElement('div', { class: 'calendar-day' }, [
            // Day header
            this.createElement('div', { class: 'day-header' }, [
              this.createElement('div', { class: 'day-name' }, day.dayName),
              this.createElement('div', { class: 'day-date' }, `${day.month} ${day.dayNumber}`)
            ]),
            
            // Day content
            this.createElement('div', { class: 'day-content' }, 
              dayAddresses.length > 0 
                ? dayAddresses.map(address => 
                    this.createElement('div', { 
                      class: 'address-item', 
                      'data-address-id': address.id,
                      'data-type': address.type
                    }, [
                      this.createElement('div', { class: 'address-name' }, address.name),
                      this.createElement('div', { class: 'address-street' }, address.street)
                    ])
                  )
                : this.createElement('div', { class: 'no-addresses' }, 'No addresses')
            )
          ]);
        })
      )
    ]);
    
    this.shadowRoot.appendChild(container);
  }
}

// Register the component
if (!customElements.get('calendar-view')) {
  customElements.define('calendar-view', CalendarView);
}

export default CalendarView;