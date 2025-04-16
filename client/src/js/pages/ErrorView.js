/**
 * ErrorView.js
 * 
 * Error page component for SalesBlanket.
 * Displayed when navigation errors occur.
 */

import { BaseView } from '../components/BaseView.js';
import ViewState from '../services/ViewState.js';
import ViewHandler from '../services/ViewHandler.js';

export class ErrorView extends BaseView {
  constructor() {
    super();
    this.viewState = ViewState;
    this.viewHandler = ViewHandler;
    
    // Bind methods
    this.handleRetry = this.handleRetry.bind(this);
    this.handleGoHome = this.handleGoHome.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      error: this.viewState.getState('error') || 'Something went wrong'
    };
  }

  /**
   * Handle retry button click
   */
  handleRetry() {
    window.location.reload();
  }

  /**
   * Handle go home button click
   */
  handleGoHome() {
    this.viewHandler.navigateTo('dashboard', 'main', 'view');
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    const retryButton = this.shadowRoot.querySelector('.retry-button');
    if (retryButton) {
      this.addTrackedEventListener('click', this.handleRetry, {}, retryButton);
    }
    
    const homeButton = this.shadowRoot.querySelector('.home-button');
    if (homeButton) {
      this.addTrackedEventListener('click', this.handleGoHome, {}, homeButton);
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
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        background-color: #f5f5f5;
      }
      
      .error-container {
        width: 100%;
        max-width: 600px;
        padding: 3rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        text-align: center;
      }
      
      .error-icon {
        font-size: 4rem;
        color: #960018; /* Carmine Red */
        margin-bottom: 1.5rem;
      }
      
      .error-title {
        font-size: 1.8rem;
        font-weight: bold;
        color: #1A3A59; /* Golf Blau */
        margin-bottom: 1rem;
      }
      
      .error-message {
        font-size: 1.1rem;
        margin-bottom: 2rem;
        color: #4B5358; /* Agate Grey */
      }
      
      .error-detail {
        margin-bottom: 2rem;
        padding: 1rem;
        background-color: #f5f5f5;
        border-radius: 4px;
        font-family: monospace;
        text-align: left;
        overflow-x: auto;
      }
      
      .error-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
      }
      
      .error-button {
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .retry-button {
        background-color: #1A3A59; /* Golf Blau */
        color: white;
        border: none;
      }
      
      .retry-button:hover {
        background-color: #2D4A71; /* Shark Blue */
      }
      
      .home-button {
        background-color: transparent;
        color: #1A3A59; /* Golf Blau */
        border: 1px solid #1A3A59; /* Golf Blau */
      }
      
      .home-button:hover {
        background-color: rgba(26, 58, 89, 0.1);
      }
    `;
  }

  /**
   * Render component
   */
  render() {
    const { error } = this.getState();
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    const container = this.createElement('div', { class: 'error-container' }, [
      this.createElement('div', { class: 'error-icon' }, '!'),
      this.createElement('div', { class: 'error-title' }, 'Something went wrong'),
      this.createElement('div', { class: 'error-message' }, 'We encountered an error while loading this page.'),
      
      error && typeof error === 'string'
        ? this.createElement('div', { class: 'error-detail' }, error)
        : null,
      
      this.createElement('div', { class: 'error-actions' }, [
        this.createElement('button', { class: 'error-button retry-button' }, 'Retry'),
        this.createElement('button', { class: 'error-button home-button' }, 'Go to Dashboard')
      ])
    ]);
    
    this.shadowRoot.appendChild(container);
  }
}

// Register component
customElements.define('error-view', ErrorView);

export default ErrorView;