import { useState, useEffect } from 'react';
import './ResidentRegistration.css';
import './RegistrationForm.css';
import { registrationApi, QR_CODE_API_URL, GHANA_SITES_API_URL } from '../utils/api';
import { useApi } from '../utils/useApi';

const ResidentRegistration = ({ onBack, onLoginRedirect, onGoToDashboard }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [generatedTIN, setGeneratedTIN] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [generatedUsername, setGeneratedUsername] = useState('');

  const { loading, error, execute, clearError } = useApi();
  const [successMessage, setSuccessMessage] = useState('');

  // Form data for Account step
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  // Identity data (Ghana Card)
  const [identityData, setIdentityData] = useState({
    ghanaCardId: '',
    // Retrieved from NIA API
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    photo: null
  });

  // Business data
  const [businessData, setBusinessData] = useState({
    tradingName: '',
    sector: 'Digital Services (General)',
    website: ''
  });

  // OTP states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300);
  const [timerInterval, setTimerInterval] = useState(null);

  // Steps definition - 5 steps
  const steps = [
    { number: 1, label: 'Account' },
    { number: 2, label: 'Identity' },
    { number: 3, label: 'Confirm' },
    { number: 4, label: 'Business' },
    { number: 5, label: 'Completed' }
  ];

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const startTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerInterval(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerInterval(interval);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCloseOTPModal = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setShowOTPModal(false);
    setOtp(['', '', '', '', '', '']);
    setTimer(300);
    clearError();
    setSuccessMessage('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
  };

  const handleIdentityChange = (e) => {
    const { name, value } = e.target;
    setIdentityData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`resident-reg-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`resident-reg-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    clearError();

    if (!formData.email.trim()) {
      return;
    }

    if (!formData.password) {
      return;
    }

    if (formData.password.length < 6) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    // Call Register API
    const result = await execute(registrationApi.register, formData.email, 'email', formData.password);

    if (result && result.status !== false) {
      const uid = result.results?.unique_id || result.data?.unique_id || result.unique_id;
      setUniqueId(uid);
      setShowOTPModal(true);
      setTimer(300);
      startTimer();
      setSuccessMessage('OTP sent successfully to your email!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // For development
      if (result.results?.otpDev || result.otpDev) {
        console.log('Development OTP:', result.results?.otpDev || result.otpDev);
      }
    }
  };

  // Verify OTP and proceed to Identity step
  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    clearError();

    if (otpValue.length !== 6) {
      return;
    }

    const result = await execute(registrationApi.verifyOTP, uniqueId, otpValue);

    if (result && result.status !== false) {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      setSuccessMessage('Email verified successfully!');
      setTimeout(() => {
        setShowOTPModal(false);
        setCurrentStep(2); // Go to Identity step
      }, 1000);
    } else {
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('resident-reg-otp-0');
      if (firstInput) firstInput.focus();
    }
  };

  const handleResendOTP = async () => {
    clearError();
    setSuccessMessage('');
    setOtp(['', '', '', '', '', '']);
    setTimer(300);

    const result = await execute(registrationApi.resendOTP, formData.email);

    if (result && result.status !== false) {
      startTimer();
      setSuccessMessage('OTP resent successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      if (result.results?.otpDev || result.otpDev) {
        console.log('Development OTP (Resent):', result.results?.otpDev || result.otpDev);
      }

      const firstInput = document.getElementById('resident-reg-otp-0');
      if (firstInput) firstInput.focus();
    }
  };

  // Step 2: Verify Ghana Card ID
  const handleVerifyGhanaCard = async (e) => {
    e.preventDefault();
    clearError();

    if (!identityData.ghanaCardId.trim()) {
      return;
    }

    // Try to fetch data from Ghana Sites API (NIA)
    try {
      const response = await fetch(`${GHANA_SITES_API_URL}/nia/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ghana_card_id: identityData.ghanaCardId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status && data.data) {
          setIdentityData(prev => ({
            ...prev,
            firstName: data.data.first_name || '',
            lastName: data.data.last_name || '',
            middleName: data.data.middle_name || '',
            dateOfBirth: data.data.date_of_birth || '',
            gender: data.data.gender || '',
            nationality: data.data.nationality || 'Ghanaian',
            photo: data.data.photo || null
          }));
          setCurrentStep(3); // Go to Confirm Identity step
          return;
        }
      }
    } catch (err) {
      console.log('NIA API not available, using mock data');
    }

    // Fallback: Use mock data for demo
    setIdentityData(prev => ({
      ...prev,
      firstName: 'John',
      lastName: 'Doe',
      middleName: '',
      dateOfBirth: '1990-01-15',
      gender: 'Male',
      nationality: 'Ghanaian',
      photo: null
    }));
    setCurrentStep(3);
  };

  // Step 3: Confirm Identity
  const handleConfirmIdentity = () => {
    if (!identityConfirmed) {
      return;
    }
    setCurrentStep(4); // Go to Business step
  };

  // Step 4: Submit Business Details and Complete Registration
  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!businessData.tradingName.trim()) {
      return;
    }

    if (!termsAccepted) {
      return;
    }

    // Call ResidentCompleteRegistration API
    const result = await execute(
      registrationApi.residentCompleteRegistration,
      uniqueId,
      formData.fullName || `${identityData.firstName} ${identityData.lastName}`,
      businessData.tradingName,
      businessData.sector,
      businessData.website
    );

    if (result && result.status !== false) {
      const tin = result.results?.tin || result.tin;
      const username = result.results?.username || result.username;
      setGeneratedTIN(tin);
      setGeneratedUsername(username);
      setCurrentStep(5);
    }
  };

  // Auto login after registration - use email as userID
  const handleAutoLogin = () => {
    // Login directly using uniqueId and role 'resident'
    // Email is used as the login credential
    if (onGoToDashboard && uniqueId) {
      onGoToDashboard(uniqueId, 'resident');
    }
  };

  // Render Progress Steps
  const renderProgressSteps = () => (
    <div className="progress-container">
      <div className="progress-steps resident-progress-steps">
        {steps.map((step, index) => (
          <div key={step.number} className="progress-step-wrapper">
            <div className="progress-step-info">
              <div className="progress-step-label">Step {step.number} of 5</div>
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
  );

  // Step 1: Account Registration
  const renderAccountStep = () => (
    <div className="registration-form-content">
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

            {renderProgressSteps()}

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

            <form onSubmit={handleSendOTP} className="reg-form">
              <div className="form-fields" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div className="field-group" style={{ flex: '1 1 100%' }}>
                  <label className="field-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="field-input"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="field-group" style={{ flex: '1 1 100%' }}>
                  <label className="field-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    className="field-input"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div className="field-group" style={{ flex: '1 1 45%', minWidth: '250px' }}>
                  <label className="field-label">Create Password</label>
                  <input
                    type="password"
                    name="password"
                    className="field-input"
                    placeholder="Enter Password (min 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="field-group" style={{ flex: '1 1 45%', minWidth: '250px' }}>
                  <label className="field-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="field-input"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="send-otp-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>

              <div className="login-link">
                Already registered? <button type="button" className="login-link-btn" onClick={onLoginRedirect}>Login here</button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="modal-overlay">
          <div className="otp-modal resident-otp-modal">
            <button className="modal-close" onClick={handleCloseOTPModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="modal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
            </div>

            <h2 className="modal-title">Enter OTP</h2>
            <p className="modal-subtitle">
              We've sent a 6-digit code to {formData.email}
            </p>

            {error && (
              <div className="error-message" style={{ marginTop: '1rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
                <button onClick={clearError} className="error-close">×</button>
              </div>
            )}

            {successMessage && (
              <div className="success-message" style={{ marginTop: '1rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {successMessage}
              </div>
            )}

            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`resident-reg-otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>

            <div className="otp-timer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Time remaining: {formatTime(timer)}
            </div>

            <button
              className="btn-verify"
              onClick={handleVerifyOTP}
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>

            <button
              className="btn-resend"
              onClick={handleResendOTP}
              disabled={loading || timer > 0}
            >
              Resend OTP {timer > 0 && `(${formatTime(timer)})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Step 2: Identity Verification (Ghana Card)
  const renderIdentityStep = () => (
    <div className="registration-form-content">
      <main className="reg-main">
        <div className="reg-circles">
          <div className="reg-circle reg-circle-1"></div>
          <div className="reg-circle reg-circle-2"></div>
          <div className="reg-circle reg-circle-3"></div>
        </div>

        <div className="reg-container">
          <div className="reg-form-box">
            <h1 className="reg-title">Identity Verification</h1>
            <p className="reg-subtitle">
              Enter your Ghana Card ID to verify your identity with NIA.
            </p>

            {renderProgressSteps()}

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

            <form onSubmit={handleVerifyGhanaCard} className="reg-form">
              <div className="form-fields">
                <div className="field-group" style={{ marginBottom: '24px' }}>
                  <label className="field-label">Ghana Card ID (NIA Number) <span style={{color: 'red'}}>*</span></label>
                  <input
                    type="text"
                    name="ghanaCardId"
                    className="field-input"
                    placeholder="e.g., GHA-123456789-0"
                    value={identityData.ghanaCardId}
                    onChange={handleIdentityChange}
                    required
                  />
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '8px' }}>
                    Your Ghana Card ID can be found on your physical Ghana Card or Digital ID.
                  </p>
                </div>
              </div>

              <div className="form-buttons">
                <button type="button" className="btn-previous" onClick={() => setCurrentStep(1)}>
                  Previous
                </button>
                <button type="submit" className="btn-next" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Identity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );

  // Step 3: Confirm Identity (Show retrieved details)
  const renderConfirmIdentityStep = () => (
    <div className="registration-form-content">
      <main className="reg-main">
        <div className="reg-circles">
          <div className="reg-circle reg-circle-1"></div>
          <div className="reg-circle reg-circle-2"></div>
          <div className="reg-circle reg-circle-3"></div>
        </div>

        <div className="reg-container">
          <div className="reg-form-box">
            <h1 className="reg-title">Identity Record Retrieved</h1>
            <p className="reg-subtitle">
              Please confirm that the information below matches your identity.
            </p>

            {renderProgressSteps()}

            {/* Record Found Badge */}
            <div className="record-found-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <div>
                <strong>Record Found</strong>
                <span>Your identity has been verified with NIA</span>
              </div>
            </div>

            {/* Identity Card */}
            <div className="identity-card">
              <h3 className="identity-card-title">Personal Information</h3>
              <div className="identity-content">
                <div className="identity-photo">
                  {identityData.photo ? (
                    <img src={identityData.photo} alt="Profile" />
                  ) : (
                    <div className="photo-placeholder">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="identity-details-grid">
                  <div className="detail-row">
                    <span className="detail-label">First Name</span>
                    <span className="detail-value">{identityData.firstName || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Last Name</span>
                    <span className="detail-value">{identityData.lastName || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Ghana Card ID</span>
                    <span className="detail-value">{identityData.ghanaCardId || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Date of Birth</span>
                    <span className="detail-value">{identityData.dateOfBirth || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Gender</span>
                    <span className="detail-value">{identityData.gender || '-'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Nationality</span>
                    <span className="detail-value">{identityData.nationality || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Checkbox */}
            <div className="confirmation-checkbox">
              <input
                type="checkbox"
                id="identity-confirm"
                checked={identityConfirmed}
                onChange={(e) => setIdentityConfirmed(e.target.checked)}
              />
              <label htmlFor="identity-confirm">
                I confirm that the above information is correct and belongs to me. I understand that providing false information may result in legal action.
              </label>
            </div>

            <div className="form-buttons">
              <button type="button" className="btn-previous" onClick={() => setCurrentStep(2)}>
                Previous
              </button>
              <button
                type="button"
                className="btn-next"
                onClick={handleConfirmIdentity}
                disabled={!identityConfirmed}
              >
                Confirm & Continue
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  // Step 4: Business / Activity Details
  const renderBusinessStep = () => (
    <div className="registration-form-content">
      <main className="reg-main">
        <div className="reg-circles">
          <div className="reg-circle reg-circle-1"></div>
          <div className="reg-circle reg-circle-2"></div>
          <div className="reg-circle reg-circle-3"></div>
        </div>

        <div className="reg-container">
          <div className="reg-form-box">
            <h1 className="reg-title">Business / Activity Details</h1>
            <p className="reg-subtitle">
              Tell us about your business operations.
            </p>

            {renderProgressSteps()}

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

            <form onSubmit={handleBusinessSubmit} className="reg-form">
              <div className="form-fields business-form-fields">
                <div className="field-group">
                  <label className="field-label">Trading Name / Business Name <span style={{color: 'red'}}>*</span></label>
                  <input
                    type="text"
                    name="tradingName"
                    className="field-input"
                    placeholder="Enter Trading Name"
                    value={businessData.tradingName}
                    onChange={handleBusinessChange}
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Type of Service / Sector</label>
                  <select
                    name="sector"
                    className="field-input field-select"
                    value={businessData.sector}
                    onChange={handleBusinessChange}
                  >
                    <option value="Digital Services (General)">Digital Services (General)</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Software & SaaS">Software & SaaS</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Online Education">Online Education</option>
                    <option value="Streaming Services">Streaming Services</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Retail">Retail</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="field-group field-group-full">
                  <label className="field-label">Website / Store URL</label>
                  <input
                    type="url"
                    name="website"
                    className="field-input"
                    placeholder="Enter Website / Store URL (optional)"
                    value={businessData.website}
                    onChange={handleBusinessChange}
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="terms-checkbox">
                <input
                  type="checkbox"
                  id="terms-accept"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <label htmlFor="terms-accept">
                  I hereby declare that the information provided herein is true and accurate to the best of my knowledge. I agree to the Terms & Conditions of the GRA e-VAT portal.
                </label>
              </div>

              <div className="form-buttons">
                <button type="button" className="btn-previous" onClick={() => setCurrentStep(3)}>
                  Previous
                </button>
                <button type="submit" className="btn-next" disabled={loading || !termsAccepted}>
                  {loading ? 'Submitting...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );

  // Step 5: Registration Complete
  const renderCompletedStep = () => (
    <div className="registration-form-content">
      <main className="reg-main">
        <div className="reg-circles">
          <div className="reg-circle reg-circle-1"></div>
          <div className="reg-circle reg-circle-2"></div>
          <div className="reg-circle reg-circle-3"></div>
        </div>

        <div className="reg-container">
          <div className="reg-form-box completed-box">
            <h1 className="reg-title">Registration Complete</h1>
            <p className="reg-subtitle">
              Your account has been created successfully.
            </p>

            {renderProgressSteps()}

            {/* Success Checkmark */}
            <div className="success-checkmark">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <h2 className="completion-title">Registration Complete !</h2>

            {/* TIN Card */}
            <div className="tin-card">
              <h3 className="tin-card-title">Your New TIN</h3>
              <p className="tin-number">{generatedTIN}</p>

              {/* QR Code */}
              <div className="qr-code-container">
                <img
                  src={`${QR_CODE_API_URL}?data=${encodeURIComponent(generatedTIN)}&size=150x150`}
                  alt="QR Code"
                  className="qr-code"
                />
                <p className="qr-label">Scan to download</p>
              </div>
            </div>

            {/* Login Info */}
            <div className="login-info-card">
              <h4>Your Login Credentials</h4>
              <p><strong>User ID (Email):</strong> {formData.email}</p>
              <p><strong>TIN:</strong> {generatedTIN}</p>
              <p className="note">Use your email and password to login to the portal.</p>
            </div>

            {/* Action Buttons */}
            <div className="completion-buttons">
              <button className="btn-download-certificate">
                Download Certificate
              </button>
              <button className="btn-go-dashboard" onClick={handleAutoLogin}>
                Login to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  // Render based on current step
  switch (currentStep) {
    case 1:
      return renderAccountStep();
    case 2:
      return renderIdentityStep();
    case 3:
      return renderConfirmIdentityStep();
    case 4:
      return renderBusinessStep();
    case 5:
      return renderCompletedStep();
    default:
      return renderAccountStep();
  }
};

export default ResidentRegistration;
