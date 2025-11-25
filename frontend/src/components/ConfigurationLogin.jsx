import { useState } from 'react';
import './ConfigurationLogin.css';
import ConfigOTPVerification from './ConfigOTPVerification';
import ConfigDashboard from './ConfigDashboard';

const ConfigurationLogin = ({ onBack }) => {
  const [userRole, setUserRole] = useState('maker');
  const [tinNumber, setTinNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginViaOTP = async (e) => {
    e.preventDefault();
    if (!tinNumber || !password) {
      alert('Please enter TIN/Ghana Card Number and Password');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowOTPModal(true);
    }, 500);
  };

  const handleOTPVerified = (role) => {
    setShowOTPModal(false);
    setShowDashboard(true);
  };

  if (showDashboard) {
    return <ConfigDashboard onBack={() => setShowDashboard(false)} userRole={userRole} />;
  }

  return (
    <div className="config-login-container">
      {/* Top Header */}
      <header className="top-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-circle">
              <svg width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="#F59E0B" />
                <text x="25" y="32" fontSize="20" fontWeight="bold" fill="#2D3B8F" textAnchor="middle">G</text>
              </svg>
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
        <button className="nav-item" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Register Now
        </button>
        <button className="nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Taxpayer Login
        </button>
        <button className="nav-item active">
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

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="forgot-password-wrapper">
                <button type="button" className="forgot-password-link">
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Login via OTP'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-text">Integrity. Fairness. Service</div>
          <div className="footer-copyright">© 2025 Ghana Revenue Authority. All rights reserved.</div>
          <button className="assistant-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Ask GRA Assistant
          </button>
        </div>
      </footer>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <ConfigOTPVerification
          contactInfo="megha@proteantech.com"
          onClose={() => setShowOTPModal(false)}
          onVerified={handleOTPVerified}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default ConfigurationLogin;
