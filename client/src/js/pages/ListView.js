/**
 * ListView.js
 * 
 * List view for displaying data in tabular format.
 */

import { BaseView } from '../components/BaseView.js';

export class ListView extends BaseView {
  constructor() {
    super();
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      loading: false
    };
  }

  /**
   * Get component styles
   * @returns {string} CSS styles
   */
  getStyles() {
    return `
      ${super.getStyles()}
      
      :host {
        display: block;
        height: 100%;
      }
      
      .list-container {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      
      .list-header {
        padding: 1rem;
        background-color: #f5f5f5;
        border-bottom: 1px solid #ddd;
      }
      
      .list-title {
        font-size: 1.25rem;
        font-weight: bold;
      }
      
      .list-content {
        flex: 1;
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .list-placeholder {
        text-align: center;
        color: #666;
      }
    `;
  }

  /**
   * Render component
   */
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    const container = this.createElement('div', { class: 'list-container' }, [
      this.createElement('div', { class: 'list-header' }, [
        this.createElement('div', { class: 'list-title' }, 'List View')
      ]),
      this.createElement('div', { class: 'list-content' }, [
        this.createElement('div', { class: 'list-placeholder' }, [
          this.createElement('h2', {}, 'List View Placeholder'),
          this.createElement('p', {}, 'List items will be displayed here.')
        ])
      ])
    ]);
    
    this.shadowRoot.appendChild(container);
  }
}

// Register component
if (!customElements.get('list-view')) {
  customElements.define('list-view', ListView);
}

export default ListView;