import { useState, useEffect } from 'react';
import './EntityType.css';
import StepBar from './StepBar';
import { getUniqueId, getPassportData } from '../utils/sessionManager';
import { API_BASE_URL } from '../utils/api';

const EntityType = ({ onNext, onPrevious, currentStep, onRegisterNow, onLoginRedirect }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    tradingName: '',
    country: '',
    serviceType: '',
    website: ''
  });

  const countries = [
    { value: '', label: 'Select Country' },
    { value: 'GH', label: 'Ghana' },
    { value: 'US', label: 'United States' },
    { value: 'UK', label: 'United Kingdom' },
    { value: 'IN', label: 'India' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'CN', label: 'China' },
    { value: 'JP', label: 'Japan' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
    { value: 'NG', label: 'Nigeria' },
    { value: 'ZA', label: 'South Africa' },
    { value: 'KE', label: 'Kenya' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Map passport country names to country codes
  const mapCountryToCode = (countryName) => {
    if (!countryName) return '';
    const lowerCountry = countryName.toLowerCase();

    const countryMap = {
      'ghana': 'GH',
      'republic of ghana': 'GH',
      'united states': 'US',
      'usa': 'US',
      'united kingdom': 'UK',
      'uk': 'UK',
      'great britain': 'UK',
      'india': 'IN',
      'germany': 'DE',
      'france': 'FR',
      'china': 'CN',
      'japan': 'JP',
      'canada': 'CA',
      'australia': 'AU',
      'nigeria': 'NG',
      'south africa': 'ZA',
      'kenya': 'KE'
    };

    for (const [key, value] of Object.entries(countryMap)) {
      if (lowerCountry.includes(key)) {
        return value;
      }
    }
    return 'OTHER';
  };

  // Auto-fill fullName and country from passport data on mount
  useEffect(() => {
    const passportData = getPassportData();
    if (passportData) {
      setFormData(prev => ({
        ...prev,
        fullName: passportData.fullName || prev.fullName,
        country: mapCountryToCode(passportData.country) || prev.country
      }));
    }
  }, []);

  const serviceTypes = [
    { value: '', label: 'Select Service Type' },
    { value: 'digital_services', label: 'Digital Services' },
    { value: 'e_commerce', label: 'e-Commerce' },
    { value: 'software', label: 'Software/SaaS' },
    { value: 'streaming', label: 'Streaming Services' },
    { value: 'online_advertising', label: 'Online Advertising' },
    { value: 'cloud_services', label: 'Cloud Services' },
    { value: 'gaming', label: 'Online Gaming' },
    { value: 'other', label: 'Other Digital Services' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = async () => {
    if (!formData.fullName || !formData.tradingName || !formData.country || !formData.serviceType) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const uniqueId = getUniqueId();

      if (!uniqueId) {
        alert('Session expired. Please start registration again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/UpdateBusinessDetails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unique_id: uniqueId,
          full_name: formData.fullName,
          trading_name: formData.tradingName,
          country: formData.country,
          service_type: formData.serviceType,
          website: formData.website
        })
      });

      const data = await response.json();

      if (data.status && data.code === 200) {
        console.log('Business details updated:', data);
        onNext();
      } else {
        alert(data.message || 'Failed to update business details');
      }
    } catch (error) {
      console.error('Error updating business details:', error);
      alert('Failed to update business details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-form-content">
      {/* Main Content */}
      <main className="entity-main">
        <div className="entity-circles">
          <div className="entity-circle entity-circle-1"></div>
          <div className="entity-circle entity-circle-2"></div>
        </div>

        <div className="entity-container">
          <div className="entity-content-box">
            <h1 className="entity-title">Business/Activity Details</h1>
            <p className="entity-subtitle">
              Please provide information about your business activities
            </p>

            {/* Progress Steps */}
            <StepBar currentStep={currentStep} />

            {/* Business Details Form */}
            <div className="entity-form">
              <div className="entity-form-grid">
                <div className="entity-form-field">
                  <label className="entity-form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className="entity-form-input"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    style={{ backgroundColor: formData.fullName ? '#f0f9ff' : 'white' }}
                  />
                  {formData.fullName && (
                    <span className="entity-autofill-hint">Auto-filled from passport</span>
                  )}
                </div>

                <div className="entity-form-field">
                  <label className="entity-form-label">
                    Trading Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="tradingName"
                    className="entity-form-input"
                    placeholder="Enter your business trading name"
                    value={formData.tradingName}
                    onChange={handleChange}
                  />
                </div>

                <div className="entity-form-field">
                  <label className="entity-form-label">
                    Country <span className="required">*</span>
                  </label>
                  <select
                    name="country"
                    className="entity-form-select"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    {countries.map(country => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="entity-form-field">
                  <label className="entity-form-label">
                    Type of Service/Product <span className="required">*</span>
                  </label>
                  <select
                    name="serviceType"
                    className="entity-form-select"
                    value={formData.serviceType}
                    onChange={handleChange}
                  >
                    {serviceTypes.map(service => (
                      <option key={service.value} value={service.value}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="entity-form-field">
                  <label className="entity-form-label">
                    Website URL
                  </label>
                  <input
                    type="url"
                    name="website"
                    className="entity-form-input"
                    placeholder="https://www.example.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="entity-actions">
              <button className="entity-btn-previous" onClick={onPrevious}>
                Previous
              </button>
              <button
                className="entity-btn-next"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EntityType;
