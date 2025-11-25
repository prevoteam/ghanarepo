import { useState } from 'react';
import './PaymentGateway.css';
import { registrationApi } from '../utils/api';
import { useApi } from '../utils/useApi';

const PaymentGateway = ({ onNext, onBack, uniqueId, onRegisterNow, onLoginRedirect }) => {
  const [selectedProvider, setSelectedProvider] = useState('PayPal');
  const [isConnected, setIsConnected] = useState(false);
  const [merchantId, setMerchantId] = useState('');
  const { loading, error, execute } = useApi();

  const steps = [
    { number: 1, label: 'Verification', completed: true },
    { number: 2, label: 'Entity Type', completed: true },
    { number: 3, label: 'Identity', completed: true },
    { number: 4, label: 'Agent', completed: true },
    { number: 5, label: 'Market', completed: true },
    { number: 6, label: 'Payment', active: true },
    { number: 7, label: 'Eligibility', completed: false },
    { number: 8, label: 'Completed', completed: false },
  ];

  const paymentProviders = [
    { id: 'Stripe', name: 'Stripe' },
    { id: 'Paystack', name: 'Paystack' },
    { id: 'Flutterwave', name: 'Flutterwave' },
    { id: 'PayPal', name: 'PayPal' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProvider) {
      alert('Please select a payment provider');
      return;
    }

    const result = await execute(
      registrationApi.updatePaymentGateway,
      uniqueId,
      selectedProvider
    );

    if (result.success) {
      setIsConnected(true);
      // Get merchant ID from response
      if (result.data.results && result.data.results.merchant_id) {
        setMerchantId(result.data.results.merchant_id);
      }
    }
  };

  const handleDisconnect = async () => {
    const result = await execute(
      registrationApi.disconnectPaymentGateway,
      uniqueId
    );

    if (result.success) {
      setIsConnected(false);
      setSelectedProvider('PayPal');
      setMerchantId('');
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
      <main className="payment-main">
        <div className="content-wrapper">
          <h1 className="page-title">Payment Gateway Linkage</h1>
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

          {/* Payment Provider Cards or Connected State */}
          {!isConnected ? (
            <form onSubmit={handleSubmit} className="payment-form">
              <div className="providers-grid">
                {paymentProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className={`provider-card ${selectedProvider === provider.id ? 'selected' : ''}`}
                    onClick={() => setSelectedProvider(provider.id)}
                  >
                    <div className="card-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                    </div>
                    <h3 className="provider-name">{provider.name}</h3>
                  </div>
                ))}
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
          ) : (
            <>
              {/* Connected Success State */}
              <div className="connected-container">
                <div className="success-checkmark">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 className="connected-title">Connected to {selectedProvider} !</h2>
                <div className="merchant-info-box">
                  <p className="merchant-label">Merchant ID: {merchantId}</p>
                </div>
                <p className="consent-text">
                  You have consented for GRA to receive transaction summaries regarding Ghana sales.
                </p>
                <button className="disconnect-link" onClick={handleDisconnect} disabled={loading}>
                  {loading ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>

              {/* Buttons */}
              <div className="form-buttons">
                <button type="button" className="btn-previous" onClick={onBack} disabled={loading}>
                  Previous
                </button>
                <button type="button" className="btn-next" onClick={onNext} disabled={loading}>
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="payment-footer">
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

export default PaymentGateway;
