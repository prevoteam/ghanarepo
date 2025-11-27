import { useState } from 'react';
import './PaymentGateway.css';
import { registrationApi } from '../utils/api';
import { useApi } from '../utils/useApi';
import { Header, Footer } from './shared';

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
      <Header
        onLogoClick={onRegisterNow}
        activeNav="register"
        onRegisterClick={onRegisterNow}
        onLoginClick={onLoginRedirect}
        showPSPNav={false}
      />

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

      <Footer />
    </div>
  );
};

export default PaymentGateway;
