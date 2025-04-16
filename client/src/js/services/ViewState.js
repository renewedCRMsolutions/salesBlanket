/**
 * ViewState.js
 * 
 * Singleton service for maintaining application view state.
 * Provides centralized state management for views.
 */

// Initial application state
export const initialState = {
  currentGroup: null,
  currentTier: null,
  currentView: null,
  previousState: null,
  viewConfig: {},
  isAuthenticated: false,
  user: null,
  entities: [],
  activeEntityId: null,
  activeEntity: null,
  filters: {},
  loading: false,
  error: null
};

export class ViewState {
  static instance = null;

  constructor() {
    if (ViewState.instance) {
      return ViewState.instance;
    }
    
    ViewState.instance = this;
    this.state = { ...initialState };
    this.listeners = [];
  }

  /**
   * Get the current state
   * @param {string} key - Optional key to get specific state value
   * @returns {any} State value or entire state object
   */
  getState(key) {
    if (key) {
      return this.state[key];
    }
    return { ...this.state };
  }

  /**
   * Update application state
   * @param {Object} updates - State properties to update
   * @param {Boolean} silent - Whether to notify listeners
   */
  updateState(updates, silent = false) {
    // Save previous state
    const previousState = { ...this.state };
    
    // Apply updates
    this.state = {
      ...this.state,
      ...updates,
      previousState: previousState
    };
    
    // Notify listeners unless silent
    if (!silent) {
      this.notifyListeners({ previousState, currentState: this.state });
    }
    
    return this.state;
  }

  /**
   * Reset state to initial values
   * @param {Array} exclude - Keys to exclude from reset
   */
  resetState(exclude = []) {
    const preservedValues = {};
    
    if (exclude && exclude.length) {
      exclude.forEach(key => {
        if (this.state[key] !== undefined) {
          preservedValues[key] = this.state[key];
        }
      });
    }
    
    this.updateState({
      ...initialState,
      ...preservedValues
    });
  }

  /**
   * Add state change listener
   * @param {Function} listener - Callback function
   * @returns {Function} Function to remove listener
   */
  subscribe(listener) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of state change
   * @param {Object} detail - Event detail
   */
  notifyListeners(detail) {
    this.listeners.forEach(listener => {
      try {
        listener(detail);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
    
    // Also dispatch a global event for components to listen to
    window.dispatchEvent(
      new CustomEvent('viewstate-changed', {
        detail,
        bubbles: true
      })
    );
  }
}

// Export a singleton instance
export default new ViewState();