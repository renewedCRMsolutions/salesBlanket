// /src/js/services/ViewHandler.js

/**
 * ViewHandler.js
 *
 * Simplified handler for SalesTrackView
 */

import { EventBus } from '/src/js/events/EventBus.js';
import ViewState from '/src/js/services/ViewState.js';

// Only include SalesTrackView
const VIEWS = {
  salesTrack: () => import('/src/js/views/salesTrack/SalesTrackView.js'),
  error: () => import('/src/js/views/ErrorView.js'),
};

export class ViewHandler {
  constructor() {
    this.viewState = ViewState;
    this.eventBus = EventBus;
    this.mountPoint = null;
    this.currentView = null;
  }

  initialize(mountPoint) {
    this.mountPoint = mountPoint || document.getElementById('app');

    if (!this.mountPoint) {
      console.error('ViewHandler: No mount point found');
      return;
    }

    // Load SalesTrackView by default
    this.loadView('salesTrack');
  }

  async loadView(viewName) {
    try {
      this.viewState.updateState({ loading: true });

      const module = await VIEWS[viewName]();
      const ViewComponent = module.default;

      this.viewState.updateState({ loading: false });
      this.renderView(ViewComponent, { viewName });
    } catch (error) {
      console.error('Failed to load view:', error);
      this.viewState.updateState({ loading: false, error: error.message });
      this.loadErrorView();
    }
  }

  async loadErrorView() {
    try {
      const module = await VIEWS.error();
      this.renderView(module.default, { errorType: 'general' });
    } catch (error) {
      this.mountPoint.innerHTML = `<div class="error-container">Something went wrong</div>`;
    }
  }

  renderView(ViewComponent, props = {}) {
    this.mountPoint.innerHTML = '';

    let tagName = ViewComponent.tagName || `${props.viewName}-view`;

    try {
      if (!customElements.get(tagName)) {
        customElements.define(tagName, ViewComponent);
      }
    } catch (error) {
      const fallbackTag = `view-element-${Date.now()}`;
      customElements.define(fallbackTag, ViewComponent);
      tagName = fallbackTag;
    }

    const viewElement = document.createElement(tagName);

    Object.entries(props).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        viewElement.setAttribute(key, value);
      }
    });

    this.currentView = viewElement;
    this.mountPoint.appendChild(viewElement);

    this.eventBus.emit('view:rendered', {
      view: props.viewName,
      element: viewElement,
    });
  }
}

export default new ViewHandler();
