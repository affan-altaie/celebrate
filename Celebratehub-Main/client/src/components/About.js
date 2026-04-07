import React from 'react';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="container">
      <h1>{t('aboutUsTitle')}</h1>
      <p>{t('aboutUsText1')}</p>
      <h2>{t('ourStoryTitle')}</h2>
      <p>{t('ourStoryText1')}</p>
      <h2>{t('whatWeOfferTitle')}</h2>
      <ul>
        <li>{t('offer1')}</li>
        <li>{t('offer2')}</li>
        <li>{t('offer3')}</li>
        <li>{t('offer4')}</li>
        <li>{t('offer5')}</li>
        <li>{t('offer6')}</li>
        <li>{t('offer7')}</li>
      </ul>
    </div>
  );
};

export default About;
