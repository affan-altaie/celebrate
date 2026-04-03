import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n'; // Import your i18n instance
import Register from '../components/access/Register';

// Mock react-router-dom
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockedNavigate,
  Link: ({ children }) => <div>{children}</div>,
}));

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

const renderComponent = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <Register />
    </I18nextProvider>
  );

describe('Register Component', () => {
  test('renders all basic inputs', () => {
    renderComponent();

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/emailAddress/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phoneNumber/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmPassword/i)).toBeInTheDocument();
    expect(screen.getByText(/createAccount/i)).toBeInTheDocument();
  });

  test('shows location input when role is provider', () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/iWantToRegisterAsA/i), {
      target: { value: 'provider' },
    });

    expect(screen.getByLabelText(/locationOfBusiness/i)).toBeInTheDocument();
  });

  test('shows error if password is invalid', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/emailAddress/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/phoneNumber/i), { target: { value: '91234567' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText(/confirmPassword/i), { target: { value: 'abc' } });

    fireEvent.click(screen.getByText(/createAccount/i));

    await expect(screen.findByText(/passwordRequirementsError/i)).resolves.toBeInTheDocument();
  });

  test('shows error if phone number is invalid', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/phoneNumber/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.change(screen.getByLabelText(/confirmPassword/i), { target: { value: 'Abcdef1!' } });

    fireEvent.click(screen.getByText(/createAccount/i));

    await waitFor(() => {
      expect(screen.getByText(/phoneInvalid/i)).toBeInTheDocument();
    });
  });

  test('submits form successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User registered successfully' }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/emailAddress/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/phoneNumber/i), { target: { value: '91234567' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.change(screen.getByLabelText(/confirmPassword/i), { target: { value: 'Abcdef1!' } });

    fireEvent.click(screen.getByText(/createAccount/i));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/otp-verification', { state: { email: 'test@test.com' } });
    });
  });

  test('navigates to login if user already registered', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'User already registered' }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/emailAddress/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/phoneNumber/i), { target: { value: '91234567' } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.change(screen.getByLabelText(/confirmPassword/i), { target: { value: 'Abcdef1!' } });

    fireEvent.click(screen.getByText(/createAccount/i));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
