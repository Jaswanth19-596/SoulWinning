import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';

// Mock Child Components to simplify integration test
jest.mock('./components/auth/Login', () => () => <div>Login Page</div>);
jest.mock('./components/shared/MainView', () => () => <div>Main App View</div>);
jest.mock('./components/shared/Header', () => () => <header>App Header</header>);

// Mock Auth Context
const mockUseAuth = jest.fn();
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <div>{children}</div>,
  useAuth: () => mockUseAuth(),
}));

jest.mock('./contexts/AppContext', () => ({
  AppProvider: ({ children }: any) => <div>{children}</div>,
  useApp: () => ({ dayType: 'sunday' })
}));

describe('App Routing', () => {
    
  test('redirects unauthenticated user to login', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      session: null
    });

    // We need to render the internal routes logic, but App has its own Router.
    // Testing App component directly is hard because it wraps BrowserRouter. 
    // Usually we export the AppRoutes separately or test with real browser behavior.
    
    // For this test, let's verify if the ProtectedRoute component logic works 
    // by mocking the Auth return.
    
    // Actually, App.tsx doesn't export the Routes separately.
    // Let's modify the test to just render App and check if "Login Page" is shown
    // when we are at root "/" and unauthenticated.
    // BUT App uses BrowserRouter, which uses window.location. 
    // We can't easily change route in test environment for BrowserRouter unless we mock it or use window.history.pushState.
    
    // Strategy: Render App and see what it renders for default route "/"
    
    render(<App />); 
    // Since default URL is /, and user is not auth -> should redirect to /login -> show Login Page
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('renders main view when authenticated', () => {
     mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      session: { bus_route: 'Route 1' }
    });

    render(<App />);
    // Should stay on / (MainView)
    expect(screen.getByText('Main App View')).toBeInTheDocument();
  });

});
