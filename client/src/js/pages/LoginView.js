/**
 * LoginView.js
 * 
 * Login page component for SalesBlanket.
 */

import { BaseView } from '../components/BaseView.js';
import ViewState from '../services/ViewState.js';
import ViewHandler from '../services/ViewHandler.js';

export class LoginView extends BaseView {
  constructor() {
    super();
    this.viewState = ViewState;
    this.viewHandler = ViewHandler;
    
    // Bind methods
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      email: '',
      password: '',
      error: null,
      loading: false
    };
  }

  /**
   * Handle login form submission
   * @param {Event} event - Submit event
   */
  async handleLoginSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    
    if (!email || !password) {
      this.setState({ error: 'Please enter both email and password' });
      return;
    }
    
    this.setState({ loading: true, error: null });
    
    try {
      // In a real app, this would call an API
      // For demo, we'll simulate login with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful login
      this.viewState.updateState({
        isAuthenticated: true,
        user: {
          id: 1,
          name: 'Demo User',
          email: email,
          roles: ['sales_rep']
        }
      });
      
      // Navigate to dashboard
      this.viewHandler.navigateTo('dashboard', 'main', 'view');
      
    } catch (error) {
      console.error('Login error:', error);
      this.setState({ 
        error: 'Invalid credentials. Please try again.',
        loading: false
      });
    }
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    const loginForm = this.shadowRoot.querySelector('form');
    if (loginForm) {
      this.addTrackedEventListener('submit', this.handleLoginSubmit, {}, loginForm);
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
      
      .login-container {
        width: 100%;
        max-width: 400px;
        padding: 2rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      
      .logo-container {
        text-align: center;
        margin-bottom: 2rem;
      }
      
      .logo {
        font-size: 2rem;
        font-weight: bold;
        color: #2F4F2F; /* Brewster Green */
      }
      
      .version {
        font-size: 0.8rem;
        color: #666;
        margin-top: 0.25rem;
      }
      
      .form-group {
        margin-bottom: 1.5rem;
      }
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
      
      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }
      
      input:focus {
        outline: none;
        border-color: #1A3A59; /* Golf Blau */
        box-shadow: 0 0 0 2px rgba(26, 58, 89, 0.2);
      }
      
      .error-message {
        color: #960018; /* Carmine Red */
        margin-bottom: 1rem;
        font-size: 0.9rem;
        font-weight: 500;
      }
      
      .login-button {
        width: 100%;
        padding: 0.75rem;
        background-color: #1A3A59; /* Golf Blau */
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .login-button:hover {
        background-color: #2D4A71; /* Shark Blue */
      }
      
      .login-button:disabled {
        background-color: #9EA3B0; /* Platinum */
        cursor: not-allowed;
      }
      
      .additional-options {
        margin-top: 1.5rem;
        text-align: center;
        color: #666;
        font-size: 0.9rem;
      }
      
      .additional-options a {
        color: #1A3A59; /* Golf Blau */
        text-decoration: none;
      }
      
      .additional-options a:hover {
        text-decoration: underline;
      }
      
      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
        margin-right: 0.5rem;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
  }

  /**
   * Render component
   */
  render() {
    const { error, loading } = this.getState();
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    const container = this.createElement('div', { class: 'login-container' }, [
      // Logo
      this.createElement('div', { class: 'logo-container' }, [
        this.createElement('div', { class: 'logo' }, 'SalesBlanket'),
        this.createElement('div', { class: 'version' }, 'v4')
      ]),
      
      // Error message
      error ? this.createElement('div', { class: 'error-message' }, error) : null,
      
      // Login form
      this.createElement('form', { id: 'loginForm' }, [
        // Email
        this.createElement('div', { class: 'form-group' }, [
          this.createElement('label', { for: 'email' }, 'Email'),
          this.createElement('input', {
            type: 'email',
            id: 'email',
            name: 'email',
            placeholder: 'Enter your email',
            required: true,
            autocomplete: 'email'
          })
        ]),
        
        // Password
        this.createElement('div', { class: 'form-group' }, [
          this.createElement('label', { for: 'password' }, 'Password'),
          this.createElement('input', {
            type: 'password',
            id: 'password',
            name: 'password',
            placeholder: 'Enter your password',
            required: true,
            autocomplete: 'current-password'
          })
        ]),
        
        // Submit button
        this.createElement('button', {
          type: 'submit',
          class: 'login-button',
          disabled: loading
        }, [
          loading ? this.createElement('span', { class: 'loading-spinner' }) : null,
          loading ? 'Logging in...' : 'Log In'
        ])
      ]),
      
      // Additional options
      this.createElement('div', { class: 'additional-options' }, [
        this.createElement('a', { href: '#' }, 'Forgot password?'),
        ' · ',
        this.createElement('a', { href: '#' }, 'Contact sales')
      ])
    ]);
    
    this.shadowRoot.appendChild(container);
  }
}

// Register component
customElements.define('login-view', LoginView);

export default LoginView;