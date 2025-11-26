import { useState } from 'react';
import './MarketDeclaration.css';
import { registrationApi } from '../utils/api';
import { useApi } from '../utils/useApi';
import { Header, Footer } from './shared';

const MarketDeclaration = ({ onNext, onBack, uniqueId, onRegisterNow, onLoginRedirect }) => {
  const [salesVolume, setSalesVolume] = useState('');
  const { loading, error, execute, clearError } = useApi();

  const steps = [
    { number: 1, label: 'Verification', completed: true },
    { number: 2, label: 'Entity Type', completed: true },
    { number: 3, label: 'Identity', completed: true },
    { number: 4, label: 'Agent', completed: true },
    { number: 5, label: 'Market', active: true },
    { number: 6, label: 'Payment', completed: false },
    { number: 7, label: 'Eligibility', completed: false },
    { number: 8, label: 'Completed', completed: false },
  ];

  const salesVolumeOptions = [
    { value: '0-50000', label: 'Below GH₵ 50,000' },
    { value: '50000-200000', label: 'GH₵ 50,000 - GH₵ 200,000' },
    { value: '200000-500000', label: 'GH₵ 200,000 - GH₵ 500,000' },
    { value: '500000+', label: 'Above GH₵ 500,000' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!salesVolume) {
      alert('Please select your expected annual sales volume');
      return;
    }

    const result = await execute(
      registrationApi.updateMarketDeclaration,
      uniqueId,
      true, // Default to true for sells_digital_services
      salesVolume
    );

    if (result.success) {
      onNext();
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
      <main className="market-main">
        <div className="content-wrapper">
          <h1 className="page-title">Market Declaration</h1>
          <p className="page-description">
            The Ghana Revenue Authority requires information about your activities in Ghana to determine your tax liabilities.
          </p>

          {/* Progress Steps */}
          <div className="progress-container">
            <div className="progress-steps">
              {steps.map((step, index) => (
                <div key={step.number} className="progress-step-wrapper">
                  <div className="progress-step-info">
                    <div className="progress-step-label">Step {step.number} of 8</div>
                    <div className={`progress-circle ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}>
                      {step.completed ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <span></span>
                      )}
                    </div>
                    <div className="progress-step-name">{step.label}</div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`progress-line ${step.completed ? 'completed' : ''}`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="market-form">
            <div className="form-group">
              <label className="form-label">
                Full Expected Annual Sales Volume in Ghana <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={salesVolume}
                onChange={(e) => setSalesVolume(e.target.value)}
                required
              >
                <option value="">Select</option>
                {salesVolumeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="form-buttons">
              <button type="button" className="btn-previous" onClick={onBack} disabled={loading}>
                Previous
              </button>
              <button type="submit" className="btn-next" disabled={loading}>
                {loading ? 'Saving...' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MarketDeclaration;
