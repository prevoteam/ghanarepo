import { useState, useEffect } from 'react';
import './VATObligations.css';
import StepBar from './StepBar';
import { registrationApi } from '../utils/api';
import { useApi } from '../utils/useApi';

const VATObligations = ({ onNext, onBack, currentStep, uniqueId, onRegisterNow, onLoginRedirect, isReviewStep = false }) => {
  const [vatData, setVatData] = useState(null);
  const { loading, error, execute } = useApi();

  useEffect(() => {
    calculateVAT();
  }, []);

  const calculateVAT = async () => {
    const result = await execute(
      registrationApi.calculateVATObligation,
      uniqueId
    );

    if (result.success) {
      setVatData(result.data.results || result.data.data);
    }
  };

  const getEntityTypeLabel = (entityType) => {
    const labels = {
      'NonResident': 'Non-Resident Entity',
      'DomesticIndividual': 'Domestic Individual',
      'DomesticCompany': 'Domestic Company',
    };
    return labels[entityType] || entityType;
  };

  // Review Step (Step 7)
  if (isReviewStep) {
    return (
      <div className="registration-form-content">
        <main className="vat-main">
          <div className="vat-circles">
            <div className="vat-circle vat-circle-1"></div>
            <div className="vat-circle vat-circle-2"></div>
          </div>

          <div className="vat-container">
            <div className="vat-content-box">
              <h1 className="vat-title">Review & Declare</h1>
              <p className="vat-subtitle">
                Please review your information before final submission.
              </p>

              <StepBar currentStep={currentStep} />

              {error && (
                <div className="error-banner">
                  {error}
                </div>
              )}

              {/* Review Sections */}
              <div className="review-sections">
                {/* Personal Information */}
                <div className="review-section">
                  <div className="review-section-header">
                    <h3>Personal Information</h3>
                    <button type="button" className="review-edit-btn">Edit</button>
                  </div>
                  <div className="review-grid">
                    <div className="review-item">
                      <label>Full Name</label>
                      <span>{vatData?.full_name || 'Not provided'}</span>
                    </div>
                    <div className="review-item">
                      <label>Email</label>
                      <span>{vatData?.email || 'Not provided'}</span>
                    </div>
                    <div className="review-item">
                      <label>Mobile</label>
                      <span>{vatData?.mobile || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="review-section">
                  <div className="review-section-header">
                    <h3>Business Information</h3>
                    <button type="button" className="review-edit-btn">Edit</button>
                  </div>
                  <div className="review-grid">
                    <div className="review-item">
                      <label>Trading Name</label>
                      <span>{vatData?.trading_name || 'Not provided'}</span>
                    </div>
                    <div className="review-item">
                      <label>Country</label>
                      <span>{vatData?.country || 'Not provided'}</span>
                    </div>
                    <div className="review-item">
                      <label>Service Type</label>
                      <span>{vatData?.service_type || 'Digital Services'}</span>
                    </div>
                  </div>
                </div>

                {/* Local Agent */}
                <div className="review-section">
                  <div className="review-section-header">
                    <h3>Local Agent</h3>
                    <button type="button" className="review-edit-btn">Edit</button>
                  </div>
                  <div className="review-grid">
                    <div className="review-item">
                      <label>Agent Name</label>
                      <span>{vatData?.agent_name || 'Not provided'}</span>
                    </div>
                    <div className="review-item">
                      <label>Agent TIN</label>
                      <span>{vatData?.agent_tin || 'Not provided'}</span>
                    </div>
                    <div className="review-item">
                      <label>Agent Email</label>
                      <span>{vatData?.agent_email || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                {/* Declaration Checkbox */}
                <div className="review-declaration">
                  <label className="review-checkbox-label">
                    <input type="checkbox" className="review-checkbox" defaultChecked />
                    <span className="review-checkbox-custom"></span>
                    <span className="review-checkbox-text">
                      I hereby declare that the information provided is true and accurate to the best of my knowledge.
                    </span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="vat-actions">
                <button type="button" className="vat-btn-previous" onClick={onBack} disabled={loading}>
                  Previous
                </button>
                <button
                  type="button"
                  className="vat-btn-next"
                  onClick={onNext}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Eligibility Step (Step 6)
  return (
    <div className="registration-form-content">
      <main className="vat-main">
        <div className="vat-circles">
          <div className="vat-circle vat-circle-1"></div>
          <div className="vat-circle vat-circle-2"></div>
        </div>

        <div className="vat-container">
          <div className="vat-content-box">
            <h1 className="vat-title">e-VAT Obligations</h1>
            <p className="vat-subtitle">
              Based on your declaration, here is your compliance status.
            </p>

            <StepBar currentStep={currentStep} />

            {error && (
              <div className="error-banner">
                {error}
              </div>
            )}

            {loading && !vatData ? (
              <div className="loading-state">
                <div className="spinner-large"></div>
                <p>Calculating your VAT obligations...</p>
              </div>
            ) : (
              <>
                {/* Compliance Status Card */}
                <div className="compliance-card">
                  <div className="compliance-header">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span>Compliance Status</span>
                  </div>

                  <div className="compliance-body">
                    <h3 className="compliance-title">Based on your declaration</h3>

                    <div className="compliance-items">
                      <div className="compliance-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>{getEntityTypeLabel(vatData?.entity_type || 'NonResident')}</span>
                      </div>
                      <div className="compliance-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>Supplying Digital Services to Ghana (B2C)</span>
                      </div>
                    </div>

                    <div className="compliance-notice">
                      <p>
                        You are required to register for e-VAT.<br />
                        <strong>Applicable Rate: Standard VAT + NHIL + GETFund levies apply.</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="vat-actions">
              <button type="button" className="vat-btn-previous" onClick={onBack} disabled={loading}>
                Previous
              </button>
              <button
                type="button"
                className="vat-btn-next"
                onClick={onNext}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VATObligations;
