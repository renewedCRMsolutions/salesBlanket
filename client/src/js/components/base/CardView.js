// /src/js/components/base/CardView.js
/**
 * CardView.js
 * Base component for card-style UI elements
 */

import { BaseView } from './BaseView.js';
import { EventBus } from '../events/EventBus.js';

export class CardView extends BaseView {
  static get observedAttributes() {
    return ['card-type', 'view-mode', 'loading'];
  }

  constructor() {
    super();
    this.eventBus = EventBus;
  }

  initialize() {
    this._state = {
      loading: this.hasAttribute('loading'),
      viewMode: this.getAttribute('view-mode') || 'compact',
      cardType: this.getAttribute('card-type') || 'default',
      data: null,
      error: null,
    };
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'loading') {
      this.setState({ loading: this.hasAttribute('loading') });
    } else if (['card-type', 'view-mode'].includes(name)) {
      this.setState({
        [name === 'card-type' ? 'cardType' : 'viewMode']: newValue,
      });
    }
  }

  renderSkeleton() {
    return this.createElement('div', { class: 'base-card' }, [
      this.createElement('div', { class: 'card-header' }, [
        'Loading...',
        this.createElement('span', { class: 'card-count' }, '...'),
      ]),
      this.createElement('div', { class: 'card-content' }, [
        this.createElement('div', { class: 'skeleton skeleton-title' }),
        this.createElement('div', { class: 'skeleton skeleton-text' }),
        this.createElement('div', { class: 'skeleton skeleton-text-short' }),
        this.createElement('div', { class: 'card-actions' }, [
          this.createElement('button', { class: 'secondary-button' }, 'View'),
          this.createElement('button', { class: 'primary-button' }, 'Action'),
        ]),
      ]),
    ]);
  }

  renderError(message) {
    return this.createElement('div', { class: 'error-message' }, message);
  }

  renderCardHeader(title, count) {
    return this.createElement(
      'div',
      {
        class: `card-header card-header-${this.getState().cardType}`,
      },
      [
        title,
        count !== undefined ? this.createElement('span', { class: 'card-count' }, count) : null,
      ]
    );
  }

  renderCardActions(actions) {
    const actionsContainer = this.createElement('div', { class: 'card-actions' });

    actions.forEach((action) => {
      const button = this.createElement(
        'button',
        {
          class: `${action.primary ? 'primary' : 'secondary'}-button`,
          'data-action': action.action,
        },
        action.label
      );

      actionsContainer.appendChild(button);
    });

    return actionsContainer;
  }

  getStyles() {
    return `
     ${super.getStyles()}
     
     :host {
       display: block;
       margin-bottom: 1rem;
     }
     
     .base-card {
       background-color: white;
       border-radius: 8px;
       box-shadow: 0 2px 5px rgba(0,0,0,0.1);
       overflow: hidden;
     }
     
     .card-header {
       padding: 0.75rem;
       font-weight: bold;
       display: flex;
       justify-content: space-between;
       align-items: center;
       background-color: var(--card-header-color, #2F4F2F);
       color: white;
     }
     
     .card-header-default {
       background-color: #2F4F2F;
     }
     
     .card-count {
       background-color: rgba(255,255,255,0.3);
       border-radius: 50%;
       width: 24px;
       height: 24px;
       display: flex;
       align-items: center;
       justify-content: center;
       font-size: 0.8rem;
     }
     
     .card-content {
       padding: 1rem;
     }
     
     .card-title {
       font-weight: bold;
       font-size: 1.1rem;
       margin-bottom: 0.5rem;
     }
     
     .card-metadata {
       font-size: 0.85rem;
       color: #666;
       margin: 0.5rem 0;
     }
     
     .card-metadata-label {
       font-weight: bold;
       display: inline-block;
       width: 100px;
     }
     
     .card-actions {
       display: flex;
       gap: 0.5rem;
       margin-top: 1rem;
     }
     
     .secondary-button, .primary-button {
       flex: 1;
       border: none;
       padding: 0.5rem;
       border-radius: 4px;
       font-weight: bold;
       cursor: pointer;
     }
     
     .secondary-button {
       background-color: #FFC20E;
       color: #1A3A59;
     }
     
     .primary-button {
       background-color: #1A3A59;
       color: white;
     }
     
     /* Loading skeletons */
     .skeleton {
       background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
       background-size: 200% 100%;
       animation: loading 1.5s infinite;
       border-radius: 4px;
       height: 1rem;
       margin-bottom: 0.5rem;
     }
     
     .skeleton-title {
       height: 1.2rem;
       width: 70%;
     }
     
     .skeleton-text {
       height: 1rem;
       width: 100%;
     }
     
     .skeleton-text-short {
       height: 1rem;
       width: 60%;
     }
     
     .error-message {
       padding: 1rem;
       background-color: rgba(255,0,0,0.1);
       color: #c00;
       border-radius: 4px;
     }
     
     @keyframes loading {
       0% { background-position: 200% 0; }
       100% { background-position: -200% 0; }
     }
   `;
  }

  render() {
    // This should be overridden by child classes
    const { loading, error } = this.getState();

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());

    if (loading) {
      this.shadowRoot.appendChild(this.renderSkeleton());
    } else if (error) {
      this.shadowRoot.appendChild(this.renderError(error));
    } else {
      this.shadowRoot.appendChild(
        this.createElement('div', { class: 'base-card' }, [
          this.renderCardHeader('Card Title'),
          this.createElement('div', { class: 'card-content' }, [
            this.createElement('div', { class: 'card-title' }, 'Base Card'),
            this.createElement('p', {}, 'Override this render method in child classes'),
            this.renderCardActions([
              { label: 'View', action: 'view', primary: false },
              { label: 'Action', action: 'primary', primary: true },
            ]),
          ]),
        ])
      );
    }
  }
}

// Register the component
if (!customElements.get('card-view')) {
  customElements.define('card-view', CardView);
}

export default CardView;
