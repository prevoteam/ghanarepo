import { useState } from 'react';
import './RegistrationForm.css';
import './RegisterNow.css';
import OTPVerification from './OTPVerification';
import Identity from './Identity';
import EntityType from './EntityType';
import Agent from './Agent';
import MarketDeclaration from './MarketDeclaration';
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
    countryCode: '+91',
    email: '',
    password: ''
  });
  const { loading, error, execute, clearError } = useApi();

  // Helper function to get unique_id from local storage
  const getStoredUniqueId = () => {
    return localStorage.getItem('unique_id');
  };

  // Updated steps to match screenshots - 8 steps total
  const steps = [
    { number: 1, label: 'Account' },
    { number: 2, label: 'Identity' },
    { number: 3, label: 'Business' },
    { number: 4, label: 'Agent' },
    { number: 5, label: 'Market' },
    { number: 6, label: 'Eligibility' },
    { number: 7, label: 'Review' },
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

    if (!formData.email) {
      alert('Please enter your email address');
      return;
    }

    if (!formData.password) {
      alert('Please create a password');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    const contact = formData.email;
    const method = 'email';

    const result = await execute(registrationApi.register, contact, method, formData.password);

    if (result.success) {
      const uniqueIdValue = result.data.results?.unique_id || result.data.unique_id;
      setUniqueId(uniqueIdValue);
      setContact(contact);
      setShowOTPModal(true);
    }
  };

  const handleOTPVerified = (data) => {
    setShowOTPModal(false);

    if (data.results && data.results.unique_id) {
      setUniqueId(data.results.unique_id);
      setVerified(data.results.is_verified);
    }

    // Go directly to Identity step (Step 2) after OTP verification
    setCurrentStep(2);
  };

  // Step 2: Identity (Foreign Individual - Upload Passport & Selfie)
  if (currentStep === 2) {
    return (
      <Identity
        onNext={() => setCurrentStep(3)}
        onPrevious={() => setCurrentStep(1)}
        currentStep={currentStep}
        steps={steps}
        onRegisterNow={onBack}
        onLoginRedirect={onLoginRedirect}
      />
    );
  }

  // Step 3: Business/Activity Details (using EntityType component)
  if (currentStep === 3) {
    return (
      <EntityType
        onNext={() => setCurrentStep(4)}
        onPrevious={() => setCurrentStep(2)}
        currentStep={currentStep}
        steps={steps}
        onRegisterNow={onBack}
        onLoginRedirect={onLoginRedirect}
      />
    );
  }

  // Step 4: Agent Details
  if (currentStep === 4) {
    return (
      <Agent
        onNext={() => setCurrentStep(5)}
        onPrevious={() => setCurrentStep(3)}
        currentStep={currentStep}
        steps={steps}
        uniqueId={getStoredUniqueId()}
        onRegisterNow={onBack}
        onLoginRedirect={onLoginRedirect}
      />
    );
  }

  // Step 5: Ghana Market Declaration
  if (currentStep === 5) {
    return (
      <MarketDeclaration
        onNext={() => setCurrentStep(6)}
        onBack={() => setCurrentStep(4)}
        currentStep={currentStep}
        steps={steps}
        uniqueId={getStoredUniqueId()}
        onRegisterNow={onBack}
        onLoginRedirect={onLoginRedirect}
      />
    );
  }

  // Step 6: e-VAT Obligations / Eligibility
  if (currentStep === 6) {
    return (
      <VATObligations
        onNext={() => setCurrentStep(7)}
        onBack={() => setCurrentStep(5)}
        currentStep={currentStep}
        steps={steps}
        uniqueId={getStoredUniqueId()}
        onRegisterNow={onBack}
        onLoginRedirect={onLoginRedirect}
      />
    );
  }

  // Step 7: Review & Declare (we'll reuse VATObligations with review mode or create new)
  if (currentStep === 7) {
    return (
      <VATObligations
        onNext={() => setCurrentStep(8)}
        onBack={() => setCurrentStep(6)}
        currentStep={currentStep}
        steps={steps}
        uniqueId={getStoredUniqueId()}
        onRegisterNow={onBack}
        onLoginRedirect={onLoginRedirect}
        isReviewStep={true}
        onEditStep={(step) => setCurrentStep(step)}
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
        currentStep={currentStep}
        steps={steps}
      />
    );
  }

  // Step 1: Account - Create Your Account
  return (
    <div className="registration-form-content">
      {/* Main Content */}
      <main className="reg-main">
        <div className="reg-circles">
          <div className="reg-circle reg-circle-1"></div>
          <div className="reg-circle reg-circle-2"></div>
          <div className="reg-circle reg-circle-3"></div>
        </div>

        <div className="reg-container">
          <div className="reg-form-box">
            <h1 className="reg-title">Create Your Account</h1>
            <p className="reg-subtitle">
              Please enter your email to verify your identity and start the registration process.
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
              <div className="form-fields" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div className="field-group" style={{ flex: '1 1 45%', minWidth: '250px' }}>
                  <label className="field-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="field-input"
                    placeholder="Enter Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field-group" style={{ flex: '1 1 45%', minWidth: '250px' }}>
                  <label className="field-label">Create Password</label>
                  <input
                    type="password"
                    name="password"
                    className="field-input"
                    placeholder="Enter Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="send-otp-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>

              <div className="login-link">
                Already registered ? <button type="button" className="login-link-btn" onClick={onLoginRedirect}>Login here</button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* OTP Modal */}
      {showOTPModal && (
        <OTPVerification
          email={formData.email}
          mobileNumber={null}
          onVerified={handleOTPVerified}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </div>
  );
};

export default RegistrationForm;
