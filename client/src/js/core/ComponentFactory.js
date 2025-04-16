// /src/js/core/ComponentFactory.js
import { EventBus } from '/src/js/events/EventBus.js';

export class ComponentFactory {
  constructor() {
    this.registry = new Map();
    this.eventBus = EventBus;
  }

  /**
   * Register a component class
   */
  register(name, componentClass, config = {}) {
    if (!customElements.get(name)) {
      customElements.define(name, componentClass);
    }

    this.registry.set(name, { componentClass, config });
    this.eventBus.emit('component:registered', { name, config });

    return this;
  }

  /**
   * Create a component instance
   */
  create(name, props = {}) {
    if (!this.registry.has(name)) {
      throw new Error(`Component ${name} not registered`);
    }

    const element = document.createElement(name);

    Object.entries(props).forEach(([key, value]) => {
      if (typeof value === 'object') {
        element.setAttribute(key, JSON.stringify(value));
      } else {
        element.setAttribute(key, value);
      }
    });

    return element;
  }
}

export default new ComponentFactory();
