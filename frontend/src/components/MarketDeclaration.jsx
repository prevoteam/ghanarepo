import { useState } from 'react';
import './MarketDeclaration.css';
import StepBar from './StepBar';
import { registrationApi } from '../utils/api';
import { useApi } from '../utils/useApi';

const MarketDeclaration = ({ onNext, onBack, currentStep, uniqueId, onRegisterNow, onLoginRedirect }) => {
  const [sellsDigitalServices, setSellsDigitalServices] = useState(false);
  const [salesVolume, setSalesVolume] = useState('');
  const { loading, error, execute } = useApi();

  const salesVolumeOptions = [
    { value: '', label: 'Select expected annual sales volume' },
    { value: '0-50000', label: 'Below GH₵ 50,000' },
    { value: '50000-200000', label: 'GH₵ 50,000 - GH₵ 200,000' },
    { value: '200000-500000', label: 'GH₵ 200,000 - GH₵ 500,000' },
    { value: '500000+', label: 'Above GH₵ 500,000' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sellsDigitalServices) {
      alert('Please confirm that you sell digital services to Ghana');
      return;
    }

    if (!salesVolume) {
      alert('Please select your expected annual sales volume');
      return;
    }

    const result = await execute(
      registrationApi.updateMarketDeclaration,
      uniqueId,
      sellsDigitalServices,
      salesVolume
    );

    if (result.success) {
      onNext();
    }
  };

  return (
    <div className="registration-form-content">
      {/* Main Content */}
      <main className="market-main">
        <div className="market-circles">
          <div className="market-circle market-circle-1"></div>
          <div className="market-circle market-circle-2"></div>
        </div>

        <div className="market-container">
          <div className="market-content-box">
            <h1 className="market-title">Ghana Market Declaration</h1>
            <p className="market-subtitle">
              The Ghana Revenue Authority requires information about your activities in Ghana to determine your tax liabilities.
            </p>

            {/* Progress Steps */}
            <StepBar currentStep={currentStep} />

            {error && (
              <div className="error-banner">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="market-form">
              {/* Checkbox */}
              <div className="market-checkbox-group">
                <label className="market-checkbox-label">
                  <input
                    type="checkbox"
                    checked={sellsDigitalServices}
                    onChange={(e) => setSellsDigitalServices(e.target.checked)}
                    className="market-checkbox"
                  />
                  <span className="market-checkbox-custom"></span>
                  <span className="market-checkbox-text">
                    I sell digital services to consumers in Ghana (B2C)
                  </span>
                </label>
              </div>

              {/* Sales Volume Dropdown */}
              <div className="market-form-field">
                <label className="market-form-label">
                  Expected Annual Sales Volume in Ghana <span className="required">*</span>
                </label>
                <select
                  className="market-form-select"
                  value={salesVolume}
                  onChange={(e) => setSalesVolume(e.target.value)}
                  required
                >
                  {salesVolumeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="market-actions">
                <button type="button" className="market-btn-previous" onClick={onBack} disabled={loading}>
                  Previous
                </button>
                <button type="submit" className="market-btn-next" disabled={loading}>
                  {loading ? 'Saving...' : 'Next'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MarketDeclaration;
