import React from 'react';
import { useTranslation } from 'react-i18next';

const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="container">
      <h1>{t('contactUsTitle')}</h1>
      <p>{t('contactText1')}</p>
      <h2>{t('getInTouchTitle')}</h2>
      <p><strong>{t('emailAddress')}:</strong> support@celebratehub.com</p>
      <p><strong>{t('phoneNumber')}:</strong> (123) 456-7890</p>
      <p><strong>{t('address')}:</strong> 123 Event Lane, Celebration City, 12345</p>
      <h2>{t('businessHoursTitle')}</h2>
      <p>{t('mondayFriday')}: 9:00 AM - 6:00 PM</p>
      <p>{t('saturday')}: 10:00 AM - 4:00 PM</p>
      <p>{t('sunday')}: {t('closed')}</p>
    </div>
  );
};

export default Contact;
