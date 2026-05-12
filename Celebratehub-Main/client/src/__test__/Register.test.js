import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n'; // Import your i18n instance
import Register from '../components/access/Register';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockedNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

global.fetch = jest.fn();

const renderComponent = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <Register />
    </I18nextProvider>
  );

describe('Register Component', () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
    fetch.mockClear();
  });

  test('renders registration form', () => {
    renderComponent();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phoneNumber/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmPassword/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /createAccount/i })).toBeInTheDocument();
  });

  test('successful customer registration navigates to OTP verification', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/phoneNumber/i), { target: { value: '91234567' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Abcdef1!' } });
    fireEvent.change(screen.getByLabelText(/confirmPassword/i), { target: { value: 'Abcdef1!' } });

    fireEvent.click(screen.getByRole('button', { name: /createAccount/i }));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/otp-verification', { state: { email: 'test@test.com' } });
    });
  });

  test('shows validation errors for empty fields', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /createAccount/i }));

    await waitFor(() => {
      expect(screen.getByText('usernameRequired')).toBeInTheDocument();
      expect(screen.getByText('emailRequired')).toBeInTheDocument();
      expect(screen.getByText('phoneRequired')).toBeInTheDocument();
      expect(screen.getByText('passwordRequired')).toBeInTheDocument();
    });
  });

  test('user already registered navigates to login', async () => {
    fetch.mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ message: 'User already registered' }) });
    renderComponent();
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/phoneNumber/i), { target: { value: '91234567' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Abcdef1!' } });
    fireEvent.change(screen.getByLabelText(/confirmPassword/i), { target: { value: 'Abcdef1!' } });
    fireEvent.click(screen.getByRole('button', { name: /createAccount/i }));

    await waitFor(() => {
        expect(mockedNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
