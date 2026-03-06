import React from 'react';
import { useTranslation } from 'react-i18next';

const ReportsAndFeedback = () => {
  const { t } = useTranslation();
  return (
    <div className="container">
      <h1>{t('reportsAndFeedback')}</h1>
      <p>{t('reportsAndFeedbackDescription')}</p>
    </div>
  );
};

export default ReportsAndFeedback;
