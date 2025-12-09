import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../components/access/Login';

const mockedNavigate = jest.fn();

// Simple mock without requireActual
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockedNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

global.fetch = jest.fn();

describe('Login Component', () => {
  beforeEach(() => {
    mockedNavigate.mockReset();
    fetch.mockReset();
  });

  test('renders login form inputs and links', () => {
    render(<Login />);
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Keep me signed in/i)).toBeInTheDocument();
    expect(screen.getByText(/Forgot Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
  });

  test('successful login navigates to customer dashboard', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { role: 'customer', name: 'Test User' } }),
    });

    render(<Login />);
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Abcdef1!' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/customer-dashboard', expect.any(Object));
    });
  });

  // You can add more tests for errors, pending, rejected, etc.
});
