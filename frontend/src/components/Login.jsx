import { useState, useEffect } from 'react';
import './Login.css';
import { loginApi } from '../utils/api';
import { useApi } from '../utils/useApi';

const Login = ({ onLoginSuccess }) => {
  const [credential, setCredential] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes
  const [timerInterval, setTimerInterval] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { loading, error, execute, clearError } = useApi();

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
        onLoginSuccess(result.data.unique_id || result.data.uniqueId);
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

  return (
    <div className="login-container">
      {/* Header */}
      <header className="login-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-circle">
              <span>O</span>
            </div>
            <div className="logo-text">
              <div className="gra-text">GRA</div>
              <div className="gra-subtext">GHANA REVENUE AUTHORITY</div>
            </div>
          </div>
          <div className="header-actions">
            <button className="header-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Call Us
            </button>
            <button className="header-btn">
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
      <nav className="login-nav">
        <button className="nav-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Register Now
        </button>
        <button className="nav-btn active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Taxpayer Login
        </button>
        <button className="nav-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          GRA Login
        </button>
        <button className="nav-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Guidelines
        </button>
        <button className="nav-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          FAQ
        </button>
      </nav>

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

      {/* Footer */}
      <footer className="login-footer">
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

export default Login;
