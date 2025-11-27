import { useState } from 'react';
import './ConfigurationLogin.css';
import ConfigOTPVerification from './ConfigOTPVerification';
import ConfigDashboard from './ConfigDashboard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ConfigurationLogin = ({ onBack }) => {
  const [userRole, setUserRole] = useState('maker');
  const [tinNumber, setTinNumber] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [error, setError] = useState('');

  const handleLoginViaOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!tinNumber) {
      setError('Please enter TIN/Ghana Card Number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/monitoring/config-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tin_ghana_card: tinNumber,
          user_role: userRole
        }),
      });

      const data = await response.json();

      if (data.status) {
        setUniqueId(data.results.unique_id);
        setMaskedEmail(data.results.email);
        setShowOTPModal(true);
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = (role) => {
    setShowOTPModal(false);
    setShowDashboard(true);
  };

  if (showDashboard) {
    return <ConfigDashboard onBack={() => setShowDashboard(false)} userRole={userRole} />;
  }

  return (
    <div className="config-login-content">
      {/* Main Content Section */}
      <section className="config-login-main">
        {/* Decorative Circles */}
        <div className="decorative-circles">
          <div className="deco-circle deco-circle-1"></div>
          <div className="deco-circle deco-circle-2"></div>
          <div className="deco-circle deco-circle-3"></div>
          <div className="deco-circle deco-circle-4"></div>
          <div className="deco-circle deco-circle-5"></div>
        </div>

        {/* Back Button */}
        <button className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>

        {/* Login Card */}
        <div className="config-login-card">
          <h1 className="config-login-title">Configuration Login</h1>
          <p className="config-login-subtitle">
            Your detail will be verified by a secure OTP
          </p>

          <form onSubmit={handleLoginViaOTP}>
            {/* User Role Selection */}
            <div className="form-group">
              <label className="form-label">Select User Role</label>
              <div className="role-buttons">
                <button
                  type="button"
                  className={`role-btn ${userRole === 'maker' ? 'role-btn-active' : ''}`}
                  onClick={() => setUserRole('maker')}
                >
                  Maker
                </button>
                <button
                  type="button"
                  className={`role-btn ${userRole === 'checker' ? 'role-btn-active' : ''}`}
                  onClick={() => setUserRole('checker')}
                >
                  Checker
                </button>
              </div>
            </div>

            {/* TIN / Ghana Card Number */}
            <div className="form-group">
              <label className="form-label">TIN / Ghana Card Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your TIN or Ghana Card no."
                value={tinNumber}
                onChange={(e) => setTinNumber(e.target.value)}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ color: '#DC2626', fontSize: '14px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {/* Login Button */}
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Login via OTP'}
            </button>
          </form>
        </div>
      </section>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <ConfigOTPVerification
          contactInfo={maskedEmail}
          uniqueId={uniqueId}
          onClose={() => setShowOTPModal(false)}
          onVerified={handleOTPVerified}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default ConfigurationLogin;
