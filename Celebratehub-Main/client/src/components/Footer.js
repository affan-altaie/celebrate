import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaFacebookF, FaInstagram, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-column">
          <h3>CelebrateHub</h3>
          <p>{t('footerDescription')}</p>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaXTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
          </div>
        </div>
        <div className="footer-column">
          <h3>{t('contactUs')}</h3>
          <ul className="contact-info">
            <li><FaMapMarkerAlt /> {t('address')}</li>
            <li><FaEnvelope /> noreply.celebrate.hub@gmail.com</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 CelebrateHub. {t('allRightsReserved')}</p>
        <div className="footer-legal">
          <Link to="/about">{t('aboutUs')}</Link>
          <Link to="/contact">{t('contact')}</Link>
          <Link to="/privacy-policy">{t('privacyPolicy')}</Link>
          <Link to="/terms">{t('termsOfService')}</Link>
          <Link to="/cookie-policy">{t('cookiePolicy')}</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;