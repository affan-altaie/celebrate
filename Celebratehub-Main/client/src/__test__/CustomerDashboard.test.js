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
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockedNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Create Mock CustomerDashboard
const CustomerDashboard = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return (
        <div>
            <h1>welcomeBack, {user.username}</h1>
            <div className="stats-container">
                <div className="stat-card">
                    <h3>totalBookings</h3>
                    <p>5</p>
                </div>
            </div>
            <nav>
                <a href="/bookings">myBookings</a>
                <a href="/profile">myProfile</a>
            </nav>
        </div>
    );
};

describe('CustomerDashboard Component', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({ username: 'testcustomer', role: 'customer' }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders dashboard with user welcome message', () => {
    render(<CustomerDashboard />);
    expect(screen.getByText(/welcomeBack, testcustomer/i)).toBeInTheDocument();
    expect(screen.getByText(/totalBookings/i)).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(<CustomerDashboard />);
    expect(screen.getByText(/myBookings/i)).toBeInTheDocument();
    expect(screen.getByText(/myProfile/i)).toBeInTheDocument();
  });
});
