/**
 * BaseView.js
 *
 * Foundation component for all view components in salesBlanket.
 * Implements standard lifecycle, state management, and event handling.
 */

export class BaseView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._state = {};
    this._initialized = false;
    this._eventListeners = [];

    // Bind methods
    this.setState = this.setState.bind(this);
    this.getState = this.getState.bind(this);
    this.render = this.render.bind(this);
    this.addEventListeners = this.addEventListeners.bind(this);
    this.removeEventListeners = this.removeEventListeners.bind(this);
  }

  /**
   * Get component state
   * @param {string} key - Optional key to get specific state value
   * @returns {any} State value or entire state object
   */
  getState(key) {
    if (key) {
      return this._state[key];
    }
    return { ...this._state };
  }

  /**
   * Update component state
   * @param {Object} newState - State updates to merge
   * @param {boolean} shouldRender - Whether to trigger render after update
   */
  setState(newState, shouldRender = true) {
    this._state = { ...this._state, ...newState };

    // Dispatch state change event
    this.dispatchEvent(
      new CustomEvent('state-changed', {
        detail: {
          previousState: { ...this._state, ...newState },
          currentState: this._state,
        },
        bubbles: true,
        composed: true,
      })
    );

    if (shouldRender) {
      this.render();
    }
  }

  /**
   * Add event listener with automatic tracking for cleanup
   * @param {string} type - Event type
   * @param {Function} listener - Event handler
   * @param {Object|boolean} options - Event options
   * @param {Element} element - Target element (defaults to this)
   */
  addTrackedEventListener(type, listener, options, element = this) {
    element.addEventListener(type, listener, options);
    this._eventListeners.push({ type, listener, options, element });
  }

  /**
   * Remove all tracked event listeners
   */
  removeEventListeners() {
    this._eventListeners.forEach(({ type, listener, options, element }) => {
      element.removeEventListener(type, listener, options);
    });
    this._eventListeners = [];
  }

  /**
   * Add component event listeners
   * Override in subclasses
   */
  addEventListeners() {
    // Override in subclasses
  }

  /**
   * Initialize the component
   * Override in subclasses
   */
  initialize() {
    // Override in subclasses
  }

  /**
   * Render component content
   * Override in subclasses
   */
  render() {
    // Override in subclasses
  }

  /**
   * Apply common styles to component
   * @returns {string} CSS styles
   */
  getStyles() {
    return `
      :host {
        display: block;
        box-sizing: border-box;
        font-family: 'Open Sans', sans-serif;
      }
      
      *, *::before, *::after {
        box-sizing: border-box;
      }
    `;
  }

  /**
   * Connected callback (when element is added to DOM)
   */
  connectedCallback() {
    if (!this._initialized) {
      this.initialize();
      this._initialized = true;
    }

    this.addEventListeners();
    this.render();
  }

  /**
   * Disconnected callback (when element is removed from DOM)
   */
  disconnectedCallback() {
    this.removeEventListeners();
  }

  /**
   * Adopted callback (when element is moved to new document)
   */
  adoptedCallback() {
    this.render();
  }

  /**
   * Create style element with component styles
   * @returns {HTMLStyleElement} Style element
   */
  createStyles() {
    const style = document.createElement('style');
    style.textContent = this.getStyles();
    return style;
  }

  /**
   * Create standard element with Shadow DOM
   * @param {string} tag - HTML tag name
   * @param {Object} props - Element properties and attributes
   * @param {Array|Element} children - Child elements or content
   * @returns {HTMLElement} Created element
   */
  createElement(tag, props = {}, children = []) {
    const element = document.createElement(tag);

    Object.entries(props).forEach(([key, value]) => {
      if (key.startsWith('on')) {
        const eventType = key.slice(2).toLowerCase();
        element.addEventListener(eventType, value);
      } else if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else {
        element.setAttribute(key, value);
      }
    });

    if (typeof children === 'string') {
      element.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach((child) => {
        if (child) {
          try {
            if (typeof child === 'string') {
              element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
              element.appendChild(child);
            } else {
              console.warn('Invalid child type:', typeof child, child);
            }
          } catch (error) {
            console.error('Error appending child:', error, child);
          }
        }
      });
    } else if (children instanceof Node) {
      element.appendChild(children);
    }

    return element;
  }
}

// Register the component if not already registered
if (!customElements.get('base-view')) {
  customElements.define('base-view', BaseView);
}

export default BaseView;
