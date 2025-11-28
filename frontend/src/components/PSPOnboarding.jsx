import { useState } from 'react';
import './PSPOnboarding.css';
import { pspApi } from '../utils/api';

const PSPOnboarding = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    entityName: '',
    bogLicenseNumber: '',
    technicalContactName: '',
    officialEmail: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.entityName || !formData.bogLicenseNumber ||
        !formData.technicalContactName || !formData.officialEmail) {
      setError('All fields are required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.officialEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await pspApi.registerPSP({
        entity_name: formData.entityName,
        bog_license_number: formData.bogLicenseNumber,
        technical_contact_name: formData.technicalContactName,
        official_email: formData.officialEmail
      });

      if (response.status) {
        onSuccess(response.data);
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="psp-content bg">
      <main className="psp-main">
  

        <div className="psp-form-container">
          <button className="back-button" onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </button>

          <h1 className="psp-title">PSP On-boarding</h1>
          <p className="psp-subtitle">Register your Payment Service Provider to facilitate e-VAT collections.</p>

          {error && (
            <div className="psp-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="psp-form">
            <div className="form-group">
              <label htmlFor="entityName">PSP / Entity Name</label>
              <input
                type="text"
                id="entityName"
                name="entityName"
                placeholder="Enter your PSP / Entity Name"
                value={formData.entityName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bogLicenseNumber">BoG License Number</label>
              <input
                type="text"
                id="bogLicenseNumber"
                name="bogLicenseNumber"
                placeholder="Enter BoG License Number"
                value={formData.bogLicenseNumber}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="technicalContactName">Technical Contact Name</label>
              <input
                type="text"
                id="technicalContactName"
                name="technicalContactName"
                placeholder="Enter Full Name"
                value={formData.technicalContactName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="officialEmail">Official Email Address</label>
              <input
                type="email"
                id="officialEmail"
                name="officialEmail"
                placeholder="Enter Email Address"
                value={formData.officialEmail}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PSPOnboarding;
