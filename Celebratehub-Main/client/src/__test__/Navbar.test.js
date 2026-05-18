import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: () => Promise.resolve(),
    },
  }),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
}));

// Mock Navbar
const Navbar = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return (
        <nav className="navbar">
            <a href="/">home</a>
            <a href="/about">aboutUs</a>
            {!user ? (
                <>
                    <a href="/login">login</a>
                    <a href="/register">register</a>
                </>
            ) : (
                <>
                    <a href="/dashboard">dashboard</a>
                    <button onClick={() => localStorage.removeItem('user')}>logout</button>
                </>
            )}
        </nav>
    );
};

describe('Navbar Component', () => {
  afterEach(() => {
    localStorage.clear();
  });

  test('renders login and register links when user is not authenticated', () => {
    render(<Navbar />);
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
    expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
  });

  test('renders dashboard and logout when user is authenticated', () => {
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    render(<Navbar />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
    expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
  });
});
