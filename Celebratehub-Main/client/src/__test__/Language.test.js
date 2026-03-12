import React, { Suspense } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

const TestComponent = () => {
  const { t } = useTranslation();
  return <h1>{t('welcomeMessage')}</h1>;
};

const renderWithProviders = (ui) => {
  return render(
    <Suspense fallback="loading">
      <I18nextProvider i18n={i18n}>
        {ui}
      </I18nextProvider>
    </Suspense>
  );
};

describe('Language Functionality', () => {
  beforeEach(() => {
    // Reset to default language before each test
    i18n.changeLanguage('en');
  });

  test('LanguageSwitcher changes language from EN to AR and back', async () => {
    renderWithProviders(
      <>
        <LanguageSwitcher />
        <TestComponent />
      </>
    );

    // Initial language is English
    const arButton = screen.getByRole('button', { name: /العربية/i });
    expect(arButton).not.toBeDisabled();
    
    const enButton = screen.getByRole('button', { name: /English/i });
    expect(enButton).toBeDisabled();

    // Change to Arabic
    fireEvent.click(arButton);
    await waitFor(() => {
      expect(i18n.language).toBe('ar');
    });

    // Arabic button should now be disabled
    expect(arButton).toBeDisabled();
    expect(enButton).not.toBeDisabled();

    // Change back to English
    fireEvent.click(enButton);
    await waitFor(() => {
      expect(i18n.language).toBe('en');
    });

    // English button should be re-disabled
    expect(enButton).toBeDisabled();
    expect(arButton).not.toBeDisabled();
  });
});
