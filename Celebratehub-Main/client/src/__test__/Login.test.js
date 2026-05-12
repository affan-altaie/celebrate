import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n'; // Import your i18n instance
import Login from '../components/access/Login';
import { toast } from 'react-toastify';

const mockedNavigate = jest.fn();

// Simple mock without requireActual
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockedNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

global.fetch = jest.fn();

const renderComponent = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <Login />
    </I18nextProvider>
  );

describe('Login Component', () => {
  beforeEach(() => {
    mockedNavigate.mockReset();
    fetch.mockReset();
    toast.error.mockClear();
  });

  test('renders login form inputs and links', () => {
    renderComponent();
    expect(screen.getByLabelText(/emailAddress/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/keepMeSignedIn/i)).toBeInTheDocument();
    expect(screen.getByText(/forgotPassword/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /signIn/i })).toBeInTheDocument();
    expect(screen.getByText(/dontHaveAnAccount/i)).toBeInTheDocument();
  });

  test('successful login navigates to customer dashboard', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { role: 'customer', name: 'Test User' } }),
    });

    renderComponent();
    fireEvent.change(screen.getByLabelText(/emailAddress/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Abcdef1!' } });
    fireEvent.click(screen.getByRole('button', { name: /signIn/i }));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/new-booking');
    });
  });

  test('shows error toast on failed login', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    renderComponent();
    fireEvent.change(screen.getByLabelText(/emailAddress/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /signIn/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  test('shows pending verification toast', async () => {
    fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ 
            message: 'Your account is pending email verification. Please check your email for an OTP.' 
        }),
    });

    renderComponent();
    fireEvent.change(screen.getByLabelText(/emailAddress/i), { target: { value: 'pending@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /signIn/i }));

    await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
    });
  });

  test('shows rejected account toast', async () => {
    fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ 
            message: 'Your account has been rejected. Please register again.' 
        }),
    });

    renderComponent();
    fireEvent.change(screen.getByLabelText(/emailAddress/i), { target: { value: 'rejected@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /signIn/i }));

    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('accountRejected');
    });
  });
});
