// /src/js/events/EventBus.js
/**
 * EventBus.js
 * Centralized event bus for application-wide communication
 */

export class EventBus {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @param {Object} context - Context to bind to callback
   * @returns {Function} Unsubscribe function
   */
  on(event, callback, context = null) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const handlers = this.events.get(event);
    const handler = { callback, context };
    handlers.push(handler);

    return () => this.off(event, callback, context);
  }

  /**
   * Subscribe to an event once
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @param {Object} context - Context to bind to callback
   */
  once(event, callback, context = null) {
    if (!this.onceEvents.has(event)) {
      this.onceEvents.set(event, []);
    }

    const handlers = this.onceEvents.get(event);
    handlers.push({ callback, context });
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @param {Object} context - Context that was bound to callback
   */
  off(event, callback, context = null) {
    if (!this.events.has(event)) return;

    const handlers = this.events.get(event);
    const filteredHandlers = handlers.filter(
      (handler) => handler.callback !== callback || handler.context !== context
    );

    this.events.set(event, filteredHandlers);
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data = {}) {
    // Process regular subscribers
    if (this.events.has(event)) {
      const handlers = this.events.get(event);
      handlers.forEach((handler) => {
        try {
          if (handler.context) {
            handler.callback.call(handler.context, data);
          } else {
            handler.callback(data);
          }
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }

    // Process one-time subscribers
    if (this.onceEvents.has(event)) {
      const handlers = this.onceEvents.get(event);
      handlers.forEach((handler) => {
        try {
          if (handler.context) {
            handler.callback.call(handler.context, data);
          } else {
            handler.callback(data);
          }
        } catch (error) {
          console.error(`Error in one-time event handler for ${event}:`, error);
        }
      });

      // Clear one-time handlers
      this.onceEvents.set(event, []);
    }
  }
}

// Export singleton instance
export default new EventBus();
