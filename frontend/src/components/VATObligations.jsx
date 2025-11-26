import { useState, useEffect } from 'react';
import './VATObligations.css';
import { registrationApi } from '../utils/api';
import { useApi } from '../utils/useApi';
import { Header, Footer } from './shared';

const VATObligations = ({ onNext, onBack, uniqueId, onRegisterNow, onLoginRedirect }) => {
  const [vatData, setVatData] = useState(null);
  const { loading, error, execute } = useApi();

  const steps = [
    { number: 1, label: 'Verification', completed: true },
    { number: 2, label: 'Entity Type', completed: true },
    { number: 3, label: 'Identity', completed: true },
    { number: 4, label: 'Agent', completed: true },
    { number: 5, label: 'Market', completed: true },
    { number: 6, label: 'Payment', completed: true },
    { number: 7, label: 'Eligibility', active: true },
    { number: 8, label: 'Completed', completed: false },
  ];

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
      <main className="vat-main">
        <div className="content-wrapper">
          <h1 className="page-title">e-VAT Obligations</h1>
          <p className="page-description">
            Connect the Payment Service Provider (PSP) you use to receive payments from Ghana.
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

          {loading && !vatData ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Calculating your VAT obligations...</p>
            </div>
          ) : vatData ? (
            <>
              {/* Compliance Status Header */}
              <div className="compliance-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Compliance Status</span>
              </div>

              {/* Compliance Content Box */}
              <div className="compliance-box">
                <h3 className="declaration-title">Based on your declaration</h3>

                <div className="declaration-items">
                  <div className="declaration-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>{getEntityTypeLabel(vatData.entity_type)}</span>
                  </div>
                  <div className="declaration-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Supplying Digital Services to Ghana (B2C)</span>
                  </div>
                </div>

                <div className="requirement-notice">
                  <p>
                    You are required to register for e-VAT.<br />
                    <strong>Applicable Rate: Standard VAT + NHIL + GETFund levies apply.</strong>
                  </p>
                </div>
              </div>
            </>
          ) : null}

          {/* Buttons */}
          <div className="form-buttons">
            <button type="button" className="btn-previous" onClick={onBack} disabled={loading}>
              Previous
            </button>
            <button
              type="button"
              className="btn-next"
              onClick={onNext}
              disabled={loading || !vatData}
            >
              {loading ? 'Loading...' : 'Next'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VATObligations;
