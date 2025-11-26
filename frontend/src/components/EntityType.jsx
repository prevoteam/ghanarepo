import { useState } from 'react';
import './EntityType.css';
import StepBar from './StepBar';
import { getUniqueId } from '../utils/sessionManager';
import { API_BASE_URL } from '../utils/api';
import { Header, Footer } from './shared';

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
      <Header
        onLogoClick={onRegisterNow}
        activeNav="register"
        onRegisterClick={onRegisterNow}
        onLoginClick={onLoginRedirect}
        showPSPNav={false}
      />

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

      <Footer />
    </div>
  );
};

export default EntityType;
