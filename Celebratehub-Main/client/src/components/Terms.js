import React from 'react';
import { useTranslation } from 'react-i18next';

const Terms = () => {
  const { t } = useTranslation();

  return (
    <div className="container">
      <h1>{t('termsOfServiceTitle')}</h1>
      <p>{t('termsIntro')}</p>
      <h2>{t('introductionTitle')}</h2>
      <p>{t('introductionText')}</p>
      <h2>{t('userResponsibilitiesTitle')}</h2>
      <p>{t('userResponsibilitiesText')}</p>
      <h2>{t('limitationOfLiabilityTitle')}</h2>
      <p>{t('limitationOfLiabilityText')}</p>
      <h2>{t('changesToTermsTitle')}</h2>
      <p>{t('changesToTermsText')}</p>
    </div>
  );
};

export default Terms;
