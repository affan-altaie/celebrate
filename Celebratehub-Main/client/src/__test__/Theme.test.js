import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import ThemeSwitcher from '../components/ThemeSwitcher';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
      };
      return translations[key] || key;
    },
  }),
}));

const TestComponent = () => {
  const { theme } = useTheme();
  return <div data-testid="theme-display">{theme}</div>;
};

describe('Theme Functionality', () => {
  beforeEach(() => {
    document.body.className = '';
  });

  test('ThemeProvider provides default light theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme-display')).toHaveTextContent('light');
    expect(document.body).toHaveClass('light');
  });

  test('ThemeSwitcher toggles between light and dark themes', () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
        <TestComponent />
      </ThemeProvider>
    );

    // Initial state: light theme, button should show "Dark Mode"
    expect(screen.getByTestId('theme-display')).toHaveTextContent('light');
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Dark Mode');
    expect(document.body).toHaveClass('light');

    // Click to toggle to dark mode
    fireEvent.click(button);
    expect(screen.getByTestId('theme-display')).toHaveTextContent('dark');
    expect(button).toHaveTextContent('Light Mode');
    expect(document.body).toHaveClass('dark');

    // Click to toggle back to light mode
    fireEvent.click(button);
    expect(screen.getByTestId('theme-display')).toHaveTextContent('light');
    expect(button).toHaveTextContent('Dark Mode');
    expect(document.body).toHaveClass('light');
  });
});
