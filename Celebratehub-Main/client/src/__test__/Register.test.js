// src/__test__/Register.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

const renderComponent = () => render(<Register />);

describe('Register Component', () => {
  test('renders all basic inputs', () => {
    renderComponent();

    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
  });

  test('shows location input when role is provider', () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/I want to register as a/i), {
      target: { value: 'provider' },
    });

    expect(screen.getByLabelText(/Location of Business/i)).toBeInTheDocument();
  });

  test('shows error if password is invalid', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'abc' } });

    fireEvent.click(screen.getByText(/Create Account/i));

    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();
    });
  });

  test('shows error if phone number is invalid', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Abcdef1!' } });

    fireEvent.click(screen.getByText(/Create Account/i));

    await waitFor(() => {
      expect(screen.getByText(/Phone number must start with 7 or 9/i)).toBeInTheDocument();
    });
  });

  test('submits form successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'User registered successfully' }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '91234567' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Abcdef1!' } });

    fireEvent.click(screen.getByText(/Create Account/i));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('navigates to login if user already registered', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'User already registered' }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '91234567' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Abcdef1!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'Abcdef1!' } });

    fireEvent.click(screen.getByText(/Create Account/i));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
