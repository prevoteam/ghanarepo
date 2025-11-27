import { useState, useEffect } from 'react';
import './Login.css';
import { loginApi } from '../utils/api';
import { useApi } from '../utils/useApi';

const Login = ({ onLoginSuccess, loginType = 'resident', onRegisterNow }) => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes
  const [timerInterval, setTimerInterval] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const { loading, error, execute, clearError } = useApi();

  const isNonResident = loginType === 'nonresident';

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const handleCloseModal = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setShowOtpModal(false);
    setOtp(['', '', '', '', '', '']);
    setTimer(300);
    clearError();
    setSuccessMessage('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');

    if (!credential.trim()) {
      return;
    }

    const result = await execute(loginApi.sendOTP, credential);

    if (result && result.success) {
      // Handle successful OTP send
      setUniqueId(result.data.unique_id || result.data.uniqueId || '');
      setShowOtpModal(true);
      setTimer(300);
      startTimer();

      // Show success message
      setSuccessMessage('OTP sent successfully to your registered email!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // For development, show OTP in console
      if (result.data.otpDev || result.data.otp) {
        console.log('Development OTP:', result.data.otpDev || result.data.otp);
      }
    }
  };

  const startTimer = () => {
    // Clear any existing interval
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

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    clearError();
    setSuccessMessage('');

    if (otpValue.length !== 6) {
      return;
    }

    const result = await execute(loginApi.verifyOTP, credential, otpValue);

    if (result && result.success) {
      // Clear timer interval
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      // Show success message
      setSuccessMessage('Login successful! Redirecting to dashboard...');

      // Close modal and redirect after a short delay
      setTimeout(() => {
        setShowOtpModal(false);
        const userId = result.data.unique_id || result.data.uniqueId;
        const userRole = result.data.user_role || 'maker';
        onLoginSuccess(userId, userRole);
      }, 1000);
    } else {
      // On error, clear OTP inputs for retry
      setOtp(['', '', '', '', '', '']);
      // Focus first input
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    }
  };

  const handleResendOTP = async () => {
    clearError();
    setSuccessMessage('');
    setOtp(['', '', '', '', '', '']);
    setTimer(300);

    const result = await execute(loginApi.sendOTP, credential);

    if (result && result.success) {
      startTimer();

      // Show success message
      setSuccessMessage('OTP resent successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // For development, show OTP in console
      if (result.data.otpDev || result.data.otp) {
        console.log('Development OTP (Resent):', result.data.otpDev || result.data.otp);
      }

      // Focus first OTP input
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendNonResidentOTP = async () => {
    clearError();
    setSuccessMessage('');

    if (!credential.trim()) {
      return;
    }

    const result = await execute(loginApi.sendNonResidentOTP, credential);

    if (result && result.success) {
      setOtpSent(true);
      setSuccessMessage('OTP sent successfully to your registered email!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleNonResidentLogin = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');

    if (!credential.trim() || !password.trim() || !securityCode.trim()) {
      return;
    }

    // Call the non-resident login API
    const result = await execute(loginApi.nonResidentLogin, credential, password, securityCode);

    if (result && result.success) {
      setSuccessMessage('Login successful! Redirecting to dashboard...');

      setTimeout(() => {
        const userId = result.data.unique_id || result.data.uniqueId || credential;
        const userRole = result.data.user_role || 'maker';
        onLoginSuccess(userId, userRole);
      }, 1000);
    }
  };

  return (
    <div className="login-container">
      {/* Login Form */}
      <div className="login-content">
        <div className="login-card">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Your detail will be verified by a secure OTP</p>

          {error && (
            <div className="error-message">
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
            <div className="success-message">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {successMessage}
            </div>
          )}

          {isNonResident ? (
            /* Non-Resident Merchant Login Form */
            <form onSubmit={handleNonResidentLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="tin">TIN</label>
                <input
                  id="tin"
                  type="text"
                  className="credential-input"
                  placeholder="Enter your TIN"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="credential-input"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="securityCode">Enter your OTP / Security Code</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    id="securityCode"
                    type="text"
                    className="credential-input"
                    placeholder="Enter OTP"
                    value={securityCode}
                    onChange={(e) => setSecurityCode(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-send-otp"
                    onClick={handleSendNonResidentOTP}
                    disabled={loading || !credential.trim()}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#d4a017',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
                {otpSent && (
                  <small style={{ color: '#28a745', marginTop: '5px', display: 'block' }}>
                    OTP sent to your registered email
                  </small>
                )}
              </div>

              <button type="submit" className="btn-login-submit" disabled={loading || !otpSent}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Logging in...
                  </>
                ) : (
                  'Login via OTP'
                )}
              </button>

              <div className="login-links">
                <button type="button" className="link-btn" onClick={() => console.log('Forgot password')}>
                  Forgot Password?
                </button>
                <button type="button" className="link-btn register-link" onClick={onRegisterNow}>
                  REGISTER NOW
                </button>
              </div>
            </form>
          ) : (
            /* Resident Login Form */
            <form onSubmit={handleSendOTP} className="login-form">
              <div className="form-group">
                <label htmlFor="credential">TIN / Ghana Card Number</label>
                <input
                  id="credential"
                  type="text"
                  className="credential-input"
                  placeholder="Enter your TIN or Ghana Card no."
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-login-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sending OTP...
                  </>
                ) : (
                  'Login via OTP'
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="modal-overlay">
          <div className="otp-modal">
            <button className="modal-close" onClick={handleCloseModal}>
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
              We've sent a 6-digit code to your registered email address
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
                  id={`otp-${index}`}
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
                'Verify & Login'
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
};

export default Login;
