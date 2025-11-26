import { useState } from 'react';
import './EntityType.css';
import StepBar from './StepBar';
import { getUniqueId } from '../utils/sessionManager';
import { API_BASE_URL } from '../utils/api';

const EntityType = ({ onNext, onPrevious, currentStep, onRegisterNow, onLoginRedirect }) => {
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectType = (type) => {
    setSelectedType(type);
  };

  const handleNext = async () => {
    if (!selectedType) {
      alert('Please select an entity type');
      return;
    }

    setLoading(true);

    try {
      const uniqueId = getUniqueId();

      if (!uniqueId) {
        alert('Session expired. Please start registration again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/SetEntity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unique_id: uniqueId,
          entity_type: selectedType
        })
      });

      const data = await response.json();

      if (data.status && data.code === 200) {
        console.log('Entity type updated:', data);
        onNext(selectedType);
      } else {
        alert(data.message || 'Failed to update entity type');
      }
    } catch (error) {
      console.error('Error updating entity type:', error);
      alert('Failed to update entity type. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Header */}
      <header className="top-header">
        <div className="header-content">
          <div className="logo-section" style={{ cursor: 'pointer' }} onClick={onRegisterNow}>
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
            <button className="header-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Call Us
            </button>
            <button className="header-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              About Us
            </button>
            <div className="help-info">
              <div className="help-label">Need Help?</div>
              <div className="help-phone">+233 (0) 302 123 456</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="navigation">
        <button className="nav-item active" onClick={onRegisterNow}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Register Now
        </button>
        <button className="nav-item" onClick={onLoginRedirect}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Taxpayer Login
        </button>
        <button className="nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          GRA Login
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
      </nav>

      {/* Main Content */}
      <main className="entity-main">
        <div className="entity-circles">
          <div className="entity-circle entity-circle-1"></div>
          <div className="entity-circle entity-circle-2"></div>
        </div>

        <div className="entity-container">
          <div className="entity-content-box">
            <h1 className="entity-title">Select Your Entity type</h1>
            <p className="entity-subtitle">
              This will help us tailor the registration form to your needs
            </p>

            {/* Progress Steps */}
            <StepBar currentStep={currentStep} />

            {/* Entity Type Cards */}
            <div className="entity-cards">
              <div
                className={`entity-card ${selectedType === 'Resident' ? 'selected' : ''}`}
                onClick={() => handleSelectType('Resident')}
              >
                <div className="entity-card-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h3 className="entity-card-title">Resident Taxpayer</h3>
                <p className="entity-card-description">
                  For individuals and businesses physically located in Ghana.
                </p>
              </div>

              <div
                className={`entity-card ${selectedType === 'NonResident' ? 'selected' : ''}`}
                onClick={() => handleSelectType('NonResident')}
              >
                <div className="entity-card-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <h3 className="entity-card-title">Non-Resident Taxpayer</h3>
                <p className="entity-card-description">
                  For entities supplying digital services or goods from abroad.
                </p>
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
                {loading ? 'Loading...' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="entity-footer">
        <div className="entity-footer-content">
          <div className="entity-footer-text">Integrity. Fairness. Service</div>
          <div className="entity-footer-copyright">© 2025 Ghana Revenue Authority. All rights reserved.</div>
          <button className="entity-assistant-button">
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

export default EntityType;
