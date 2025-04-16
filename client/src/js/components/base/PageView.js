/**
 * PageView.js
 * Main container component for the application layout.
 */

import { BaseView } from './base/BaseView.js';
import ViewState from '../services/ViewState.js';
import ViewHandler from '../services/ViewHandler.js';
import { EventBus } from '../events/EventBus.js';

export class PageView extends BaseView {
  constructor() {
    super();
    this.viewState = ViewState;
    this.viewHandler = ViewHandler;
    this.eventBus = EventBus;
  }

  initialize() {
    this._state = {
      currentView: null,
      user: this.viewState.getState('user'),
      isAuthenticated: this.viewState.getState('isAuthenticated'),
      loading: false,
    };

    // Use namespaced subscription
    this.unsubscribe = this.viewState.subscribe('pageView', this.handleViewStateChange.bind(this));

    // Listen for global events
    this.eventBus.on('view:loading', (data) => this.setState({ loading: true }));
    this.eventBus.on('view:rendered', (data) => this.setState({ loading: false }));
  }

  handleViewStateChange({ currentState }) {
    this.setState({
      currentView: currentState.currentView,
      user: currentState.user,
      isAuthenticated: currentState.isAuthenticated,
    });
  }

  handleNavigation(event) {
    const navItem = event.target.closest('[data-view]');
    if (!navItem) return;

    const viewName = navItem.dataset.view;
    event.preventDefault();
    this.viewHandler.navigateTo(viewName);
    this.updateActiveNavigation(viewName);
  }

  updateActiveNavigation(viewName) {
    const navItems = this.shadowRoot.querySelectorAll('[data-view]');
    navItems.forEach((item) => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });
  }

  addEventListeners() {
    const nav = this.shadowRoot.querySelector('nav');
    if (nav) {
      this.addTrackedEventListener('click', this.handleNavigation.bind(this), {}, nav);
    }
  }

  renderHeader() {
    return this.createElement('header', {}, [
      this.createElement('div', { class: 'logo' }, [
        'salesBlanket',
        this.createElement('span', { class: 'version' }, 'v4'),
      ]),
      this.renderHeaderControls(),
    ]);
  }

  renderHeaderControls() {
    const { user, isAuthenticated } = this.getState();

    return this.createElement('div', { class: 'header-controls' }, [
      this.renderAddButton(),
      this.createElement('input', {
        type: 'text',
        class: 'search-box',
        placeholder: 'Search...',
      }),
      this.createElement('div', { class: 'user-controls' }, [
        isAuthenticated
          ? [
              this.createElement('span', {}, user?.name || 'User'),
              this.createElement('button', { class: 'login-button' }, 'Logout'),
            ]
          : this.createElement('button', { class: 'login-button' }, 'Login'),
      ]),
    ]);
  }

  renderAddButton() {
    const btn = this.createElement('button', { class: 'add-button' }, '+ Add Record');
    btn.addEventListener('click', this.handleAddRecord.bind(this));
    return btn;
  }

  handleAddRecord() {
    this.eventBus.emit('entity:add', {});

    // Modern dynamic import approach
    import('../components/entity/AddEntityModal.js')
      .then((module) => {
        if (!customElements.get('add-entity-modal')) {
          customElements.define('add-entity-modal', module.default);
        }
        this.showModal();
      })
      .catch((error) => {
        console.error('Error loading modal:', error);
      });
  }

  showModal() {
    const modal = document.createElement('add-entity-modal');
    document.body.appendChild(modal);
    modal.dataset.temporary = 'true';
    modal.initialize();
    setTimeout(() => modal.open(), 100);
  }

  renderNavigation() {
    const { currentView } = this.getState();

    const navItems = [
      { view: 'salesDash', label: 'Dashboard' },
      { view: 'salesTrack', label: 'Sales Track' },
      { view: 'salesZones', label: 'Zones' },
      { view: 'salesHoods', label: 'Neighborhoods' },
      { view: 'calendar', label: 'Calendar' },
    ];

    return this.createElement(
      'nav',
      {},
      navItems.map((item) =>
        this.createElement(
          'a',
          {
            'data-view': item.view,
            class: currentView === item.view ? 'active' : '',
          },
          item.label
        )
      )
    );
  }

  render() {
    const { loading } = this.getState();

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());

    const container = this.createElement('div', { class: 'app-container' }, [
      this.renderHeader(),
      this.renderNavigation(),
      this.createElement('main', {}, [
        loading ? this.createElement('div', { class: 'loading-indicator' }) : null,
        this.createElement('div', { class: 'content-area', id: 'content' }),
      ]),
      this.renderFooter(),
    ]);

    this.shadowRoot.appendChild(container);

    // Initialize view handler
    const contentArea = this.shadowRoot.querySelector('#content');
    if (contentArea && !this.initialized) {
      this.viewHandler.initialize(contentArea);
      this.initialized = true;
    }
  }

  renderFooter() {
    return this.createElement('footer', {}, [
      this.createElement('div', {}, '© 2025 salesBlanket'),
      this.createElement('div', { class: 'footer-actions' }, [
        this.createElement('a', { class: 'footer-action', href: '#' }, 'Dashboard'),
        this.createElement('a', { class: 'footer-action', href: '#' }, 'Support'),
      ]),
    ]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

// Register the component
if (!customElements.get('page-view')) {
  customElements.define('page-view', PageView);
}

export default PageView;
