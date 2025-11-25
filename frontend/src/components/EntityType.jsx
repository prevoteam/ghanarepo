import { useState } from 'react';
import './EntityType.css';
import { getUniqueId } from '../utils/sessionManager';

const EntityType = ({ onNext, onPrevious, currentStep }) => {
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = [
    { number: 1, label: 'Verification', completed: true },
    { number: 2, label: 'Entity Type', active: true },
    { number: 3, label: 'Identity' },
    { number: 4, label: 'Agent' },
    { number: 5, label: 'Market' },
    { number: 6, label: 'Payment' },
    { number: 7, label: 'Eligibility' },
    { number: 8, label: 'Completed' }
  ];

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

      const response = await fetch('http://localhost:3000/v1/home/SetEntity', {
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
    <div className="entity-type-page">
      {/* Header */}
      <header className="entity-header">
        <div className="entity-header-content">
          <div className="entity-logo-section">
            <div className="entity-logo-circle">
              <svg width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="#F59E0B" />
                <text x="25" y="32" fontSize="20" fontWeight="bold" fill="#2D3B8F" textAnchor="middle">G</text>
              </svg>
            </div>
            <div className="entity-logo-text">
              <div className="entity-gra-text">GRA</div>
              <div className="entity-gra-subtext">GHANA REVENUE AUTHORITY</div>
            </div>
          </div>

          <div className="entity-header-right">
            <button className="entity-header-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Call Us
            </button>
            <button className="entity-header-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              About Us
            </button>
            <div className="entity-help-info">
              <div className="entity-help-label">Need Help?</div>
              <div className="entity-help-phone">+233 (0) 302 123 456</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="entity-navigation">
        <button className="entity-nav-item active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Register Now
        </button>
        <button className="entity-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Taxpayer Login
        </button>
        <button className="entity-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          GRA Login
        </button>
        <button className="entity-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Guidelines
        </button>
        <button className="entity-nav-item">
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
            <div className="entity-progress-container">
              <div className="entity-progress-steps">
                {steps.map((step, index) => (
                  <div key={step.number} className="entity-progress-step-wrapper">
                    <div className="entity-progress-step-info">
                      <div className="entity-progress-step-label">Step {step.number} of 8</div>
                      <div
                        className={`entity-progress-circle ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''}`}
                      >
                        {step.completed ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <span>{step.number}</span>
                        )}
                      </div>
                      <div className="entity-progress-step-name">{step.label}</div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`entity-progress-line ${step.completed ? 'completed' : ''}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

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
