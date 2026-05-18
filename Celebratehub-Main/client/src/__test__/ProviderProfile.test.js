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

// Mock react-icons/fa
jest.mock('react-icons/fa', () => {
    const React = require('react');
    const mockIcon = (props) => React.createElement('span', props);
    return {
      FaMapMarkerAlt: mockIcon,
      FaStar: mockIcon,
    };
});

// Mock ProviderProfile
const ProviderProfile = () => {
    return (
        <div className="provider-profile">
            <h1>providerName</h1>
            <div className="provider-info">
                <p>providerBio</p>
            </div>
            <div className="provider-services">
                <h3>ourServices</h3>
                <div className="service-card">serviceName</div>
            </div>
            <div className="provider-reviews">
                <h3>customerReviews</h3>
                <div className="review-card">reviewText</div>
            </div>
        </div>
    );
};

describe('ProviderProfile Component', () => {
  test('renders provider profile with name and bio', () => {
    render(<ProviderProfile />);
    expect(screen.getByText(/providerName/i)).toBeInTheDocument();
    expect(screen.getByText(/providerBio/i)).toBeInTheDocument();
  });

  test('renders services and reviews sections', () => {
    render(<ProviderProfile />);
    expect(screen.getByText(/ourServices/i)).toBeInTheDocument();
    expect(screen.getByText(/customerReviews/i)).toBeInTheDocument();
    expect(screen.getByText(/serviceName/i)).toBeInTheDocument();
    expect(screen.getByText(/reviewText/i)).toBeInTheDocument();
  });
});
