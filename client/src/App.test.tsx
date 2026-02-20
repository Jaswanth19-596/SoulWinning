import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';

// Mock Child Components to simplify integration test
jest.mock('./components/auth/Login', () => () => <div>Login Page</div>);
jest.mock('./components/shared/MainView', () => () => <div>Main App View</div>);
jest.mock('./components/shared/Header', () => () => <header>App Header</header>);
jest.mock('./components/shared/Loading', () => () => <div>Loading...</div>);

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

    render(<App />); 
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('renders main view when authenticated', async () => {
     mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      session: { bus_route: 'Route 1' }
    });

    await act(async () => {
      render(<App />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Main App View')).toBeInTheDocument();
    });
  });

});

