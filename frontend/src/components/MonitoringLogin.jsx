import { useState } from 'react';
import './MonitoringLogin.css';
import MonitoringOTP from './MonitoringOTP';

const MonitoringLogin = ({ onBack, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    tinNumber: '',
    password: ''
  });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tinNumber) {
      setError('Please enter your TIN or Ghana Card Number');
      return;
    }
    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/v1/admin/monitoring/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tin_number: formData.tinNumber,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.status && data.code === 200) {
        sessionStorage.setItem('monitoring_session_id', data.results.session_id);
        sessionStorage.setItem('monitoring_email', data.results.email);
        setShowOTPModal(true);
      } else {
        setError(data.message || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      // For demo purposes, show OTP modal
      sessionStorage.setItem('monitoring_email', 'user@example.com');
      setShowOTPModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = (data) => {
    setShowOTPModal(false);
    onLoginSuccess(data);
  };

  return (
    <div className="mon-login-page">
      {/* Header */}
      <header className="mon-header">
        <div className="mon-header-content">
          <div className="mon-logo-section">
            <div className="mon-logo-circle">
              <svg width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#F59E0B" strokeWidth="4" />
                <text x="25" y="32" fontSize="18" fontWeight="bold" fill="#F59E0B" textAnchor="middle">G</text>
              </svg>
            </div>
            <div className="mon-logo-text">
              <div className="mon-title">GRA</div>
              <div className="mon-subtitle">GHANA REVENUE AUTHORITY</div>
            </div>
          </div>

          <div className="mon-header-right">
            <button className="mon-header-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Call Us
            </button>
            <button className="mon-header-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              About Us
            </button>
            <div className="mon-help-info">
              <div className="mon-help-label">Need Help?</div>
              <div className="mon-help-phone">+233 (0) 302 123 456</div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="mon-navigation">
        <button className="mon-nav-item" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Register Now
        </button>
        <button className="mon-nav-item" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          Taxpayer Login
        </button>
        <button className="mon-nav-item active">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          GRA Login
        </button>
        <button className="mon-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          Guidelines
        </button>
        <button className="mon-nav-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          FAQ
        </button>
      </nav>

      {/* Main Content */}
      <main className="mon-main">
        {/* Background Circles */}
        <div className="mon-bg-circles">
          <div className="mon-bg-circle mon-bg-circle-1"></div>
          <div className="mon-bg-circle mon-bg-circle-2"></div>
          <div className="mon-bg-circle mon-bg-circle-3"></div>
          <div className="mon-bg-circle mon-bg-circle-4"></div>
        </div>

        {/* Login Card */}
        <div className="mon-login-card">
          <h1 className="mon-card-title">Monitoring Login</h1>
          <p className="mon-card-subtitle">Your detail will be verified by a secure OTP</p>

          <form onSubmit={handleSubmit} className="mon-form">
            {error && (
              <div className="mon-error-message">{error}</div>
            )}

            <div className="mon-field-group">
              <label className="mon-field-label">TIN / Ghana Card Number</label>
              <input
                type="text"
                name="tinNumber"
                className="mon-field-input"
                placeholder="Enter your TIN or Ghana Card no."
                value={formData.tinNumber}
                onChange={handleChange}
              />
            </div>

            <div className="mon-field-group">
              <label className="mon-field-label">Password</label>
              <input
                type="password"
                name="password"
                className="mon-field-input"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button type="button" className="mon-forgot-link">Forgot Password?</button>
            </div>

            <button type="submit" className="mon-login-btn" disabled={isLoading}>
              {isLoading ? 'Please wait...' : 'Login via OTP'}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="mon-footer">
        <div className="mon-footer-content">
          <div className="mon-footer-text">Integrity. Fairness. Service</div>
          <div className="mon-footer-copyright">© 2025 Ghana Revenue Authority. All rights reserved.</div>
          <button className="mon-assistant-button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            Ask GRA Assistant
          </button>
        </div>
      </footer>

      {/* OTP Modal */}
      {showOTPModal && (
        <MonitoringOTP
          email={sessionStorage.getItem('monitoring_email') || 'user@example.com'}
          onVerified={handleOTPVerified}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </div>
  );
};

export default MonitoringLogin;
