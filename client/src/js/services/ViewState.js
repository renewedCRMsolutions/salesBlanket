/**
 * ViewState.js
 *
 * State management service with transaction support and Redis persistence
 */

import { EventBus } from '../events/EventBus.js';
import RedisClient from '../cache/RedisClient.js';

// Initial application state
export const initialState = {
  currentView: null,
  previousView: null,
  viewConfig: {},
  isAuthenticated: false,
  user: null,
  entities: [],
  activeEntityId: null,
  activeEntity: null,
  filters: {},
  loading: false,
  error: null,
};

export class ViewState {
  constructor(initialData = initialState, redisClient = null) {
    this.state = { ...initialData };
    this.listeners = new Map();
    this.transaction = null;
    this.redisClient = redisClient || RedisClient;
    this.eventBus = EventBus;

    // Initialize state from Redis if available
    this._initFromCache();
  }

  async _initFromCache() {
    try {
      const cachedState = await this.redisClient.get('viewState:current');
      if (cachedState) {
        const parsedState = JSON.parse(cachedState);
        this.state = { ...this.state, ...parsedState };
        this.eventBus.emit('state:restored', { source: 'redis' });
      }
    } catch (error) {
      console.error('Failed to restore state from cache:', error);
    }
  }

  /**
   * Get current state or a specific key
   */
  getState(key) {
    if (key) {
      return this.state[key];
    }
    return { ...this.state };
  }

  /**
   * Start a transaction for batched updates
   */
  beginTransaction() {
    this.transaction = { ...this.state };
    return this;
  }

  /**
   * Add updates to current transaction
   */
  addToTransaction(updates) {
    if (!this.transaction) {
      throw new Error('No active transaction. Call beginTransaction first.');
    }

    this.transaction = {
      ...this.transaction,
      ...updates,
    };

    return this;
  }

  /**
   * Commit current transaction
   */
  commitTransaction(silent = false) {
    if (!this.transaction) {
      throw new Error('No active transaction to commit');
    }

    const previousState = { ...this.state };
    this.state = {
      ...this.transaction,
      previousState,
    };

    // Store in Redis
    this._persistStateToCache();

    // Clear transaction
    const committedState = this.transaction;
    this.transaction = null;

    // Notify listeners
    if (!silent) {
      this.notifyListeners({ previousState, currentState: this.state });
    }

    return committedState;
  }

  /**
   * Rollback current transaction
   */
  rollbackTransaction() {
    if (!this.transaction) {
      throw new Error('No active transaction to rollback');
    }

    const discarded = this.transaction;
    this.transaction = null;
    this.eventBus.emit('transaction:rollback', { discarded });

    return this;
  }

  /**
   * Standard update without transaction
   */
  updateState(updates, silent = false) {
    const previousState = { ...this.state };

    this.state = {
      ...this.state,
      ...updates,
      previousState,
    };

    // Persist to Redis
    this._persistStateToCache();

    if (!silent) {
      this.notifyListeners({ previousState, currentState: this.state });
    }

    return this.state;
  }

  /**
   * Persist state to Redis
   */
  async _persistStateToCache() {
    try {
      // Don't store previous state in cache to avoid recursive growth
      const { previousState, ...stateToPersist } = this.state;
      await this.redisClient.set('viewState:current', JSON.stringify(stateToPersist), 3600);
      this.eventBus.emit('state:persisted', { destination: 'redis' });
    } catch (error) {
      console.error('Failed to persist state to cache:', error);
    }
  }

  /**
   * Reset state to initial values with exclusions
   */
  resetState(exclude = []) {
    const preservedValues = exclude.reduce((acc, key) => {
      if (this.state[key] !== undefined) {
        acc[key] = this.state[key];
      }
      return acc;
    }, {});

    this.updateState({
      ...initialState,
      ...preservedValues,
    });

    return this.state;
  }

  /**
   * Subscribe to state changes with namespaced listeners
   */
  subscribe(namespace, listener) {
    if (!namespace) {
      throw new Error('Namespace is required for subscriptions');
    }

    this.listeners.set(namespace, listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(namespace);
    };
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners(detail) {
    for (const listener of this.listeners.values()) {
      try {
        listener(detail);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    }

    // Dispatch global event
    this.eventBus.emit('state:changed', detail);
    window.dispatchEvent(
      new CustomEvent('viewstate-changed', {
        detail: {
          previousState: detail.previousState,
          currentState: this.state,
          view: this.state.currentView,
        },
        bubbles: true,
      })
    );
  }
}

// Create and export service
const viewState = new ViewState();
export default viewState;

// Also export class for testing or custom instances
export { ViewState };
