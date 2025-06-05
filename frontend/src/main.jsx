// main.jsx (or index.js)
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { AppContextProvider } from './context/AppContext'
import { CartProvider } from './context/CartContext'

// Enhanced error boundary with detailed error display
class ErrorBoundary extends React.Component {
  state = { 
    hasError: false,
    error: null,
    errorInfo: null
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("React Error Boundary caught an error:", error);
    console.error("Component stack:", errorInfo?.componentStack);
  }
  
  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ 
          margin: '20px', 
          padding: '20px', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          backgroundColor: '#f8d7da', 
          color: '#721c24'
        }}>
          <h2>Something went wrong</h2>
          <p>The application encountered an error. Please try the following:</p>
          <ul>
            <li>Refresh the page</li>
            <li>Clear your browser cache</li>
            <li>Check your internet connection</li>
          </ul>
          <p>Error: {this.state.error?.toString()}</p>
          {process.env.NODE_ENV !== 'production' && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
              <summary>View technical details</summary>
              {this.state.errorInfo?.componentStack}
            </details>
          )}
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Make sure the DOM is loaded before rendering
const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <BrowserRouter>
            <AppContextProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </AppContextProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Fatal error rendering app:", error);
    document.body.innerHTML = `
      <div style="margin: 20px; padding: 20px; border: 1px solid #f5c6cb; border-radius: 4px; background-color: #f8d7da; color: #721c24">
        <h2>Application Failed to Load</h2>
        <p>The application encountered a critical error and could not start.</p>
        <p>Please try refreshing the page or contact support if the problem persists.</p>
        <p>Error: ${error.message}</p>
      </div>
    `;
  }
} else {
  console.error("Root element not found");
  document.body.innerHTML = `
    <div style="margin: 20px; padding: 20px; border: 1px solid #f5c6cb; border-radius: 4px; background-color: #f8d7da; color: #721c24">
      <h2>Application Failed to Load</h2>
      <p>The application could not find the root element to render into.</p>
      <p>Please check your HTML structure or contact support.</p>
    </div>
  `;
}