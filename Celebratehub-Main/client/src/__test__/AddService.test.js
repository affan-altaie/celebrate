import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n'; // Import your i18n instance
import AddService from '../components/dashboards/AddService';

// Mock react-router-dom
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockedNavigate,
}));

// Mock axios
jest.mock('axios');

const renderComponent = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <AddService />
    </I18nextProvider>
  );

describe('AddService Component', () => {
  beforeEach(() => {
    // Mock localStorage
    const user = { email: 'test@example.com' };
    localStorage.setItem('user', JSON.stringify(user));
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders all basic inputs', () => {
    renderComponent();

    expect(screen.getByLabelText(/serviceNameLabel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/roleLabel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/locationLabel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pricePerHour/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pricePerPerson/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descriptionLabel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/featuresLabel/i)).toBeInTheDocument();
    expect(screen.getByText(/addServiceBtn/i)).toBeInTheDocument();
  });

  test('submits form successfully', async () => {
    axios.post.mockResolvedValue({ data: {} });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/serviceNameLabel/i), { target: { value: 'Test Service' } });
    fireEvent.change(screen.getByLabelText(/roleLabel/i), { target: { value: 'Tester' } });
    fireEvent.change(screen.getByLabelText(/locationLabel/i), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText(/pricePerHour/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/pricePerPerson/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/descriptionLabel/i), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText(/featuresLabel/i), { target: { value: 'Feature 1, Feature 2' } });

    // Mock localStorage
    const user = { email: 'test@example.com' };
    localStorage.setItem('user', JSON.stringify(user));

    // Mock file upload
    const file = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
    const file2 = new File(['(⌐□_□)'], 'test2.png', { type: 'image/png' });
    const imageUpload = screen.getByLabelText(/Service Images/i);
    fireEvent.change(imageUpload, { target: { files: [file, file2] } });

    fireEvent.click(screen.getByText(/addServiceBtn/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(mockedNavigate).toHaveBeenCalledWith('/manage-listings');
    });
  });
});
