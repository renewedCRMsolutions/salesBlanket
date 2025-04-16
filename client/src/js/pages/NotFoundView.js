/**
 * NotFoundView.js
 * 
 * 404 Not Found page component for SalesBlanket.
 * Displayed when navigating to non-existent routes.
 */

import { BaseView } from '../components/BaseView.js';
import ViewHandler from '../services/ViewHandler.js';

export class NotFoundView extends BaseView {
  constructor() {
    super();
    this.viewHandler = ViewHandler;
    
    // Bind methods
    this.handleGoHome = this.handleGoHome.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      path: window.location.pathname
    };
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
      
      .not-found-container {
        width: 100%;
        max-width: 600px;
        padding: 3rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        text-align: center;
      }
      
      .not-found-code {
        font-size: 6rem;
        font-weight: bold;
        color: #1A3A59; /* Golf Blau */
        margin-bottom: 1rem;
        line-height: 1;
      }
      
      .not-found-title {
        font-size: 1.8rem;
        font-weight: bold;
        color: #1A3A59; /* Golf Blau */
        margin-bottom: 1rem;
      }
      
      .not-found-message {
        font-size: 1.1rem;
        margin-bottom: 2rem;
        color: #4B5358; /* Agate Grey */
      }
      
      .not-found-path {
        margin-bottom: 2rem;
        padding: 1rem;
        background-color: #f5f5f5;
        border-radius: 4px;
        font-family: monospace;
        display: inline-block;
      }
      
      .home-button {
        padding: 0.75rem 1.5rem;
        background-color: #1A3A59; /* Golf Blau */
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .home-button:hover {
        background-color: #2D4A71; /* Shark Blue */
      }
    `;
  }

  /**
   * Render component
   */
  render() {
    const { path } = this.getState();
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    const container = this.createElement('div', { class: 'not-found-container' }, [
      this.createElement('div', { class: 'not-found-code' }, '404'),
      this.createElement('div', { class: 'not-found-title' }, 'Page Not Found'),
      this.createElement('div', { class: 'not-found-message' }, 'The page you are looking for doesn\'t exist or has been moved.'),
      
      path ? this.createElement('div', { class: 'not-found-path' }, path) : null,
      
      this.createElement('button', { class: 'home-button' }, 'Go to Dashboard')
    ]);
    
    this.shadowRoot.appendChild(container);
  }
}

// Register component
customElements.define('not-found-view', NotFoundView);

export default NotFoundView;