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

  const handleLogoClick = () => {
    if (onBack) onBack();
  };

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
    <div className="psp-container">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-content">
          <div className="logo-section" style={{ cursor: 'pointer' }} onClick={handleLogoClick}>
            <div className="logo-circle">
              <img
                src="/assets/logo.png"
                alt="GRA Logo"
                style={{
                  width: '52px',
                  height: '50px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
            <div className="logo-text">
              <div className="gra-text">GRA</div>
              <div className="gra-subtext">GHANA REVENUE AUTHORITY</div>
            </div>
          </div>

          <div className="header-right">
            <div className="help-info">
              <div className="help-label">Need Help?</div>
              <div className="help-phone">+233 (0) 302 123 456</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="navigation">
        <button className="nav-item" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          About Us
        </button>
        <button className="nav-item" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Conact Us
        </button>
        <button className="nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          Guidelines
        </button>
        <button className="nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          FAQ
        </button>
        <button className="nav-item active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          PSP On-boarding
        </button>
      </nav>

      {/* Main Content */}
      <main className="psp-main">
        <div className="psp-circles">
          <div className="psp-circle psp-circle-1"></div>
          <div className="psp-circle psp-circle-2"></div>
          <div className="psp-circle psp-circle-3"></div>
        </div>

        <div className="psp-form-container">
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

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-text">Integrity. Fairness. Service</div>
          <div className="footer-copyright">© 2025 Ghana Revenue Authority. All rights reserved.</div>
          <button className="assistant-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Ask GRA Assistant
          </button>
        </div>
      </footer>
    </div>
  );
};

export default PSPOnboarding;
