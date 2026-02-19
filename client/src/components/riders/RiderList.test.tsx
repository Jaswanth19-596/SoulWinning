import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RiderList from './RiderList';
import { BrowserRouter } from 'react-router-dom';
import { riderService } from '../../services/riderService';

// Mock the module initially
jest.mock('../../services/riderService', () => ({
  riderService: {
    getRiders: jest.fn()
  }
}));

const mockSession = { bus_route: 'Route 1' };
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: mockSession
  })
}));

jest.mock('../../contexts/AppContext', () => ({
  useApp: () => ({
    dayType: 'sunday'
  })
}));

const mockRiders = [
  { 
    id: 'r1', 
    name: 'Jaswanth Mada', 
    phone: '123-456-7890', 
    address: { street: '123 Main St', city: 'Hammond', state: 'IN', zip: '46323' },
    visit_history: [],
    created_at: new Date().toISOString()
  },
  { 
    id: 'r2', 
    name: 'Naveen', 
    phone: '987-654-3210', 
    address: { street: '456 Oak Ave', city: 'Hammond', state: 'IN', zip: '46323' },
    visit_history: [],
    created_at: new Date().toISOString()
  }
];

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RiderList Component', () => {
  beforeEach(() => {
    (riderService.getRiders as jest.Mock).mockReset();
    (riderService.getRiders as jest.Mock).mockImplementation(async () => {
        console.log('RiderService Mock Called'); 
        return mockRiders;
    });
  });

  test('renders list of riders', async () => {
    renderWithRouter(<RiderList />);
    
    await waitFor(() => {
      expect(screen.getByText('Jaswanth Mada')).toBeInTheDocument();
      expect(screen.getByText('Naveen')).toBeInTheDocument();
    });

    expect(screen.getByText('2 riders')).toBeInTheDocument();
  });

  test('filters riders by search term', async () => {
    renderWithRouter(<RiderList />);
    
    await waitFor(() => screen.getByText('Jaswanth Mada'));

    const searchInput = screen.getByPlaceholderText('Search riders...');
    fireEvent.change(searchInput, { target: { value: 'Jaswanth' } });

    await waitFor(() => {
        expect(screen.queryByText('Naveen')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Jaswanth Mada')).toBeInTheDocument();
  });

  test('filters riders by address', async () => {
    // Remove logging
    renderWithRouter(<RiderList />);
    
    await waitFor(() => screen.getByText('Jaswanth Mada'));

    const searchInput = screen.getByPlaceholderText('Search riders...');
    fireEvent.change(searchInput, { target: { value: 'Oak Ave' } });

    await waitFor(() => {
        expect(screen.queryByText('Jaswanth Mada')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Naveen')).toBeInTheDocument();
  });
});
