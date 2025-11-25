import { useState } from 'react';
import './RegistrationForm.css';
import './RegisterNow.css';
import OTPVerification from './OTPVerification';
import EntityType from './EntityType';
import Identity from './Identity';
import Agent from './Agent';
import MarketDeclaration from './MarketDeclaration';
import PaymentGateway from './PaymentGateway';
import VATObligations from './VATObligations';
import RegistrationComplete from './RegistrationComplete';
import { setUniqueId, setContact, setVerified, getUniqueId } from '../utils/sessionManager';
import { registrationApi } from '../utils/api';
import { useApi } from '../utils/useApi';

const RegistrationForm = ({ onBack, onLoginRedirect }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [formData, setFormData] = useState({
    mobileNumber: '',
    countryCode: '+233',
    email: ''
  });
  const { loading, error, execute, clearError } = useApi();

  // Debug: Check if onLoginRedirect is defined
  console.log('RegistrationForm - onLoginRedirect:', typeof onLoginRedirect);

  // Helper function to get unique_id from session storage
  const getStoredUniqueId = () => {
    return sessionStorage.getItem('unique_id');
  };

  const steps = [
    { number: 1, label: 'Verification' },
    { number: 2, label: 'Entity Type' },
    { number: 3, label: 'Identity' },
    { number: 4, label: 'Agent' },
    { number: 5, label: 'Market' },
    { number: 6, label: 'Payment' },
    { number: 7, label: 'Eligibility' },
    { number: 8, label: 'Completed' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!formData.email && !formData.mobileNumber) {
      alert('Please enter either mobile number or email');
      return;
    }

    const contact = formData.email || (formData.mobileNumber ? `${formData.countryCode}${formData.mobileNumber}` : null);
    const method = formData.email ? 'email' : 'mobile';

    const result = await execute(registrationApi.register, contact, method);

    if (result.success) {
      // Backend returns { status, code, message, results: { unique_id } }
      const uniqueIdValue = result.data.results?.unique_id || result.data.unique_id;
      setUniqueId(uniqueIdValue);
      setContact(contact);
      setShowOTPModal(true);
    }
  };

  const handleOTPVerified = (data) => {
    setShowOTPModal(false);

    // Store the verified unique_id from response
    if (data.results && data.results.unique_id) {
      setUniqueId(data.results.unique_id);
      setVerified(data.results.is_verified);
    }

    setCurrentStep(2);
    // Navigate to next step or show success message
    console.log('OTP verified successfully! unique_id:', data.results.unique_id);
    console.log('Stored unique_id:', getUniqueId());
  };

  const handleEntityTypeNext = (selectedType) => {
    console.log('Entity type selected:', selectedType);
    // Move to next step (Step 3: Identity)
    setCurrentStep(3);
  };

  const handleEntityTypePrevious = () => {
    // Go back to step 1 (Registration form)
    setCurrentStep(1);
  };

  const handleIdentityNext = () => {
    console.log('Identity verification completed');
    // Move to next step (Step 4: Agent)
    setCurrentStep(4);
  };

  const handleIdentityPrevious = () => {
    // Go back to step 2 (Entity Type)
    setCurrentStep(2);
  };

  const handleAgentNext = () => {
    console.log('Agent details saved');
    // Move to next step (Step 5: Market)
    setCurrentStep(5);
  };

  const handleAgentPrevious = () => {
    // Go back to step 3 (Identity)
    setCurrentStep(3);
  };

  const handleMarketNext = () => {
    console.log('Market declaration saved');
    // Move to next step (Step 6: Payment)
    setCurrentStep(6);
  };

  const handleMarketPrevious = () => {
    // Go back to step 4 (Agent)
    setCurrentStep(4);
  };

  const handlePaymentNext = () => {
    console.log('Payment gateway connected');
    // Move to next step (Step 7: VAT)
    setCurrentStep(7);
  };

  const handlePaymentPrevious = () => {
    // Go back to step 5 (Market)
    setCurrentStep(5);
  };

  const handleVATNext = () => {
    console.log('VAT obligations calculated');
    // Move to next step (Step 8: Complete)
    setCurrentStep(8);
  };

  const handleVATPrevious = () => {
    // Go back to step 6 (Payment)
    setCurrentStep(6);
  };

  // If user completed OTP verification, show Entity Type selection
  if (currentStep === 2) {
    return (
      <EntityType
        onNext={handleEntityTypeNext}
        onPrevious={handleEntityTypePrevious}
        currentStep={currentStep}
        onRegisterNow={onBack}
        onLoginRedirect={onLoginRedirect}
      />
    );
  }

  // If user selected entity type, show Identity (passport/selfie upload)
  if (currentStep === 3) {
    return (
      <Identity
        onNext={handleIdentityNext}
        onPrevious={handleIdentityPrevious}
        currentStep={currentStep}
        onRegisterNow={onBack}
        onLoginRedirect={onLoginRedirect}
      />
    );
  }

  // If user uploaded documents, show Agent details
  if (currentStep === 4) {
    return (
      <Agent
        onNext={handleAgentNext}
        onPrevious={handleAgentPrevious}
        currentStep={currentStep}
        uniqueId={getStoredUniqueId()}
        onRegisterNow={onBack}
        onLoginRedirect={onLoginRedirect}
      />
    );
  }

  // Step 5: Market Declaration
  if (currentStep === 5) {
    return (
      <MarketDeclaration
        onNext={handleMarketNext}
        onBack={handleMarketPrevious}
        uniqueId={getStoredUniqueId()}
        onRegisterNow={onBack}
        onLoginRedirect={onLoginRedirect}
      />
    );
  }

  // Step 6: Payment Gateway
  if (currentStep === 6) {
    return (
      <PaymentGateway
        onNext={handlePaymentNext}
        onBack={handlePaymentPrevious}
        uniqueId={getStoredUniqueId()}
        onRegisterNow={onBack}
        onLoginRedirect={onLoginRedirect}
      />
    );
  }

  // Step 7: VAT Obligations
  if (currentStep === 7) {
    return (
      <VATObligations
        onNext={handleVATNext}
        onBack={handleVATPrevious}
        uniqueId={getStoredUniqueId()}
        onRegisterNow={onBack}
        onLoginRedirect={onLoginRedirect}
      />
    );
  }

  // Step 8: Registration Complete
  if (currentStep === 8) {
    return (
      <RegistrationComplete
        uniqueId={getStoredUniqueId()}
        onLogin={onLoginRedirect}
        onRegisterNow={onBack}
        onLoginRedirect={onLoginRedirect}
      />
    );
  }

  return (
    <div className="register-container">
      {/* Header */}
      <header className="reg-header">
        <div className="reg-header-content">
          <div className="reg-logo-section" style={{ cursor: 'pointer' }} onClick={onBack}>
            <div className="reg-logo-circle">
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
            <div className="reg-logo-text">
              <div className="reg-gra-text">GRA</div>
              <div className="reg-gra-subtext">GHANA REVENUE AUTHORITY</div>
            </div>
          </div>

          <div className="reg-header-right">
            <button className="reg-header-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Call Us
            </button>
            <button className="reg-header-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              About Us
            </button>
            <div className="reg-help-info">
              <div className="reg-help-label">Need Help?</div>
              <div className="reg-help-phone">+233 (0) 302 123 456</div>
            </div>
          </div>
        </div>
      </header>


 <nav className="navigation">
       <button className="nav-item active" onClick={onBack}>
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

      {/* Navigation */}
      {/* <nav className="navigation">
        <button className="nav-item active" onClick={onBack}>
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
      </nav> */}

      {/* Main Content */}
      <main className="reg-main">
        <div className="reg-circles">
          <div className="reg-circle reg-circle-1"></div>
          <div className="reg-circle reg-circle-2"></div>
          <div className="reg-circle reg-circle-3"></div>
        </div>

        <div className="reg-container">
          <div className="reg-form-box">
            <h1 className="reg-title">Start Your Registration</h1>
            <p className="reg-subtitle">
              We'll send a one-time password (OTP) to verify your contact information.
            </p>

            {/* Progress Steps */}
            <div className="progress-container">
              <div className="progress-steps">
                {steps.map((step, index) => (
                  <div key={step.number} className="progress-step-wrapper">
                    <div className="progress-step-info">
                      <div className="progress-step-label">Step {step.number} of 8</div>
                      <div
                        className={`progress-circle ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
                      >
                        {currentStep > step.number ? (
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
                      <div className={`progress-line ${currentStep > step.number ? 'completed' : ''}`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#fee',
                border: '1px solid #fcc',
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#c00',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
                <button onClick={clearError} style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#c00',
                  cursor: 'pointer'
                }}>×</button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSendOTP} className="reg-form">
              <div className="form-fields">
                <div className="field-group">
                  <label className="field-label">Mobile Number</label>
                  <div className="phone-input">
                    <select
                      className="country-code"
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                    >
                      <option value="+91">+91</option>
                      <option value="+233">+233</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <input
                      type="tel"
                      name="mobileNumber"
                      className="field-input"
                      placeholder="Enter Mobile Number"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="or-divider">Or</div>

                <div className="field-group">
                  <label className="field-label">Email ID</label>
                  <input
                    type="email"
                    name="email"
                    className="field-input"
                    placeholder="Enter Email ID"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="submit" className="send-otp-btn" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <div className="login-link">
                Already registered? <a href="#login">Login here</a>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="reg-footer">
        <div className="reg-footer-content">
          <div className="reg-footer-text">Integrity. Fairness. Service</div>
          <div className="reg-footer-copyright">© 2025 Ghana Revenue Authority. All rights reserved.</div>
          <button className="reg-assistant-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Ask GRA Assistant
          </button>
        </div>
      </footer>

      {/* OTP Modal */}
      {showOTPModal && (
        <OTPVerification
          email={formData.email}
          mobileNumber={formData.mobileNumber ? `${formData.countryCode}${formData.mobileNumber}` : null}
          onVerified={handleOTPVerified}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </div>
  );
};

export default RegistrationForm;
