/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react';

function errorHandler(message, source, lineno, colno, error) {
    // Log or handle the error as needed
    console.error('Error occurred:', message, source, lineno, colno, error);
    return true
  }
  
  // Attach the errorHandler function to the window.onerror event
  window.onerror = errorHandler;
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by error boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h1>Something went wrong.</h1>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
