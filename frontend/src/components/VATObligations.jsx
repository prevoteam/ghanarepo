import { useState, useEffect } from 'react';
import './VATObligations.css';
import { registrationApi } from '../utils/api';
import { useApi } from '../utils/useApi';

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

      {/* Footer */}
      <footer className="vat-footer">
        <div className="footer-content">
          <div className="footer-text">Integrity. Fairness. Service</div>
          <div className="footer-copyright">© 2025 Ghana Revenue Authority. All rights reserved.</div>
          <button className="assistant-btn">
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

export default VATObligations;
