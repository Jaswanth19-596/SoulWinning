import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import { AuthProvider } from '../../contexts/AuthContext';

import { getDocs } from 'firebase/firestore';

// Mock the AuthContext
const mockLogin = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('../../services/firebaseConfig', () => ({
  db: {},
}));

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getDocs as jest.Mock).mockResolvedValue({ empty: false, docs: [] });
  });

  test('renders login form correctly', () => {
    render(<Login />);
    expect(screen.getByText(/Soul Winning & Bus Ministry/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your access code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enter Ministry/i })).toBeInTheDocument();
  });

  test('shows error when submitting empty code', async () => {
    render(<Login />);
    const submitButton = screen.getByRole('button', { name: /Enter Ministry/i });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter your bus access code/i)).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('calls login with uppercase code on submission', async () => {
    mockLogin.mockResolvedValueOnce(true);
    render(<Login />);
    
    const input = screen.getByPlaceholderText(/Enter your access code/i);
    const submitButton = screen.getByRole('button', { name: /Enter Ministry/i });
    const form = submitButton.closest('form')!;

    fireEvent.change(input, { target: { value: 'bus1' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('BUS1');
    });
  });

  test('displays error message on login failure', async () => {
    const errorMessage = 'Invalid Bus Key';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));
    
    render(<Login />);
    
    const input = screen.getByPlaceholderText(/Enter your access code/i);
    const submitButton = screen.getByRole('button', { name: /Enter Ministry/i });
    const form = submitButton.closest('form')!;

    fireEvent.change(input, { target: { value: 'INVALID' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('shows loading state during submission', async () => {
    // Mock login to hang so we can check loading state
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<Login />);
    
    const input = screen.getByPlaceholderText(/Enter your access code/i);
    const submitButton = screen.getByRole('button', { name: /Enter Ministry/i });
    const form = submitButton.closest('form')!;

    fireEvent.change(input, { target: { value: 'BUS1' } });
    fireEvent.submit(form);

    // Button should be disabled and loading
    expect(submitButton).toBeDisabled();
    // In the code, the button content changes to a spinner, so "Enter Ministry" might disappear
    // But we check if button is disabled.
  });
});
