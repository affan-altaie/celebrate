import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button onClick={toggleTheme} className="theme-switcher-button">
      {theme === 'light' ? (
        <>
          <MdDarkMode className="switcher-icon" />
          <span>{t('darkMode')}</span>
        </>
      ) : (
        <>
          <MdLightMode className="switcher-icon" />
          <span>{t('lightMode')}</span>
        </>
      )}
    </button>
  );
};

export default ThemeSwitcher;